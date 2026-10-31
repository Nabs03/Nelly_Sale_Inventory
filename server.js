import express from "express"

import cors from "cors"

import Database from "better-sqlite3"

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

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

const db = new Database(DB_PATH)

db.exec(`
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
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    productName TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    total REAL NOT NULL,
    date TEXT NOT NULL
  );
`)

const insertSeedData = db.prepare("SELECT COUNT(*) AS total FROM products")

if (insertSeedData.get().total === 0) {
  const seedProducts = db.prepare(`
    INSERT INTO products (name, sku, category, price, cost, stock, sold, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const seedSales = db.prepare(`
    INSERT INTO sales (productId, productName, quantity, total, date)
    VALUES (?, ?, ?, ?, ?)
  `)

  db.transaction(() => {
    for (const product of starterProducts) {
      const result = seedProducts.run(
        product.name,
        product.sku,
        product.category,
        product.price,
        product.cost,
        product.stock,
        product.sold,
        product.color,
      )

      if (product.id === 1) {
        // keep original product ids for existing sales references
      }
    }

    for (const sale of starterSales) {
      seedSales.run(
        sale.productId,
        sale.productName,
        sale.quantity,
        sale.total,
        sale.date,
      )
    }
  })()
}

db.transaction(() => {
  const legacyProduct = db.prepare("SELECT id FROM products WHERE sku = ?")

  const conflictingSku = db.prepare(
    "SELECT id FROM products WHERE sku = ? AND id != ?",
  )

  const updateProduct = db.prepare(`
    UPDATE products SET name = ?, sku = ?, category = ?, color = ? WHERE id = ?
  `)

  const updateSales = db.prepare(
    "UPDATE sales SET productName = ? WHERE productName = ?",
  )

  starterProducts.forEach((product, index) => {
    const legacy = legacyProducts[index]

    updateSales.run(product.name, legacy.previousName)

    const existing = legacyProduct.get(legacy.sku)

    if (!existing) return

    const sku = conflictingSku.get(product.sku, existing.id)
      ? `${product.sku}-${existing.id}`
      : product.sku

    updateProduct.run(
      product.name,
      sku,
      product.category,
      product.color,
      existing.id,
    )
  })

  db.prepare(`
    UPDATE products
    SET category = CASE
      WHEN sku = 'BIG' THEN 'Big Pasta'
      WHEN sku IN ('CAK-1042', 'CAK-2214') THEN 'Ice cream Cakes'
      ELSE 'Desserts'
    END
    WHERE category NOT IN ('Big Pasta', 'Small Pasta', 'Ice cream Cakes', 'Desserts')
  `).run()
})()

const productRowToObject = (row) => ({
  id: row.id,

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

app.get("/api/products", (_req, res) => {
  const products = db
    .prepare("SELECT * FROM products ORDER BY id DESC")
    .all()
    .map(productRowToObject)

  res.json(products)
})

app.delete("/api/products", (_req, res) => {
  const result = db.prepare("DELETE FROM products").run()

  res.json({ success: true, removed: result.changes })
})

app.post("/api/products", (req, res) => {
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

  const insertProduct = db.prepare(`
    INSERT INTO products (name, sku, category, price, cost, stock, sold, color)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `)

  const colorList = [
    "#e8e0ff",
    "#d9f1eb",
    "#dceaff",
    "#ffeadb",
    "#ffe1e5",
    "#fff0c7",
  ]

  const createProduct = db.transaction(() => {
    const total = db
      .prepare("SELECT COUNT(*) AS total FROM products")
      .get().total
    const product = {
      name,
      sku: `PRD-${String(total + 1).padStart(4, "0")}`,
      category,
      price,
      cost,
      stock,
      color: colorList[total % colorList.length],
    }

    const info = insertProduct.run(
      product.name,
      product.sku,
      product.category,
      product.price,
      product.cost,
      product.stock,
      product.color,
    )

    return db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(info.lastInsertRowid)
  })

  const row = createProduct()

  res.status(201).json(productRowToObject(row))
})

app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id)

  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id)

  if (!existing) {
    return res.status(404).json({ message: "Product not found." })
  }

  db.prepare("DELETE FROM products WHERE id = ?").run(id)

  res.json({ success: true, removed: existing.name })
})

app.get("/api/sales", (_req, res) => {
  const sales = db
    .prepare("SELECT * FROM sales ORDER BY id DESC")
    .all()
    .map(saleRowToObject)

  res.json(sales)
})

app.delete("/api/sales", (_req, res) => {
  const resetSalesHistory = db.transaction(() => {
    const result = db.prepare("DELETE FROM sales").run()
    db.prepare("UPDATE products SET sold = 0").run()
    return result.changes
  })

  res.json({ success: true, removed: resetSalesHistory() })
})

app.post("/api/sales", (req, res) => {
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

  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(productId)

  if (!product) {
    return res.status(404).json({ message: "Product not found." })
  }

  const saleQty = quantity

  if (saleQty > Number(product.stock)) {
    return res
      .status(400)
      .json({ message: "Requested quantity exceeds available stock." })
  }

  const total = Number(product.price) * saleQty

  if (!Number.isFinite(total)) {
    return res
      .status(400)
      .json({ message: "Sale total is outside the supported range." })
  }

  db.transaction(() => {
    db.prepare(
      "UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?",
    ).run(saleQty, saleQty, product.id)

    const result = db.prepare(
      "INSERT INTO sales (productId, productName, quantity, total, date) VALUES (?, ?, ?, ?, ?)",
    )

    result.run(
      product.id,
      product.name,
      saleQty,
      total,
      new Date().toISOString(),
    )
  })()

  const sale = db.prepare("SELECT * FROM sales ORDER BY id DESC LIMIT 1").get()

  res.status(201).json(saleRowToObject(sale))
})

app.listen(PORT, () => {
  console.log(`Inventory backend running at http://localhost:${PORT}`)
})
