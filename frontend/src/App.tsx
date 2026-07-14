import { useState, useEffect, useCallback } from 'react'
import {
  Truck, Package, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, Zap, Brain, MemoryStick, Shuffle, RotateCcw,
  Activity, Server, Clock
} from 'lucide-react'

interface ShipRequest {
  productId: string
  quantity: number
  userId: string
}

interface ShipResponse {
  shipmentId: string
  orderId: string | null
  status: string
  message: string
  productId: string
  quantity: number
  userId: string
  shippedAt: string
}

interface IncidentStatus {
  service: string
  cpuEnabled: boolean
  npeEnabled: boolean
  memoryLeakEnabled: boolean
  randomErrorEnabled: boolean
}

const API = ''

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    SHIPPED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    REJECTED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
    ACTIVE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    CLEARED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${colours[status] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
      {status}
    </span>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  )
}

export default function App() {
  const [form, setForm] = useState<ShipRequest>({ productId: 'P001', quantity: 1, userId: 'user-42' })
  const [shipments, setShipments] = useState<ShipResponse[]>([])
  const [incidentStatus, setIncidentStatus] = useState<IncidentStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<ShipResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [incidentMsg, setIncidentMsg] = useState<string | null>(null)
  const [healthOk, setHealthOk] = useState<boolean | null>(null)

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API}/actuator/health`)
      setHealthOk(res.ok)
    } catch {
      setHealthOk(false)
    }
  }, [])

  const fetchIncidentStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/incident/status`)
      if (res.ok) setIncidentStatus(await res.json())
    } catch { /* ignore */ }
  }, [])

  const fetchAllShipments = useCallback(async () => {
    try {
      const res = await fetch(`${API}/shipping`)
      if (res.ok) {
        const data: Record<string, ShipResponse> = await res.json()
        setShipments(Object.values(data).reverse())
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchHealth()
    fetchIncidentStatus()
    fetchAllShipments()
    const id = setInterval(() => {
      fetchHealth()
      fetchIncidentStatus()
      fetchAllShipments()
    }, 5000)
    return () => clearInterval(id)
  }, [fetchHealth, fetchIncidentStatus, fetchAllShipments])

  const handleShip = async () => {
    setLoading(true)
    setError(null)
    setLastResult(null)
    try {
      const res = await fetch(`${API}/shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setLastResult(data as ShipResponse)
        fetchAllShipments()
      } else {
        setError(JSON.stringify(data, null, 2))
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const triggerIncident = async (path: string, label: string) => {
    setIncidentMsg(null)
    try {
      const res = await fetch(`${API}/incident/${path}`, { method: 'POST' })
      const data = await res.json()
      setIncidentMsg(`${label}: ${data.status ?? data.effect ?? JSON.stringify(data)}`)
      fetchIncidentStatus()
    } catch (e) {
      setIncidentMsg(`Error: ${String(e)}`)
    }
  }

  const incidents = [
    { path: 'cpu', label: 'CPU Load', icon: Zap, colour: 'hover:bg-orange-500/20 hover:border-orange-500/50', active: incidentStatus?.cpuEnabled },
    { path: 'npe', label: 'NullPointerException', icon: Brain, colour: 'hover:bg-red-500/20 hover:border-red-500/50', active: incidentStatus?.npeEnabled },
    { path: 'memory', label: 'Memory Leak', icon: MemoryStick, colour: 'hover:bg-purple-500/20 hover:border-purple-500/50', active: incidentStatus?.memoryLeakEnabled },
    { path: 'random', label: 'Random Errors (30%)', icon: Shuffle, colour: 'hover:bg-amber-500/20 hover:border-amber-500/50', active: incidentStatus?.randomErrorEnabled },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <Truck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Shipping Service</h1>
              <p className="text-xs text-slate-400">Incident Lab — Repo 2 · consumes Order Service on :8080</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Health:</span>
              {healthOk === null
                ? <span className="text-slate-500">checking…</span>
                : healthOk
                  ? <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-4 h-4" /> UP</span>
                  : <span className="flex items-center gap-1 text-red-400"><XCircle className="w-4 h-4" /> DOWN</span>
              }
            </div>
            <a href="/actuator/prometheus" target="_blank"
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors border border-slate-600 rounded-lg px-3 py-1">
              Prometheus
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">

        {/* Left column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">

          {/* Ship Order form */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Package className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Create Shipment</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Product ID</label>
                <input
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                  value={form.productId}
                  onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                  placeholder="P001, P002, P004, P005 (in stock)"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Quantity</label>
                <input
                  type="number"
                  min={1}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">User ID</label>
                <input
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                  value={form.userId}
                  onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
                  placeholder="e.g. user-42"
                />
              </div>
              <button
                onClick={handleShip}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                {loading ? 'Shipping…' : 'Ship Order'}
              </button>
            </div>

            {/* Last result */}
            {lastResult && (
              <div className="mt-5 p-4 bg-slate-700/40 rounded-xl border border-slate-600/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Last Result</span>
                  <StatusBadge status={lastResult.status} />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Shipment ID</span><span className="font-mono text-slate-200">{lastResult.shipmentId}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Order ID</span><span className="font-mono text-slate-200">{lastResult.orderId ?? '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Product</span><span className="font-mono text-slate-200">{lastResult.productId}</span></div>
                  <div className="flex flex-col gap-0.5 mt-2 pt-2 border-t border-slate-600/30">
                    <span className="text-slate-400 text-xs">Message</span>
                    <span className="text-slate-300 text-xs">{lastResult.message}</span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <pre className="text-red-400 text-xs whitespace-pre-wrap">{error}</pre>
              </div>
            )}
          </Card>

          {/* Incident Controls */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-white">Incident Controls</h2>
              <span className="ml-auto text-xs text-slate-400">shipping-service only</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {incidents.map(({ path, label, icon: Icon, colour, active }) => (
                <button
                  key={path}
                  onClick={() => triggerIncident(path, label)}
                  className={`flex flex-col items-start gap-2 p-3 rounded-xl border transition
                    ${active
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                      : `bg-slate-700/30 border-slate-600/30 text-slate-300 ${colour}`}
                  `}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-medium leading-tight">{label}</span>
                  </div>
                  {active && <span className="text-xs text-orange-400 font-semibold">ACTIVE</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => triggerIncident('reset', 'Reset')}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-700/30 hover:bg-emerald-500/10 border border-slate-600/30 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 font-medium py-2.5 rounded-xl transition text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Incidents
            </button>
            {incidentMsg && (
              <div className="mt-3 p-3 bg-slate-700/40 rounded-xl border border-slate-600/30 text-xs text-slate-300">
                {incidentMsg}
              </div>
            )}
          </Card>

          {/* Service Graph */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-white">Service Flow</h2>
            </div>
            <div className="flex flex-col items-center gap-2 py-2">
              {[
                { label: 'Browser / Frontend', port: ':3001', colour: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
                { label: '↓ POST /shipping', port: '', colour: 'text-slate-500 text-sm' },
                { label: 'Shipping Service', port: ':8082', colour: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' },
                { label: '↓ POST /orders  (Feign)', port: '', colour: 'text-slate-500 text-sm' },
                { label: 'Order Service (Repo 1)', port: ':8080', colour: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' },
                { label: '↓ GET /inventory/{id}', port: '', colour: 'text-slate-500 text-sm' },
                { label: 'Inventory Service', port: ':8081', colour: 'bg-amber-500/20 border-amber-500/30 text-amber-300' },
              ].map((item, i) =>
                item.port ? (
                  <div key={i} className={`w-full flex items-center justify-between px-4 py-2 rounded-xl border ${item.colour}`}>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="font-mono text-xs opacity-70">{item.port}</span>
                  </div>
                ) : (
                  <span key={i} className={item.colour}>{item.label}</span>
                )
              )}
            </div>
          </Card>
        </div>

        {/* Right column — Shipments log */}
        <div className="col-span-12 lg:col-span-7">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-white">Shipment Log</h2>
                <span className="ml-2 text-xs text-slate-500">(refreshes every 5s)</span>
              </div>
              <button
                onClick={fetchAllShipments}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition border border-slate-600/40 rounded-lg px-3 py-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {shipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Truck className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">No shipments yet. Create one above.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[680px] pr-1">
                {shipments.map((s, i) => (
                  <div
                    key={s.shipmentId + i}
                    className="flex flex-col gap-2 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {s.status === 'SHIPPED'
                          ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          : s.status === 'REJECTED'
                            ? <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        }
                        <span className="font-mono text-sm font-semibold text-slate-200">{s.shipmentId}</span>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                      <div><span className="text-slate-500">Order ID: </span><span className="font-mono text-slate-300">{s.orderId ?? '—'}</span></div>
                      <div><span className="text-slate-500">Product: </span><span className="font-mono text-slate-300">{s.productId}</span></div>
                      <div><span className="text-slate-500">Qty: </span><span className="text-slate-300">{s.quantity}</span></div>
                      <div><span className="text-slate-500">User: </span><span className="font-mono text-slate-300">{s.userId}</span></div>
                    </div>
                    <p className="text-xs text-slate-400 border-t border-slate-600/30 pt-2 mt-1">{s.message}</p>
                    <p className="text-xs text-slate-600">{new Date(s.shippedAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  )
}
