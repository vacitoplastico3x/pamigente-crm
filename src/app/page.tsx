'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function POSPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [showTicket, setShowTicket] = useState<any>(null)
  const [products] = useState([
    { id: 1, name: 'Regular', priceCUP: 150 },
    { id: 2, name: 'Premium', priceCUP: 180 },
    { id: 3, name: 'Diesel', priceCUP: 140 },
  ])
  const [rates, setRates] = useState<Record<string, number>>({ CUP: 1 })
  const [sales, setSales] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | ''>('')
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('')
  const [liters, setLiters] = useState('')
  const [currency, setCurrency] = useState('CUP')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    setUser(JSON.parse(userData))
    fetchCustomers()
  }, [router])

  useEffect(() => {
    fetch('/api/rates').then(r => r.json()).then(d => { if (d.success) setRates(d.rates) }).catch(() => {})
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      if (data.success) setCustomers(data.customers)
    } catch (err) { console.error(err) }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-100">Cargando...</div>

  const product = products.find(p => p.id === selectedProduct)
  const rate = rates[currency] || 1
  const totalCUP = product && liters ? (parseFloat(liters) * product.priceCUP) : 0
  const totalForeign = currency !== 'CUP' && totalCUP > 0 ? (totalCUP / rate) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !liters) { alert('Selecciona producto y cantidad'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct, customerId: selectedCustomer || null, liters: parseFloat(liters), currency, userId: user.id })
      })
      const data = await res.json()
      if (data.success) {
        setSales(prev => [data.sale, ...prev])
        setLiters(''); setSelectedProduct(''); setSelectedCustomer('')
        setShowTicket(data.sale)
        alert('Venta registrada')
      } else { alert('Error: ' + data.error) }
    } catch (err) { alert('Error de conexion') }
    finally { setLoading(false) }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {showTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 no-print">
                <h2 className="text-xl font-bold">Ticket de Venta</h2>
                <button onClick={() => setShowTicket(null)} className="text-gray-500 text-2xl">×</button>
              </div>
              <div id="ticket-content" className="font-mono text-sm">
                <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                  <h1 className="text-2xl font-black">PA'MIGENTE</h1>
                  <p className="text-xs text-gray-600">Sistema de Ventas de Combustible</p>
                  <p className="text-xs text-gray-500">Ticket #{String(showTicket.id).padStart(6, '0')}</p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between"><span>Fecha:</span><span className="font-semibold">{new Date(showTicket.createdAt).toLocaleDateString('es-CU')}</span></div>
                  <div className="flex justify-between"><span>Hora:</span><span className="font-semibold">{new Date(showTicket.createdAt).toLocaleTimeString('es-CU')}</span></div>
                </div>
                <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-4">
                  <div className="text-xs text-gray-600">CLIENTE:</div>
                  <div className="font-bold">{showTicket.customer ? '#' + showTicket.customer.id + ' - ' + showTicket.customer.name : 'Cliente General'}</div>
                </div>
                <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-4">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="py-2">{showTicket.product.name}</td>
                        <td className="text-right">{showTicket.liters} L</td>
                        <td className="text-right">{Number(showTicket.unitPrice).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="border-t-2 border-dashed border-gray-300 pt-4">
                  {(() => {
                    const total = showTicket.currency === 'CUP' ? Number(showTicket.totalCUP) : Number(showTicket.totalCUP) / Number(showTicket.exchangeRate)
                    return (
                      <>
                        <div className="flex justify-between"><span>Total:</span><span>{total.toFixed(2)} {showTicket.currency}</span></div>
                        <div className="flex justify-between text-lg font-black border-t-2 pt-2 mt-2"><span>TOTAL:</span><span>{total.toFixed(2)} {showTicket.currency}</span></div>
                      </>
                    )
                  })()}
                </div>
                <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-4 text-center">
                  <p className="text-xs text-gray-500">Gracias por su compra!</p>
                  <p className="text-xs text-gray-400">PA'MIGENTE</p>
                </div>
              </div>
              <div className="mt-6 flex gap-2 no-print">
                <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg">IMPRIMIR</button>
                <button onClick={() => setShowTicket(null)} className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg">CERRAR</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">{user.name.charAt(0)}</div>
            <div>
              <div className="font-bold">{user.name}</div>
              <div className="text-xs text-blue-600 uppercase">{user.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => router.push('/customers')} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">
              👥 Clientes
            </button>
            {user.role === 'admin' && (
              <>
                <button onClick={() => router.push('/rates')} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">Tasas</button>
                <button onClick={() => router.push('/inventory')} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold">Inventario</button>
                <button onClick={() => router.push('/cash-register')} className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold">Cierre</button>
                <button onClick={() => router.push('/dashboard')} className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold">Dashboard</button>
                <button onClick={() => router.push('/reports')} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold">Reportes</button>
              </>
            )}
            {(user.role === 'admin' || user.role === 'contador') && (
              <>
                <button onClick={() => router.push('/dashboard')} className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold">Dashboard</button>
                <button onClick={() => router.push('/reports')} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold">Reportes</button>
              </>
            )}
            <button onClick={handleLogout} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold">Salir</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">⛽ Registrar Nueva Venta</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Cliente (Opcional)</label>
              <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value ? Number(e.target.value) : '')} className="w-full p-3 border-2 border-gray-300 rounded-lg">
                <option value="">-- Cliente General --</option>
                {customers.map((c: any) => <option key={c.id} value={c.id}>#{c.id} - {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Combustible</label>
              <div className="grid grid-cols-3 gap-3">
                {products.map(p => (
                  <button key={p.id} type="button" onClick={() => setSelectedProduct(p.id)} className={'p-4 rounded-lg border-2 ' + (selectedProduct === p.id ? 'border-blue-600 bg-blue-50 font-bold' : 'border-gray-200')}>
                    <div>{p.name}</div>
                    <div className="text-sm">{p.priceCUP} CUP/L</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Litros</label>
                <input type="number" step="0.01" value={liters} onChange={(e) => setLiters(e.target.value)} className="w-full p-4 text-2xl font-bold border-2 border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Moneda</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full p-4 border-2 border-gray-300 rounded-lg">
                  <option value="CUP">CUP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="MLC">MLC</option>
                </select>
              </div>
            </div>
            {totalCUP > 0 && (
              <div className="bg-gray-50 border-2 rounded-lg p-6">
                <div className="flex justify-between"><span>Total ({currency}):</span><span className="text-3xl font-black text-blue-600">{currency === 'CUP' ? totalCUP.toFixed(2) : totalForeign.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>Equivalente CUP:</span><span>{totalCUP.toFixed(2)}</span></div>
              </div>
            )}
            <button type="submit" disabled={loading || !selectedProduct || !liters} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-lg">
              {loading ? 'Procesando...' : '✅ REGISTRAR VENTA'}
            </button>
          </form>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📋 Ventas del Dia</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {sales.length === 0 ? <div className="text-center text-gray-400 py-12">Sin ventas</div> :
              sales.map((sale: any) => {
                const t = sale.currency === 'CUP' ? Number(sale.totalCUP) : Number(sale.totalCUP) / Number(sale.exchangeRate)
                return (
                  <div key={sale.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-bold">{sale.product.name}</div>
                        <div className="text-sm">{sale.liters} L</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{t.toFixed(2)} {sale.currency}</div>
                        <div className="text-xs">{new Date(sale.createdAt).toLocaleTimeString('es-CU', {hour:'2-digit', minute:'2-digit'})}</div>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </main>
      <style>{`@media print { body * { visibility: hidden; } #ticket-content, #ticket-content * { visibility: visible; } #ticket-content { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none !important; } }`}</style>
    </div>
  )
}
