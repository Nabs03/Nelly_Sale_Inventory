import { createClient } from "@libsql/client"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, "..")
const localDbPath = path.resolve(
  process.env.DB_PATH || path.join(projectDirectory, "data", "inventory.db"),
)

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error(
    "Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before importing data.",
  )
}

if (!fs.existsSync(localDbPath)) {
  throw new Error(`Local inventory database not found: ${localDbPath}`)
}

const source = createClient({ url: `file:${localDbPath}` })
const destination = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const closeClients = () => {
  source.close()
  destination.close()
}

try {
  await destination.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      cost REAL NOT NULL,
      stock INTEGER NOT NULL,
      sold INTEGER NOT NULL DEFAULT 0,
      color TEXT NOT NULL
    )
  `)
  await destination.execute(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      productName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      total REAL NOT NULL,
      date TEXT NOT NULL
    )
  `)

  const [localProducts, localSales, remoteProducts, remoteSales] =
    await Promise.all([
      source.execute("SELECT * FROM products ORDER BY id"),
      source.execute("SELECT * FROM sales ORDER BY id"),
      destination.execute("SELECT COUNT(*) AS total FROM products"),
      destination.execute("SELECT COUNT(*) AS total FROM sales"),
    ])

  if (
    Number(remoteProducts.rows[0].total) !== 0 ||
    Number(remoteSales.rows[0].total) !== 0
  ) {
    throw new Error(
      "Turso database is not empty. Import stopped to avoid duplicating or overwriting data.",
    )
  }

  await destination.batch(
    [
      ...localProducts.rows.map((product) => ({
        sql: `
          INSERT INTO products
            (id, name, sku, category, price, cost, stock, sold, color)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          product.id,
          product.name,
          product.sku,
          product.category,
          product.price,
          product.cost,
          product.stock,
          product.sold,
          product.color,
        ],
      })),
      ...localSales.rows.map((sale) => ({
        sql: `
          INSERT INTO sales (id, productId, productName, quantity, total, date)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
          sale.id,
          sale.productId,
          sale.productName,
          sale.quantity,
          sale.total,
          sale.date,
        ],
      })),
    ],
    "write",
  )

  console.log(
    `Imported ${localProducts.rows.length} food items and ${localSales.rows.length} sales records.`,
  )
} finally {
  closeClients()
}
