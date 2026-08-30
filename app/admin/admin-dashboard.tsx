"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { AlertTriangle, Banknote, Boxes, CircleDollarSign, LayoutDashboard, LogOut, MessageSquare, Package, Plus, RefreshCw, Save, ShoppingBag, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CommerceOrder, CommerceOverview, CommerceProduct, CommerceQuestion } from "@/lib/commerce-types";

const chartConfig = { revenue: { label: "Revenue", color: "#6e1f2d" } } satisfies ChartConfig;
const emptyProduct: CommerceProduct = { id: "", sku: "", slug: "", name: "", category: "Polos", productType: "Garment", description: "", image: "/catalog/court-polo-k.webp", price: 0, compareAtPrice: null, cost: 0, active: true, featured: false, trackInventory: true, createdAt: "", updatedAt: "" };

function money(amount: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount / 100);
}

function Status({ value }: { value: string }) {
  return <span className={`admin-status status-${value.replace(/_/g, "-")}`}>{value.replace(/_/g, " ")}</span>;
}

export default function AdminDashboard({ user }: { user: { email: string; displayName: string } }) {
  const [data, setData] = useState<CommerceOverview | null>(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const [productEditor, setProductEditor] = useState<CommerceProduct | null>(null);
  const [tab, setTab] = useState("overview");

  const load = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/commerce", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Commerce data could not be loaded.");
      setData(payload);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Commerce data could not be loaded.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const mutate = async (payload: Record<string, unknown>, success: string) => {
    setMessage("");
    try {
      const response = await fetch("/api/admin/commerce", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "The change could not be saved.");
      setMessage(success);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The change could not be saved.");
    }
  };

  const sales = useMemo(() => data?.sales.map((item) => ({ ...item, label: new Date(`${item.date}T12:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) })) ?? [], [data]);

  return <main className="admin-page">
    <aside className="admin-sidebar">
      <Link href="/" className="admin-brand" aria-label="KALËTHON storefront"><span>K</span><b>KALËTHON</b></Link>
      <div className="admin-sidebar-copy"><small>Commerce operating system</small><strong>Control room</strong></div>
      <nav aria-label="Administration sections">
        <button type="button" className={tab === "overview" ? "is-active" : ""} onClick={() => setTab("overview")}><LayoutDashboard />Overview</button><button type="button" className={tab === "products" ? "is-active" : ""} onClick={() => setTab("products")}><Package />Products</button><button type="button" className={tab === "orders" ? "is-active" : ""} onClick={() => setTab("orders")}><ShoppingBag />Orders</button><button type="button" className={tab === "inventory" ? "is-active" : ""} onClick={() => setTab("inventory")}><Boxes />Inventory</button><button type="button" className={tab === "questions" ? "is-active" : ""} onClick={() => setTab("questions")}><MessageSquare />Questions</button>
      </nav>
      <div className="admin-user"><span>{user.displayName.slice(0, 1).toUpperCase()}</span><div><b>{user.displayName}</b><small>{user.email}</small></div></div>
      <a className="admin-signout" href="/signout-with-chatgpt?return_to=/"><LogOut />Sign out</a>
    </aside>

    <section className="admin-workspace">
      <header className="admin-topbar"><div><p>KALËTHON operations</p><h1>{tab === "overview" ? "Commerce overview" : tab === "inventory" ? "Inventory and availability" : `${tab.slice(0, 1).toUpperCase()}${tab.slice(1)}`}</h1></div><div><Link href="/" target="_blank">View store ↗</Link><button type="button" onClick={() => void load()} disabled={busy}><RefreshCw />Refresh</button></div></header>
      {message && <p className="admin-message" role="status">{message}</p>}
      {busy && !data ? <div className="admin-loading">Loading product, order and stock data…</div> : null}
      {data ? <Tabs value={tab} onValueChange={setTab} className="admin-tabs">
        <TabsList className="admin-mobile-tabs" variant="line">
          <TabsTrigger value="overview"><LayoutDashboard />Overview</TabsTrigger><TabsTrigger value="products"><Package />Products</TabsTrigger><TabsTrigger value="orders"><ShoppingBag />Orders</TabsTrigger><TabsTrigger value="inventory"><Boxes />Stock</TabsTrigger><TabsTrigger value="questions"><MessageSquare />Inbox</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" id="overview">
          <div className="admin-kpi-grid">
            <article><span><CircleDollarSign /></span><small>Revenue / 30 days</small><strong>{money(data.kpis.revenue30)}</strong><p>{data.kpis.orders30} paid orders</p></article>
            <article><span><TrendingUp /></span><small>Gross profit estimate</small><strong>{money(data.kpis.grossProfit30)}</strong><p>Revenue less product cost</p></article>
            <article><span><Banknote /></span><small>Average order</small><strong>{money(data.kpis.averageOrder)}</strong><p>Paid orders only</p></article>
            <article><span><ShoppingBag /></span><small>Open orders</small><strong>{data.kpis.openOrders}</strong><p>Require fulfilment</p></article>
            <article className={data.kpis.lowStock + data.kpis.outOfStock ? "is-warning" : ""}><span><AlertTriangle /></span><small>Stock attention</small><strong>{data.kpis.lowStock + data.kpis.outOfStock}</strong><p>{data.kpis.outOfStock} out of stock</p></article>
            <article><span><MessageSquare /></span><small>Open questions</small><strong>{data.kpis.openQuestions}</strong><p>Customer service queue</p></article>
          </div>
          <div className="admin-overview-grid">
            <article className="admin-panel admin-chart-panel"><div className="admin-panel-heading"><div><small>Last 30 days</small><h2>Sales movement</h2></div><b>{money(data.kpis.revenue30)}</b></div>
              {sales.length ? <ChartContainer config={chartConfig} className="admin-chart"><BarChart data={sales} accessibilityLayer><CartesianGrid vertical={false} stroke="#ded7ce" /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `£${Number(value) / 100}`} /><ChartTooltip content={<ChartTooltipContent formatter={(value) => money(Number(value))} />} /><Bar dataKey="revenue" fill="var(--color-revenue)" radius={[3,3,0,0]} /></BarChart></ChartContainer> : <div className="admin-empty-chart">Sales appear here after the first paid Stripe order.</div>}
            </article>
            <article className="admin-panel"><div className="admin-panel-heading"><div><small>Inventory alerts</small><h2>Stock requiring action</h2></div><button type="button" className="admin-text-action" onClick={() => setTab("inventory")}>Manage ↗</button></div>
              <div className="admin-alert-list">{data.inventory.filter((item) => item.available <= item.reorderPoint).slice(0,6).map((item) => <div key={item.id}><span className={item.available <= 0 ? "is-out" : ""}>{item.available}</span><div><b>{item.productName}</b><small>{item.sku} · reorder at {item.reorderPoint}</small></div></div>)}{!data.inventory.some((item) => item.available <= item.reorderPoint) && <p>Every tracked product is above its reorder point.</p>}</div>
            </article>
          </div>
          <section className="admin-panel admin-recent"><div className="admin-panel-heading"><div><small>Live operations</small><h2>Recent orders</h2></div><button type="button" className="admin-text-action" onClick={() => setTab("orders")}>All orders ↗</button></div><OrdersTable orders={data.orders.slice(0,8)} mutate={mutate} compact /></section>
        </TabsContent>

        <TabsContent value="products" id="products">
          <section className="admin-panel"><div className="admin-panel-heading"><div><small>Catalogue</small><h2>Products and pricing</h2></div><button type="button" onClick={() => setProductEditor({ ...emptyProduct })}><Plus />Add product</button></div>
            <Table className="admin-table"><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Cost</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader><TableBody>{data.products.map((product) => <TableRow key={product.id}><TableCell><b>{product.name}</b><small>{product.productType}</small></TableCell><TableCell>{product.sku}</TableCell><TableCell>{product.category}</TableCell><TableCell>{money(product.price)}</TableCell><TableCell>{money(product.cost)}</TableCell><TableCell><Status value={product.active ? "active" : "archived"} /></TableCell><TableCell><button type="button" className="admin-table-action" onClick={() => setProductEditor({ ...product })}>Edit</button></TableCell></TableRow>)}</TableBody></Table>
          </section>
          {productEditor && <ProductEditor product={productEditor} setProduct={setProductEditor} close={() => setProductEditor(null)} save={async () => { await mutate({ action: "save_product", product: productEditor }, "Product saved."); setProductEditor(null); }} archive={productEditor.id ? async () => { await mutate({ action: "archive_product", id: productEditor.id }, "Product archived."); setProductEditor(null); } : undefined} />}
        </TabsContent>

        <TabsContent value="orders" id="orders"><section className="admin-panel"><div className="admin-panel-heading"><div><small>Sales</small><h2>Orders and fulfilment</h2></div><b>{data.orders.length} orders</b></div><OrdersTable orders={data.orders} mutate={mutate} /></section></TabsContent>

        <TabsContent value="inventory" id="inventory"><section className="admin-panel"><div className="admin-panel-heading"><div><small>Stock control</small><h2>Inventory and availability</h2></div><b>{data.kpis.outOfStock} out of stock</b></div><Table className="admin-table"><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Variant</TableHead><TableHead>On hand</TableHead><TableHead>Reserved</TableHead><TableHead>Available</TableHead><TableHead>Adjust</TableHead></TableRow></TableHeader><TableBody>{data.inventory.map((item) => <TableRow key={item.id}><TableCell><b>{item.productName}</b><small>Updated {new Date(item.updatedAt).toLocaleDateString("en-GB")}</small></TableCell><TableCell>{item.sku}</TableCell><TableCell>{item.optionName}</TableCell><TableCell>{item.stockOnHand}</TableCell><TableCell>{item.stockReserved}</TableCell><TableCell><Status value={item.available <= 0 ? "out_of_stock" : item.available <= item.reorderPoint ? "low_stock" : "in_stock"} /> <b>{item.available}</b></TableCell><TableCell><div className="admin-stock-actions"><button type="button" onClick={() => void mutate({ action: "adjust_stock", id: item.id, quantity: -1 }, "Stock adjusted.")}>−1</button><button type="button" onClick={() => void mutate({ action: "adjust_stock", id: item.id, quantity: 1 }, "Stock adjusted.")}>+1</button><button type="button" onClick={() => void mutate({ action: "adjust_stock", id: item.id, quantity: 10 }, "Stock adjusted.")}>+10</button></div></TableCell></TableRow>)}</TableBody></Table></section></TabsContent>

        <TabsContent value="questions" id="questions"><section className="admin-panel"><div className="admin-panel-heading"><div><small>Client service</small><h2>Questions and enquiries</h2></div><b>{data.kpis.openQuestions} open</b></div><Table className="admin-table admin-question-table"><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Question</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Received</TableHead></TableRow></TableHeader><TableBody>{data.questions.map((question) => <QuestionRow question={question} mutate={mutate} key={question.id} />)}{data.questions.length === 0 && <TableRow><TableCell colSpan={5}>Questions sent through the contact form appear here.</TableCell></TableRow>}</TableBody></Table></section></TabsContent>
      </Tabs> : null}
    </section>
  </main>;
}

function OrdersTable({ orders, mutate, compact = false }: { orders: CommerceOrder[]; mutate: (payload: Record<string, unknown>, success: string) => Promise<void>; compact?: boolean }) {
  return <Table className="admin-table"><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead><TableHead>Order status</TableHead><TableHead>Fulfilment</TableHead><TableHead>Date</TableHead></TableRow></TableHeader><TableBody>{orders.map((order) => <TableRow key={order.id}><TableCell><b>{order.orderNumber}</b></TableCell><TableCell><b>{order.customerName || "Customer"}</b><small>{order.customerEmail}</small></TableCell><TableCell>{money(order.total, order.currency.toUpperCase())}</TableCell><TableCell><Status value={order.paymentStatus} /></TableCell><TableCell>{compact ? <Status value={order.status} /> : <select value={order.status} onChange={(event) => void mutate({ action: "update_order", id: order.id, status: event.target.value, fulfilmentStatus: order.fulfilmentStatus }, "Order status updated.")}>{["new","confirmed","in_production","completed","cancelled","refunded"].map((value) => <option value={value} key={value}>{value.replace(/_/g," ")}</option>)}</select>}</TableCell><TableCell>{compact ? <Status value={order.fulfilmentStatus} /> : <select value={order.fulfilmentStatus} onChange={(event) => void mutate({ action: "update_order", id: order.id, status: order.status, fulfilmentStatus: event.target.value }, "Fulfilment status updated.")}>{["unfulfilled","processing","packed","shipped","delivered","returned"].map((value) => <option value={value} key={value}>{value}</option>)}</select>}</TableCell><TableCell>{new Date(order.createdAt).toLocaleDateString("en-GB")}</TableCell></TableRow>)}{orders.length === 0 && <TableRow><TableCell colSpan={7}>Paid Stripe orders will appear here automatically.</TableCell></TableRow>}</TableBody></Table>;
}

function QuestionRow({ question, mutate }: { question: CommerceQuestion; mutate: (payload: Record<string, unknown>, success: string) => Promise<void> }) {
  return <TableRow><TableCell><b>{question.customerName}</b><small><a href={`mailto:${question.customerEmail}?subject=${encodeURIComponent(`Re: ${question.subject}`)}`}>{question.customerEmail}</a>{question.orderNumber ? ` · ${question.orderNumber}` : ""}</small></TableCell><TableCell className="admin-question-copy"><b>{question.subject}</b><small>{question.message}</small></TableCell><TableCell><select value={question.priority} onChange={(event) => void mutate({ action: "update_question", id: question.id, priority: event.target.value, status: question.status }, "Question updated.")}>{["low","normal","high","urgent"].map((value) => <option value={value} key={value}>{value}</option>)}</select></TableCell><TableCell><select value={question.status} onChange={(event) => void mutate({ action: "update_question", id: question.id, priority: question.priority, status: event.target.value }, "Question updated.")}>{["open","waiting","closed"].map((value) => <option value={value} key={value}>{value}</option>)}</select></TableCell><TableCell>{new Date(question.createdAt).toLocaleDateString("en-GB")}</TableCell></TableRow>;
}

function ProductEditor({ product, setProduct, close, save, archive }: { product: CommerceProduct; setProduct: (value: CommerceProduct) => void; close: () => void; save: () => Promise<void>; archive?: () => Promise<void> }) {
  const field = (key: keyof CommerceProduct, value: unknown) => setProduct({ ...product, [key]: value });
  return <section className="admin-product-editor" aria-label="Product editor"><div className="admin-editor-heading"><div><small>{product.id ? "Edit product" : "New product"}</small><h2>{product.name || "Untitled garment"}</h2></div><button type="button" onClick={close}>Close</button></div><div className="admin-editor-grid">
    <label>Product name<input value={product.name} onChange={(e) => field("name", e.target.value)} /></label><label>SKU<input value={product.sku} onChange={(e) => field("sku", e.target.value)} /></label><label>Slug<input value={product.slug} onChange={(e) => field("slug", e.target.value)} placeholder="Created from the name" /></label><label>Category<select value={product.category} onChange={(e) => field("category", e.target.value)}>{["Polos","Tops","Layers","Bottoms","Sets","Accessories"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Product type<input value={product.productType} onChange={(e) => field("productType", e.target.value)} /></label><label>Image path<input value={product.image} onChange={(e) => field("image", e.target.value)} /></label><label>Price (£)<input type="number" min="0" step="1" value={product.price / 100} onChange={(e) => field("price", Math.round(Number(e.target.value) * 100))} /></label><label>Cost (£)<input type="number" min="0" step="1" value={product.cost / 100} onChange={(e) => field("cost", Math.round(Number(e.target.value) * 100))} /></label><label className="is-wide">Description<textarea value={product.description} onChange={(e) => field("description", e.target.value)} /></label><label className="admin-check"><input type="checkbox" checked={product.active} onChange={(e) => field("active", e.target.checked)} />Available on storefront</label><label className="admin-check"><input type="checkbox" checked={product.featured} onChange={(e) => field("featured", e.target.checked)} />Featured product</label><label className="admin-check"><input type="checkbox" checked={product.trackInventory} onChange={(e) => field("trackInventory", e.target.checked)} />Track inventory</label>
  </div><div className="admin-editor-actions">{archive && <button type="button" className="is-secondary" onClick={() => void archive()}>Archive product</button>}<button type="button" onClick={() => void save()}><Save />Save product</button></div></section>;
}
