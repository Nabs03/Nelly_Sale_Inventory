import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react"

type View = "overview" | "products" | "add" | "remove" | "sell" | "reports"
type Category = "Big Pasta" | "Small Pasta" | "Ice cream Cakes" | "Desserts"

const categories: Category[] = [
  "Big Pasta",
  "Small Pasta",
  "Ice cream Cakes",
  "Desserts",
]

type Product = {
  id: number
  name: string
  sku: string
  category: Category
  price: number
  cost: number
  stock: number
  sold: number
  color: string
}

type Sale = {
  id: number
  productId: number
  productName: string
  quantity: number
  total: number
  date: string
}

const starterProducts: Product[] = [
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

const starterSales: Sale[] = [
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

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    box: (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z" />
        <path d="M12 11v10" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 2-1.6L21 7H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M14 7l5 5-5 5" />
      </>
    ),
    trend: (
      <>
        <path d="m3 17 6-6 4 4 8-9" />
        <path d="M15 6h6v6" />
      </>
    ),
    dollar: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M16 8.5c-.8-1-2-1.5-4-1.5-2.2 0-3.5 1.1-3.5 2.7 0 4.3 7.5 1.6 7.5 5.7 0 1.6-1.4 2.8-3.8 2.8-1.9 0-3.4-.6-4.2-1.8M12 5v14" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
    warning: (
      <>
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const money = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value)
const percentageOf = (value: number, total: number) =>
  total > 0 ? (value / total) * 100 : 0

function App() {
  const [view, setView] = useState<View>("overview")
  const [products, setProducts] = useState<Product[]>(starterProducts)
  const [sales, setSales] = useState<Sale[]>(starterSales)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [selectedId, setSelectedId] = useState(starterProducts[0]?.id ?? 0)
  const [sellQuantity, setSellQuantity] = useState(1)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState("")

  const loadInventory = async () => {
    try {
      const [productsResponse, salesResponse] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/sales"),
      ])

      if (!productsResponse.ok || !salesResponse.ok) {
        throw new Error("The inventory service returned an error.")
      }

      const [nextProducts, nextSales] = await Promise.all([
        productsResponse.json() as Promise<Product[]>,
        salesResponse.json() as Promise<Sale[]>,
      ])
      setProducts(nextProducts)
      setSelectedId((current) => current || nextProducts[0]?.id || 0)
      setSales(nextSales)
    } catch {
      setProducts(starterProducts)
      setSales(starterSales)
      notify("Could not connect to the inventory service. Showing sample data.")
    }
  }

  useEffect(() => {
    void loadInventory()
  }, [])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2800)
  }
  const totals = useMemo(() => {
    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const profit =
      sales.every((sale) =>
        products.some((product) => product.id === sale.productId),
      )
        ? sales.reduce((sum, sale) => {
            const product = products.find((item) => item.id === sale.productId)
            return sum + sale.total - sale.quantity * (product?.cost ?? 0)
          }, 0)
        : null
    return {
      revenue,
      profit,
      units: sales.reduce((sum, sale) => sum + sale.quantity, 0),
      inventory: products.reduce((sum, p) => sum + p.stock, 0),
    }
  }, [products, sales])
  const profitMargin =
    totals.profit === null
      ? null
      : Math.round(percentageOf(totals.profit, totals.revenue))
  const salesByProduct = useMemo(() => {
    const totalsByName = new Map<
      string,
      { name: string; revenue: number; quantity: number }
    >()

    sales.forEach((sale) => {
      const current = totalsByName.get(sale.productName) ?? {
        name: sale.productName,
        revenue: 0,
        quantity: 0,
      }
      current.revenue += sale.total
      current.quantity += sale.quantity
      totalsByName.set(sale.productName, current)
    })

    return [...totalsByName.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [sales])
  const filtered = products.filter(
    (product) =>
      (category === "All" || product.category === category) &&
      `${product.name} ${product.sku}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  const selected = products.find((p) => p.id === selectedId) ?? products[0]

  const navigate = (next: View) => {
    setView(next)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const addProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get("name") ?? "").trim()
    const categoryValue = String(
      data.get("category") ?? categories[0],
    ) as Category
    const price = Number(data.get("price"))
    const cost = Number(data.get("cost"))
    const stock = Number(data.get("stock"))

    if (
      !name ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(cost) ||
      cost < 0 ||
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      notify("Please fill in valid product details.")
      return
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category: categoryValue,
          price,
          cost,
          stock,
        }),
      })

      if (!response.ok) {
        const error = (await response.json()) as { message?: string }
        notify(error.message ?? "Unable to add product.")
        return
      }

      const next = (await response.json()) as Product
      setProducts((current) => [next, ...current])
      form.reset()
      notify(`${next.name} added to inventory`)
      navigate("products")
    } catch {
      notify("Unable to add product. Check your connection and try again.")
    }
  }

  const completeSale = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected || sellQuantity < 1 || sellQuantity > selected.stock) return

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selected.id,
          quantity: sellQuantity,
        }),
      })

      if (!response.ok) {
        const error = (await response.json()) as { message?: string }
        notify(error.message ?? "Unable to complete sale.")
        return
      }

      const nextSale = (await response.json()) as Sale
      setSales((current) => [nextSale, ...current])
      setProducts((current) =>
        current.map((product) =>
          product.id === selected.id
            ? {
                ...product,
                stock: product.stock - sellQuantity,
                sold: product.sold + sellQuantity,
              }
            : product,
        ),
      )
      notify(`Sale completed — ${money(nextSale.total)}`)
      setSellQuantity(1)
    } catch {
      notify("Unable to complete sale. Check your connection and try again.")
    }
  }

  const removeProduct = async (id: number) => {
    const product = products.find((p) => p.id === id)
    if (
      !product ||
      !window.confirm(`Remove ${product.name} from your food inventory?`)
    ) {
      return
    }

    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" })

      if (!response.ok) {
        notify("Unable to remove product.")
        return
      }

      setProducts((current) => current.filter((p) => p.id !== id))
      notify(`${product?.name} removed`)
    } catch {
      notify("Unable to remove product. Check your connection and try again.")
    }
  }

  const clearFoodInventory = async () => {
    if (!products.length) {
      notify("Food inventory is already empty.")
      return
    }

    if (
      !window.confirm(
        `Remove all ${products.length} food items? Your sales history will be kept.`,
      )
    ) {
      return
    }

    try {
      const response = await fetch("/api/products", { method: "DELETE" })
      if (!response.ok) {
        notify("Unable to clear food inventory.")
        return
      }

      setProducts([])
      setSelectedId(0)
      notify("Food inventory cleared. Sales history was kept.")
    } catch {
      notify("Unable to clear food inventory. Check your connection and try again.")
    }
  }

  const resetSalesHistory = async () => {
    if (!sales.length) {
      notify("Sales history is already empty.")
      return
    }

    if (
      !window.confirm(
        `Permanently delete all ${sales.length} sales records and reset sold counts? Food inventory and stock will be kept.`,
      )
    ) {
      return
    }

    try {
      const response = await fetch("/api/sales", { method: "DELETE" })
      if (!response.ok) {
        notify("Unable to reset sales history.")
        return
      }

      setSales([])
      setProducts((current) =>
        current.map((product) => ({ ...product, sold: 0 })),
      )
      notify("Sales history reset. Food inventory and stock were kept.")
    } catch {
      notify("Unable to reset sales history. Check your connection and try again.")
    }
  }

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "products", label: "Food", icon: "box" },
    { id: "add", label: "Add food", icon: "plus" },
    { id: "remove", label: "Remove food", icon: "trash" },
    { id: "sell", label: "Sell food", icon: "cart" },
    { id: "reports", label: "Reports", icon: "chart" },
  ]

  return (
    <div className="flex min-h-screen justify-center bg-[#e7ece9]">
      <div className="@container/mobile relative min-h-screen w-full max-w-[430px] overflow-hidden bg-[#f4f6f4] text-[#18322d] shadow-xl">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[248px] border-r border-[#dfe5e1] bg-[#f9faf8] px-5 py-6 transition-transform ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            left: menuOpen ? "max(0px, calc((100vw - 430px) / 2))" : "0px",
          }}
        >
          <div className="mb-10 flex items-center justify-between px-2">
            <button
              onClick={() => navigate("overview")}
              className="flex items-center gap-2.5"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-[#1d4f43] text-white">
                <Icon name="box" size={19} />
              </span>
              <span className="font-display text-[22px] font-bold tracking-[-0.04em]">
                Sweet Crumb
              </span>
            </button>
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg p-2"
            >
              <Icon name="close" />
            </button>
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                  view === item.id
                    ? "bg-[#dcebe5] text-[#16483d]"
                    : "text-[#66756f] hover:bg-white hover:text-[#18322d]"
                }`}
              >
                <Icon name={item.icon} size={19} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="absolute bottom-6 left-5 right-5 rounded-2xl bg-[#193e36] p-4 text-white">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-white/10">
              <Icon name="trend" size={18} />
            </div>
            <p className="text-sm font-semibold">Inventory health</p>
            <p className="mt-1 text-xs leading-5 text-white/60">
              {products.filter((p) => p.stock <= 10).length} food items need
              attention.
            </p>
            <button
              onClick={() => navigate("products")}
              className="mt-3 text-xs font-bold text-[#b9e6d6]"
            >
              Review stock →
            </button>
          </div>
        </aside>
        {menuOpen && (
          <button
            aria-label="Close navigation"
            className="fixed inset-y-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 bg-black/25"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <div>
          <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#e2e7e3] bg-[#f4f6f4]/90 px-4 backdrop-blur-xl @md/mobile:px-7">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
                className="rounded-xl border border-[#dce2de] bg-white p-2.5"
              >
                <Icon name="menu" size={19} />
              </button>
              <div className="hidden @md/mobile:block">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9892]">
                  Workspace
                </p>
                <p className="text-sm font-bold">Bakery</p>
              </div>
            </div>
            <div className="flex items-center gap-2 @md/mobile:gap-3">
              <div className="relative hidden @lg/mobile:block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#85928d]">
                  <Icon name="search" size={17} />
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => navigate("products")}
                  placeholder="Search inventory..."
                  className="w-64 rounded-xl border border-[#dce2de] bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#4f806f]"
                />
              </div>
              <button
                aria-label="Notifications"
                className="relative rounded-xl border border-[#dce2de] bg-white p-2.5 text-[#52635d]"
              >
                <Icon name="bell" size={18} />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e7835b]" />
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-[1440px] p-4 pb-24 @md/mobile:p-7">
            {view === "overview" && (
              <section className="animate-in">
                <div className="mb-7 flex flex-col justify-between gap-4 @md/mobile:flex-row @md/mobile:items-end">
                  <div>
                    <h1 className="font-display text-3xl font-bold tracking-[-0.045em] @md/mobile:text-[38px]">
                      Bakery inventory
                    </h1>
                    <p className="mt-2 text-sm text-[#71807b]">
                      Keep your cakes, pastries, and daily sales in one place.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("add")}
                    className="primary-button"
                  >
                    <Icon name="plus" size={18} /> Add Food
                  </button>
                </div>
                <div className="grid gap-3 @md/mobile:grid-cols-2 @2xl/mobile:grid-cols-4">
                  <Metric
                    label="Total revenue"
                    value={money(totals.revenue)}
                    note="From all recorded sales"
                    icon="dollar"
                    accent
                  />
                  <Metric
                    label="Units sold"
                    value={totals.units.toLocaleString()}
                    note="Across retained sales history"
                    icon="cart"
                  />
                  <Metric
                    label="Gross profit"
                    value={
                      totals.profit === null
                        ? "Unavailable"
                        : money(totals.profit)
                    }
                    note={
                      profitMargin === null
                        ? "Historical food cost is unavailable"
                        : `${profitMargin}% profit margin`
                    }
                    icon="trend"
                  />
                  <Metric
                    label="In stock"
                    value={totals.inventory.toLocaleString()}
                    note={`${products.filter((p) => p.stock <= 10).length} low-stock items`}
                    icon="box"
                    warning
                  />
                </div>
                <div className="mt-5">
                  <div className="panel overflow-hidden">
                    <PanelHead
                      title="Popular food"
                      subtitle="Your customer favorites"
                      action="View all"
                      onAction={() => navigate("products")}
                    />
                    <div className="divide-y divide-[#ebefec]">
                      {[...products]
                        .sort((a, b) => b.sold - a.sold)
                        .slice(0, 5)
                        .map((product) => (
                          <ProductRow
                            key={product.id}
                            product={product}
                            onSell={() => {
                              setSelectedId(product.id)
                              navigate("sell")
                            }}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {view === "products" && (
              <section className="animate-in">
                <PageTitle
                  title="Food"
                  subtitle={`${products.length} food items · ${totals.inventory} units in inventory`}
                  action={() => navigate("add")}
                />
                <div className="panel overflow-hidden">
                  <div className="flex flex-col gap-3 border-b border-[#e5eae7] p-4 @md/mobile:flex-row @md/mobile:items-center @md/mobile:justify-between">
                    <div className="relative flex-1 @md/mobile:max-w-sm">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#82908a]">
                        <Icon name="search" size={17} />
                      </span>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search name or SKU..."
                        className="input pl-10"
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {["All", ...categories].map((c) => (
                        <button
                          key={c}
                          onClick={() => setCategory(c)}
                          className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${
                            category === c
                              ? "bg-[#1d4f43] text-white"
                              : "bg-[#f0f3f1] text-[#687771]"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="hidden grid-cols-[1.8fr_.8fr_.7fr_.7fr_.7fr_80px] border-b border-[#e7ebe8] bg-[#f8faf8] px-5 py-3 text-[11px] font-bold uppercase tracking-[.08em] text-[#82908a] @lg/mobile:grid">
                    <span>Food</span>
                    <span>Category</span>
                    <span>Price</span>
                    <span>Stock</span>
                    <span>Sold</span>
                    <span />
                  </div>
                  <div className="divide-y divide-[#e9edea]">
                    {filtered.map((p) => (
                      <ProductTableRow
                        key={p.id}
                        product={p}
                        onSell={() => {
                          setSelectedId(p.id)
                          navigate("sell")
                        }}
                        onDelete={() => removeProduct(p.id)}
                      />
                    ))}
                  </div>
                  {!filtered.length && (
                    <div className="p-14 text-center text-sm text-[#7c8984]">
                      No food matches your search.
                    </div>
                  )}
                </div>
              </section>
            )}

            {view === "remove" && (
              <section className="animate-in">
                <PageTitle
                  title="Remove food"
                  subtitle="Choose an item to remove it from your inventory."
                />
                <div className="panel overflow-hidden">
                  <div className="flex items-center justify-between gap-3 border-b border-[#e7ebe8] px-5 py-5 @md/mobile:px-6">
                    <div>
                      <h2 className="font-display text-lg font-bold">
                        Food inventory
                      </h2>
                      <p className="mt-1 text-xs text-[#82908a]">
                        {products.length} food items
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void clearFoodInventory()}
                      disabled={!products.length}
                      className="rounded-lg border border-[#f0d7d1] bg-[#fff7f5] px-3 py-2 text-xs font-bold text-[#a44e3a]"
                    >
                      Remove all
                    </button>
                  </div>
                  {products.length ? (
                    <div className="divide-y divide-[#e9edea]">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 px-4 py-4 @md/mobile:px-5"
                        >
                          <ProductThumb product={product} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#7c8984]">
                              {product.category} · {product.stock} in stock
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void removeProduct(product.id)}
                            className="rounded-lg border border-[#f0d7d1] bg-[#fff7f5] px-3 py-2 text-xs font-bold text-[#a44e3a]"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-8 text-center text-sm text-[#7c8984]">
                      Your food inventory is empty.
                    </p>
                  )}
                </div>
              </section>
            )}

            {view === "add" && (
              <section className="animate-in mx-auto max-w-3xl">
                <div className="mb-7">
                  <button
                    onClick={() => navigate("products")}
                    className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#61716b]"
                  >
                    ← Back to products
                  </button>
                  <h1 className="page-heading">Add a new Food</h1>
                  <p className="page-subtitle">
                    Create a Food and add its opening stock to your inventory.
                  </p>
                </div>
                <form onSubmit={addProduct} className="panel overflow-hidden">
                  <div className="border-b border-[#e7ebe8] p-5 @md/mobile:p-7">
                    <h2 className="font-display text-lg font-bold">
                      Food details
                    </h2>
                    <p className="mt-1 text-sm text-[#7b8984]">
                      Fields marked with an asterisk are required.
                    </p>
                  </div>
                  <div className="grid gap-5 p-5 @md/mobile:grid-cols-2 @md/mobile:p-7">
                    <Field label="Product name *">
                      <input
                        required
                        name="name"
                        className="input"
                        placeholder="e.g. Chocolate fudge cake"
                      />
                    </Field>
                    <Field label="Category *">
                      <select required name="category" className="input">
                        {categories.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Opening stock *">
                      <input
                        required
                        min="0"
                        type="number"
                        name="stock"
                        className="input"
                        placeholder="0"
                      />
                    </Field>
                    <Field label="Selling price *">
                      <div className="relative">
                        <span className="input-prefix">₱</span>
                        <input
                          required
                          min="0"
                          step=".01"
                          type="number"
                          name="price"
                          className="input pl-9"
                          placeholder="0.00"
                        />
                      </div>
                    </Field>
                    <Field label="Cost per unit *">
                      <div className="relative">
                        <span className="input-prefix">₱</span>
                        <input
                          required
                          min="0"
                          step=".01"
                          type="number"
                          name="cost"
                          className="input pl-9"
                          placeholder="0.00"
                        />
                      </div>
                    </Field>
                  </div>
                  <div className="flex flex-col-reverse gap-3 border-t border-[#e7ebe8] bg-[#fafbfa] p-5 @md/mobile:flex-row @md/mobile:justify-end @md/mobile:p-6">
                    <button
                      type="button"
                      onClick={() => navigate("products")}
                      className="secondary-button"
                    >
                      Cancel
                    </button>
                    <button className="primary-button justify-center">
                      <Icon name="plus" size={18} /> Add to inventory
                    </button>
                  </div>
                </form>
              </section>
            )}

            {view === "sell" && (
              <section className="animate-in">
                <PageTitle
                  title="Sell products"
                  subtitle="Record a sale and automatically update your inventory."
                />
                <div className="grid gap-5 @xl/mobile:grid-cols-[1.15fr_.85fr]">
                  <div className="panel p-5 @md/mobile:p-7">
                    <h2 className="font-display text-lg font-bold">
                      Select a Food
                    </h2>
                    <p className="mt-1 text-sm text-[#7b8984]">
                      Choose an item from your available stock.
                    </p>
                    <div className="relative mt-5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#82908a]">
                        <Icon name="search" size={17} />
                      </span>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search inventory..."
                        className="input pl-10"
                      />
                    </div>
                    <div className="mt-4 max-h-[470px] space-y-2 overflow-y-auto pr-1">
                      {products
                        .filter(
                          (p) =>
                            p.stock > 0 &&
                            p.name.toLowerCase().includes(query.toLowerCase()),
                        )
                        .map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              setSelectedId(product.id)
                              setSellQuantity(1)
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                              selected?.id === product.id
                                ? "border-[#2b6858] bg-[#eef6f2] ring-1 ring-[#2b6858]"
                                : "border-[#e4e9e6] hover:border-[#aab8b2]"
                            }`}
                          >
                            <ProductThumb product={product} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold">
                                {product.name}
                              </span>
                              <span className="text-xs text-[#83908b]">
                                {product.stock} in stock · {product.sku}
                              </span>
                            </span>
                            <span className="font-display text-sm font-bold">
                              {money(product.price)}
                            </span>
                            {selected?.id === product.id && (
                              <span className="grid size-5 place-items-center rounded-full bg-[#286251] text-white">
                                <Icon name="check" size={13} />
                              </span>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                  <form
                    onSubmit={completeSale}
                    className="panel h-fit overflow-hidden @xl/mobile:sticky @xl/mobile:top-24"
                  >
                    <div className="bg-[#1c493e] p-5 text-white @md/mobile:p-6">
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-white/55">
                        Sale summary
                      </p>
                      <h2 className="mt-2 font-display text-xl font-bold">
                        Complete this sale
                      </h2>
                    </div>
                    {selected ? (
                      <div className="p-5 @md/mobile:p-6">
                        <div className="flex items-center gap-3 border-b border-[#e7ebe8] pb-5">
                          <ProductThumb product={selected} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">
                              {selected.name}
                            </p>
                            <p className="text-xs text-[#7c8984]">
                              {money(selected.price)} each
                            </p>
                          </div>
                        </div>
                        <Field label="Quantity">
                          <div className="mt-1 flex items-center rounded-xl border border-[#d9e0dc] p-1">
                            <button
                              type="button"
                              onClick={() =>
                                setSellQuantity(Math.max(1, sellQuantity - 1))
                              }
                              className="grid size-10 place-items-center rounded-lg bg-[#f0f3f1] text-lg"
                            >
                              −
                            </button>
                            <input
                              aria-label="Sale quantity"
                              value={sellQuantity}
                              onChange={(event) => {
                                const nextValue = Number(event.target.value)
                                if (!Number.isFinite(nextValue)) return
                                setSellQuantity(
                                  Math.min(
                                    selected.stock,
                                    Math.max(1, Math.floor(nextValue)),
                                  ),
                                )
                              }}
                              type="number"
                              min="1"
                              max={selected.stock}
                              className="min-w-0 flex-1 bg-transparent text-center font-bold outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setSellQuantity(
                                  Math.min(selected.stock, sellQuantity + 1),
                                )
                              }
                              className="grid size-10 place-items-center rounded-lg bg-[#f0f3f1] text-lg"
                            >
                              +
                            </button>
                          </div>
                          <p className="mt-2 text-xs text-[#84918c]">
                            {selected.stock} units available
                          </p>
                        </Field>
                        <div className="my-5 space-y-3 border-y border-[#e7ebe8] py-5 text-sm">
                          <div className="flex justify-between text-[#6f7e78]">
                            <span>Subtotal</span>
                            <span>{money(selected.price * sellQuantity)}</span>
                          </div>
                          <div className="flex justify-between text-[#6f7e78]">
                            <span>Tax</span>
                            <span>₱0</span>
                          </div>
                        </div>
                        <div className="mb-6 flex items-end justify-between">
                          <span className="font-bold">Total</span>
                          <span className="font-display text-3xl font-bold">
                            {money(selected.price * sellQuantity)}
                          </span>
                        </div>
                        <button
                          disabled={selected.stock === 0}
                          className="primary-button w-full justify-center py-3.5"
                        >
                          <Icon name="check" size={18} /> Complete sale
                        </button>
                      </div>
                    ) : (
                      <div className="p-10 text-center text-sm text-[#7b8984]">
                        Choose a Food to continue.
                      </div>
                    )}
                  </form>
                </div>
              </section>
            )}

            {view === "reports" && (
              <section className="animate-in">
                <PageTitle
                  title="Sales & reports"
                  subtitle="A clear view of your all-time sales performance."
                />
                <div className="mb-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void resetSalesHistory()}
                    disabled={!sales.length}
                    className="rounded-lg border border-[#f0d7d1] bg-[#fff7f5] px-3 py-2 text-xs font-bold text-[#a44e3a]"
                  >
                    Reset sales history
                  </button>
                </div>
                <div className="grid gap-3 @md/mobile:grid-cols-3">
                  <Metric
                    label="Overall sold amount"
                    value={money(totals.revenue)}
                    note={`${sales.length} recorded transactions`}
                    icon="dollar"
                    accent
                  />
                  <Metric
                    label="Units sold"
                    value={`${totals.units} units`}
                    note="From retained sales history"
                    icon="cart"
                  />
                  <Metric
                    label="Estimated profit"
                    value={
                      totals.profit === null
                        ? "Unavailable"
                        : money(totals.profit)
                    }
                    note={
                      totals.profit === null
                        ? "Historical food cost is unavailable"
                        : "Revenue minus product cost"
                    }
                    icon="trend"
                  />
                </div>
                <div className="mt-5 grid gap-5 @2xl/mobile:grid-cols-[1fr_.65fr]">
                  <div className="panel overflow-hidden">
                    <PanelHead
                      title="Recent transactions"
                      subtitle={`${sales.length} recorded sales`}
                    />
                    <div className="divide-y divide-[#e8ece9]">
                      {sales.map((sale) => (
                        <div
                          key={sale.id}
                          className="flex items-center gap-3 px-5 py-4"
                        >
                          <span className="grid size-10 place-items-center rounded-xl bg-[#e5f1ec] text-[#2d6757]">
                            <Icon name="cart" size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">
                              {sale.productName}
                            </p>
                            <p className="text-xs text-[#82908a]">
                              {new Date(sale.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}{" "}
                              · {sale.quantity} unit
                              {sale.quantity > 1 ? "s" : ""}
                            </p>
                          </div>
                          <p className="font-display font-bold">
                            {money(sale.total)}
                          </p>
                        </div>
                      ))}
                      {!sales.length && (
                        <p className="p-8 text-center text-sm text-[#7c8984]">
                          No sales history yet.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="panel p-5 @md/mobile:p-6">
                    <h2 className="font-display text-lg font-bold">
                      Sales by product
                    </h2>
                    <p className="mt-1 text-sm text-[#7b8984]">
                      All recorded sales, including removed foods
                    </p>
                    <div className="mt-6 space-y-5">
                      {salesByProduct.map((product) => {
                          const contributionPercent =
                            totals.revenue > 0
                              ? percentageOf(product.revenue, totals.revenue)
                              : 0
                          return (
                            <div key={product.name}>
                              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                                <span className="truncate font-bold">
                                  {product.name}
                                </span>
                                <span className="text-[#6f7e78]">
                                  {money(product.revenue)}
                                </span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-[#e9eeeb]">
                                <div
                                  className="h-full rounded-full bg-[#75a793]"
                                  style={{
                                    width: `${
                                      contributionPercent > 0
                                        ? Math.max(8, contributionPercent)
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      {!salesByProduct.length && (
                        <p className="text-sm text-[#7c8984]">
                          No sales history to summarize.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>

        <nav className="fixed bottom-0 left-1/2 z-20 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-6 border-t border-[#dce3df] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-1 py-2 text-[10px] font-bold ${
                view === item.id ? "text-[#1d5748]" : "text-[#82908a]"
              }`}
            >
              <Icon name={item.icon} size={19} />
              <span>
                {item.id === "add"
                  ? "Add"
                  : item.id === "remove"
                    ? "Remove"
                    : item.id === "sell"
                      ? "Sell"
                      : item.label}
              </span>
            </button>
          ))}
        </nav>
        {toast && (
          <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#173d34] px-4 py-3 text-sm font-semibold text-white shadow-2xl">
            <span className="grid size-5 place-items-center rounded-full bg-white/15">
              <Icon name="check" size={13} />
            </span>
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  note,
  icon,
  accent,
  warning,
}: {
  label: string
  value: string
  note: string
  icon: string
  accent?: boolean
  warning?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-[#1e5044] bg-[#1e5044] text-white"
          : "border-[#e0e6e2] bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <p
          className={`text-xs font-bold uppercase tracking-[.09em] ${
            accent ? "text-white/55" : "text-[#81908a]"
          }`}
        >
          {label}
        </p>
        <span
          className={`grid size-9 place-items-center rounded-xl ${
            accent
              ? "bg-white/10"
              : warning
                ? "bg-[#fff0e8] text-[#c46844]"
                : "bg-[#e7f1ed] text-[#397361]"
          }`}
        >
          <Icon name={icon} size={17} />
        </span>
      </div>
      <p className="mt-4 font-display text-[28px] font-bold tracking-[-0.035em]">
        {value}
      </p>
      <p
        className={`mt-1 text-xs ${
          accent
            ? "text-[#b7d3ca]"
            : warning
              ? "font-semibold text-[#c36c49]"
              : "text-[#81908a]"
        }`}
      >
        {note}
      </p>
    </div>
  )
}

function ProductThumb({ product }: { product: Product }) {
  return (
    <span
      style={{ backgroundColor: product.color }}
      className="grid size-11 shrink-0 place-items-center rounded-xl text-[#38564d]"
    >
      <Icon
        name={product.category === "Ice cream Cakes" ? "box" : "grid"}
        size={20}
      />
    </span>
  )
}

function ProductRow({
  product,
  onSell,
}: {
  product: Product
  onSell: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 @md/mobile:px-6">
      <ProductThumb product={product} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{product.name}</p>
        <p className="mt-0.5 text-xs text-[#87938f]">
          {product.sold} units sold
        </p>
      </div>
      <div className="hidden text-right @md/mobile:block">
        <p className="text-sm font-bold">
          {money(product.sold * product.price)}
        </p>
        <p
          className={`text-xs ${
            product.stock <= 10
              ? "font-semibold text-[#c46a48]"
              : "text-[#87938f]"
          }`}
        >
          {product.stock} in stock
        </p>
      </div>
      <button
        onClick={onSell}
        aria-label={`Sell ${product.name}`}
        className="rounded-lg p-2 text-[#597068] hover:bg-[#eff3f0]"
      >
        <Icon name="arrow" size={17} />
      </button>
    </div>
  )
}

function ProductTableRow({
  product,
  onSell,
  onDelete,
}: {
  product: Product
  onSell: () => void
  onDelete: () => void
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 @lg/mobile:grid-cols-[1.8fr_.8fr_.7fr_.7fr_.7fr_80px] @lg/mobile:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <ProductThumb product={product} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{product.name}</p>
          <p className="text-xs text-[#86938e]">{product.sku}</p>
        </div>
      </div>
      <div className="hidden text-xs font-semibold text-[#62716b] @lg/mobile:block">
        {product.category}
      </div>
      <div className="hidden text-sm font-bold @lg/mobile:block">
        {money(product.price)}
      </div>
      <div className="hidden @lg/mobile:block">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            product.stock <= 10
              ? "bg-[#fff0e8] text-[#b95f3d]"
              : "bg-[#e8f3ee] text-[#3d735f]"
          }`}
        >
          {product.stock} units
        </span>
      </div>
      <div className="hidden text-sm font-semibold text-[#62716b] @lg/mobile:block">
        {product.sold}
      </div>
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={onSell}
          className="rounded-lg bg-[#e5f0ec] px-3 py-2 text-xs font-bold text-[#2a6454] @lg/mobile:px-2"
        >
          Sell
        </button>
        <button
          onClick={onDelete}
          aria-label={`Delete ${product.name}`}
          className="hidden rounded-lg p-2 text-[#9a6960] hover:bg-[#fff0ed] @lg/mobile:block"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
      <div className="col-span-2 flex items-center justify-between pl-14 text-xs text-[#7c8984] @lg/mobile:hidden">
        <span>
          {product.category} · {product.stock} in stock
        </span>
        <span className="font-bold text-[#18322d]">{money(product.price)}</span>
      </div>
    </div>
  )
}

function PanelHead({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string
  subtitle: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#e7ebe8] px-5 py-5 @md/mobile:px-6">
      <div>
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <p className="mt-1 text-xs text-[#82908a]">{subtitle}</p>
      </div>
      {action && (
        <button onClick={onAction} className="text-xs font-bold text-[#3b6f60]">
          {action} →
        </button>
      )}
    </div>
  )
}

function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: () => void
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 @md/mobile:flex-row @md/mobile:items-end">
      <div>
        <h1 className="page-heading">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {action && (
        <button onClick={action} className="primary-button">
          <Icon name="plus" size={18} /> Add product
        </button>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#455b54]">
        {label}
      </span>
      {children}
    </label>
  )
}

export default App
