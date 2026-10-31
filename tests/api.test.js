import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { after, before, test } from "node:test"
import { mkdtempSync, rmSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const tempDirectory = mkdtempSync(path.join(os.tmpdir(), "inventory-api-"))
let server
let baseUrl

before(async () => {
  const portServer = createServer()
  await new Promise((resolve, reject) => {
    portServer.once("error", reject)
    portServer.listen(0, "127.0.0.1", resolve)
  })
  const { port } = portServer.address()
  await new Promise((resolve, reject) => {
    portServer.close((error) => (error ? reject(error) : resolve()))
  })

  baseUrl = `http://127.0.0.1:${port}`
  const env = {
    ...process.env,
    DB_PATH: path.join(tempDirectory, "inventory.db"),
    PORT: String(port),
    SEED_STARTER_DATA: "false",
  }
  delete env.TURSO_DATABASE_URL
  delete env.TURSO_AUTH_TOKEN
  delete env.VERCEL
  server = spawn(process.execPath, ["server.js"], {
    cwd: projectRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  })

  let output = ""
  server.stdout.on("data", (chunk) => (output += chunk))
  server.stderr.on("data", (chunk) => (output += chunk))

  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Inventory API exited before starting:\n${output}`)
    }

    try {
      const response = await fetch(`${baseUrl}/api/health`)
      if (response.ok) return
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  throw new Error(`Inventory API did not become ready:\n${output}`)
})

after(async () => {
  if (server && server.exitCode === null) {
    server.kill()
    await new Promise((resolve) => server.once("exit", resolve))
  }
  rmSync(tempDirectory, { recursive: true, force: true })
})

const request = async (path, options) => {
  const response = await fetch(`${baseUrl}${path}`, options)
  const body = await response.json()
  return { response, body }
}

const postJson = (path, body) =>
  request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })

test("inventory CRUD, sales, bulk clear, and history reset preserve expected data", async () => {
  const emptyProducts = await request("/api/products")
  assert.deepEqual(emptyProducts.body, [])
  assert.deepEqual((await request("/api/sales")).body, [])

  const createdFood = await postJson("/api/products", {
    name: "Test Cake",
    category: "Desserts",
    price: 100,
    cost: 40,
    stock: 3,
  })
  assert.equal(createdFood.response.status, 201)
  assert.equal(createdFood.body.sku, "PRD-0001")

  const sold = await postJson("/api/sales", {
    productId: createdFood.body.id,
    quantity: 2,
    total: 1,
  })
  assert.equal(sold.response.status, 201)
  assert.equal(sold.body.total, 200)

  const cleared = await request("/api/products", { method: "DELETE" })
  assert.equal(cleared.body.removed, 1)
  assert.deepEqual((await request("/api/products")).body, [])
  assert.equal((await request("/api/sales")).body.length, 1)

  const secondFood = await postJson("/api/products", {
    name: "Test Tart",
    category: "Ice cream Cakes",
    price: 80,
    cost: 25,
    stock: 5,
  })
  assert.equal(secondFood.response.status, 201)

  const secondSale = await postJson("/api/sales", {
    productId: secondFood.body.id,
    quantity: 2,
  })
  assert.equal(secondSale.response.status, 201)

  const reset = await request("/api/sales", { method: "DELETE" })
  assert.equal(reset.body.removed, 2)
  assert.deepEqual((await request("/api/sales")).body, [])

  const remainingProducts = await request("/api/products")
  assert.equal(remainingProducts.body.length, 1)
  assert.equal(remainingProducts.body[0].stock, 3)
  assert.equal(remainingProducts.body[0].sold, 0)
})
