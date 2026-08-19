'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InventoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [liters, setLiters] = useState('')
  const [reason, setReason] = useState('Compra a Cubapetrol')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    if (parsedUser.role !== 'admin') { alert('No tienes permiso'); router.push('/'); return }
    fetchInventory()
  }, [router])

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory')
      const data = await res.json()
      if (data.success) setProducts(data.products)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !liters) return
    setLoading(true)
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct, liters: parseFloat(liters), reason })
      })
      const data = await res.json()
      if (data.success) {
        alert('✅ Combustible agregado al tanque')
        setLiters('')
        fetchInventory()
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (err) {
      alert('❌ Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-800">⛽ Control de Inventario</h1>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">← Volver al POS</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📥 Registrar Entrada</h2>
          <form onSubmit={handleAddStock} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tanque</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" required>
                <option value="">Seleccionar...</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Litros</label>
              <input type="number" step="0.01" value={liters} onChange={(e) => setLiters(e.target.value)} placeholder="Ej: 5000" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-xl font-bold" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                <option>Compra a Cubapetrol</option>
                <option>Transferencia entre tanques</option>
                <option>Ajuste por inventario fisico</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors">
              {loading ? 'Procesando...' : '💾 AGREGAR AL TANQUE'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {products.map((p: any) => {
            const stock = Number(p.currentStock)
            const isLow = stock < 2000
            return (
              <div key={p.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-gray-800">{p.name}</h3>
                    <p className="text-sm text-gray-500">Precio: {Number(p.priceCUP).toFixed(2)} CUP/L</p>
                  </div>
                  <div className={'text-right p-3 rounded-lg ' + (isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>
                    <div className="text-xs font-bold uppercase">Stock Actual</div>
                    <div className="text-3xl font-black">{stock.toLocaleString('es-CU')} L</div>
                    {isLow && <div className="text-xs font-bold mt-1">⚠️ STOCK BAJO</div>}
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <h4 className="text-sm font-bold text-gray-600 mb-2">Ultimos Movimientos:</h4>
                  <div className="space-y-2">
                    {p.logs.length === 0 ? <p className="text-sm text-gray-400">Sin movimientos recientes</p> :
                      p.logs.slice(0, 3).map((log: any) => (
                        <div key={log.id} className="flex justify-between text-sm">
                          <span className={log.type === 'ENTRADA' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {log.type === 'ENTRADA' ? '📥 +' : '📤 -'} {Number(log.liters).toLocaleString('es-CU')} L
                          </span>
                          <span className="text-gray-500">{log.reason}</span>
                          <span className="text-gray-400 text-xs">{new Date(log.createdAt).toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
