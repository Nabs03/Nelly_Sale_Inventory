import express from "express"

import cors from "cors"

import { createClient } from "@libsql/client"

import fs from "fs"

import path from "path"

import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const app = express()

const PORT = process.env.PORT || 3001

const DB_PATH =
  process.env.DB_PATH || path.join(__dirname, "data", "inventory.db")

const starterProducts = [
  {
    id: 1,
    name: "Chocolate Fudge Cake",
    sku: "CAK-1042",
    category: "Ice cream Cakes",
    price: 129,
    cost: 72,
    stock: 24,
    sold: 46,
    color: "#e8e0ff",
  },

  {
    id: 2,
    name: "Butter Croissant",
    sku: "PAS-2086",
    category: "Desserts",
    price: 68,
    cost: 31,
    stock: 9,
    sold: 32,
    color: "#d9f1eb",
  },

  {
    id: 3,
    name: "Chocolate Chip Cookies",
    sku: "CKI-1178",
    category: "Desserts",
    price: 94,
    cost: 56,
    stock: 18,
    sold: 29,
    color: "#dceaff",
  },

  {
    id: 4,
    name: "Mango Cheesecake Cup",
    sku: "DES-3310",
    category: "Desserts",
    price: 75,
    cost: 38,
    stock: 4,
    sold: 61,
    color: "#ffeadb",
  },

  {
    id: 5,
    name: "Strawberry Shortcake Slice",
    sku: "CAK-2214",
    category: "Ice cream Cakes",
    price: 32,
    cost: 13,
    stock: 31,
    sold: 85,
    color: "#ffe1e5",
  },

  {
    id: 6,
    name: "Fudgy Brownie Bites",
    sku: "BRW-4062",
    category: "Desserts",
    price: 18,
    cost: 6,
    stock: 52,
    sold: 114,
    color: "#fff0c7",
  },
]

const starterSales = [
  {
    id: 1,
    productId: 1,
    productName: "Chocolate Fudge Cake",
    quantity: 2,
    total: 258,
    date: new Date().toISOString(),
  },

  {
    id: 2,
    productId: 5,
    productName: "Strawberry Shortcake Slice",
    quantity: 4,
    total: 128,
    date: new Date(Date.now() - 86400000).toISOString(),
  },

  {
    id: 3,
    productId: 6,
    productName: "Fudgy Brownie Bites",
    quantity: 8,
    total: 144,
    date: new Date(Date.now() - 172800000).toISOString(),
  },
]

const categories = ["Big Pasta", "Small Pasta", "Ice cream Cakes", "Desserts"]

const legacyProducts = [
  { sku: "ELE-1042", previousName: "Wireless Headphones" },

  { sku: "HOM-2086", previousName: "Aluminum Desk Lamp" },

  { sku: "ELE-1178", previousName: "Mechanical Keyboard" },

  { sku: "ACC-3310", previousName: "Everyday Backpack" },

  { sku: "HOM-2214", previousName: "Ceramic Travel Mug" },

  { sku: "OFF-4062", previousName: "A5 Grid Notebook" },
]

const toFiniteNumber = (value) => {
  if (
    typeof value !== "number" &&
    (typeof value !== "string" || value.trim() === "")
  )
    return NaN

  return Number(value)
}

if (!process.env.TURSO_DATABASE_URL) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
}

if (process.env.TURSO_DATABASE_URL && !process.env.TURSO_AUTH_TOKEN) {
  throw new Error("TURSO_AUTH_TOKEN is required with TURSO_DATABASE_URL.")
}

if (process.env.VERCEL && !process.env.TURSO_DATABASE_URL) {
  throw new Error("TURSO_DATABASE_URL is required for Vercel deployments.")
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${DB_PATH}`,
  ...(process.env.TURSO_AUTH_TOKEN
    ? { authToken: process.env.TURSO_AUTH_TOKEN }
    : {}),
})

const withWriteTransaction = async (operation) => {
  const transaction = await db.transaction("write")

  try {
    const result = await operation(transaction)
    await transaction.commit()
    return result
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

await db.execute(`
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

await db.execute(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    productName TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    total REAL NOT NULL,
    date TEXT NOT NULL
  )
`)

const productCount = Number(
  (await db.execute("SELECT COUNT(*) AS total FROM products")).rows[0].total,
)

if (
  productCount === 0 &&
  !process.env.TURSO_DATABASE_URL &&
  process.env.SEED_STARTER_DATA === "true"
) {
  await withWriteTransaction(async (transaction) => {
    for (const product of starterProducts) {
      await transaction.execute({
        sql: `
          INSERT INTO products (name, sku, category, price, cost, stock, sold, color)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          product.name,
          product.sku,
          product.category,
          product.price,
          product.cost,
          product.stock,
          product.sold,
          product.color,
        ],
      })
    }

    for (const sale of starterSales) {
      await transaction.execute({
        sql: `
          INSERT INTO sales (productId, productName, quantity, total, date)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [
          sale.productId,
          sale.productName,
          sale.quantity,
          sale.total,
          sale.date,
        ],
      })
    }
  })
}

if (!process.env.TURSO_DATABASE_URL) {
  await withWriteTransaction(async (transaction) => {
    for (const [index, product] of starterProducts.entries()) {
      const legacy = legacyProducts[index]

      await transaction.execute({
        sql: "UPDATE sales SET productName = ? WHERE productName = ?",
        args: [product.name, legacy.previousName],
      })

      const existing = (
        await transaction.execute({
          sql: "SELECT id FROM products WHERE sku = ?",
          args: [legacy.sku],
        })
      ).rows[0]

      if (!existing) continue

      const conflictingSku = (
        await transaction.execute({
          sql: "SELECT id FROM products WHERE sku = ? AND id != ?",
          args: [product.sku, existing.id],
        })
      ).rows[0]
      const sku = conflictingSku
        ? `${product.sku}-${Number(existing.id)}`
        : product.sku

      await transaction.execute({
        sql: `
          UPDATE products SET name = ?, sku = ?, category = ?, color = ? WHERE id = ?
        `,
        args: [product.name, sku, product.category, product.color, existing.id],
      })
    }

    await transaction.execute(`
      UPDATE products
      SET category = CASE
        WHEN sku = 'BIG' THEN 'Big Pasta'
        WHEN sku IN ('CAK-1042', 'CAK-2214') THEN 'Ice cream Cakes'
        ELSE 'Desserts'
      END
      WHERE category NOT IN ('Big Pasta', 'Small Pasta', 'Ice cream Cakes', 'Desserts')
    `)
  })
}

const productRowToObject = (row) => ({
  id: Number(row.id),

  name: row.name,

  sku: row.sku,

  category: row.category,

  price: Number(row.price),

  cost: Number(row.cost),

  stock: Number(row.stock),

  sold: Number(row.sold),

  color: row.color,
})

const saleRowToObject = (row) => ({
  id: row.id,

  productId: Number(row.productId),

  productName: row.productName,

  quantity: Number(row.quantity),

  total: Number(row.total),

  date: row.date,
})

app.use(cors())

app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Inventory API is running" })
})

app.get("/api/products", async (_req, res) => {
  const { rows } = await db.execute("SELECT * FROM products ORDER BY id DESC")

  res.json(rows.map(productRowToObject))
})

app.delete("/api/products", async (_req, res) => {
  const result = await db.execute("DELETE FROM products")

  res.json({ success: true, removed: result.rowsAffected })
})

app.post("/api/products", async (req, res) => {
  const payload = req.body || {}

  const name = typeof payload.name === "string" ? payload.name.trim() : ""

  const category = payload.category

  const price = toFiniteNumber(payload.price)

  const cost = toFiniteNumber(payload.cost)

  const stock = toFiniteNumber(payload.stock)

  if (
    !name ||
    !categories.includes(category) ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isFinite(cost) ||
    cost < 0 ||
    !Number.isSafeInteger(stock) ||
    stock < 0
  ) {
    return res.status(400).json({ message: "Valid product data is required." })
  }

  const colorList = [
    "#e8e0ff",
    "#d9f1eb",
    "#dceaff",
    "#ffeadb",
    "#ffe1e5",
    "#fff0c7",
  ]

  const row = await withWriteTransaction(async (transaction) => {
    const total = Number(
      (
        await transaction.execute("SELECT COUNT(*) AS total FROM products")
      ).rows[0].total,
    )
    const product = {
      name,
      sku: `PRD-${String(total + 1).padStart(4, "0")}`,
      category,
      price,
      cost,
      stock,
      color: colorList[total % colorList.length],
    }

    const info = await transaction.execute({
      sql: `
        INSERT INTO products (name, sku, category, price, cost, stock, sold, color)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
      `,
      args: [
        product.name,
        product.sku,
        product.category,
        product.price,
        product.cost,
        product.stock,
        product.color,
      ],
    })

    return (
      await transaction.execute({
        sql: "SELECT * FROM products WHERE id = ?",
        args: [info.lastInsertRowid],
      })
    ).rows[0]
  })

  res.status(201).json(productRowToObject(row))
})

app.delete("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id)

  const existing = (
    await db.execute({
      sql: "SELECT * FROM products WHERE id = ?",
      args: [id],
    })
  ).rows[0]

  if (!existing) {
    return res.status(404).json({ message: "Product not found." })
  }

  await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] })

  res.json({ success: true, removed: existing.name })
})

app.get("/api/sales", async (_req, res) => {
  const { rows } = await db.execute("SELECT * FROM sales ORDER BY id DESC")

  res.json(rows.map(saleRowToObject))
})

app.delete("/api/sales", async (_req, res) => {
  const removed = await withWriteTransaction(async (transaction) => {
    const result = await transaction.execute("DELETE FROM sales")
    await transaction.execute("UPDATE products SET sold = 0")
    return result.rowsAffected
  })

  res.json({ success: true, removed })
})

app.post("/api/sales", async (req, res) => {
  const payload = req.body || {}

  const productId = toFiniteNumber(payload.productId)

  const quantity = toFiniteNumber(payload.quantity)

  if (
    !Number.isSafeInteger(productId) ||
    productId < 1 ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1
  ) {
    return res.status(400).json({ message: "Valid sale data is required." })
  }

  const outcome = await withWriteTransaction(async (transaction) => {
    const product = (
      await transaction.execute({
        sql: "SELECT * FROM products WHERE id = ?",
        args: [productId],
      })
    ).rows[0]

    if (!product) {
      return { status: 404, message: "Product not found." }
    }

    const saleQty = quantity

    if (saleQty > Number(product.stock)) {
      return {
        status: 400,
        message: "Requested quantity exceeds available stock.",
      }
    }

    const total = Number(product.price) * saleQty

    if (!Number.isFinite(total)) {
      return {
        status: 400,
        message: "Sale total is outside the supported range.",
      }
    }

    await transaction.execute({
      sql: "UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?",
      args: [saleQty, saleQty, product.id],
    })

    await transaction.execute({
      sql: `
        INSERT INTO sales (productId, productName, quantity, total, date)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [
        product.id,
        product.name,
        saleQty,
        total,
        new Date().toISOString(),
      ],
    })

    const sale = (
      await transaction.execute(
        "SELECT * FROM sales ORDER BY id DESC LIMIT 1",
      )
    ).rows[0]

    return { sale }
  })

  if ("message" in outcome) {
    return res.status(outcome.status).json({ message: outcome.message })
  }

  res.status(201).json(saleRowToObject(outcome.sale))
})

export default app

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  app.listen(PORT, () => {
    console.log(`Inventory backend running at http://localhost:${PORT}`)
  })
}
