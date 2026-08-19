'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RatesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [rates, setRates] = useState<Record<string, number>>({ CUP: 1 })
  const [history, setHistory] = useState<any[]>([])
  const [newCurrency, setNewCurrency] = useState('USD')
  const [newRate, setNewRate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    if (parsedUser.role !== 'admin') { alert('No tienes permiso'); router.push('/'); return }
    fetchRates()
  }, [router])

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/rates')
      const data = await res.json()
      if (data.success) { setRates(data.rates); setHistory(data.history) }
    } catch (err) { console.error(err) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: newCurrency, rateToCUP: parseFloat(newRate) })
      })
      const data = await res.json()
      if (data.success) {
        alert('✅ Tasa actualizada')
        setNewRate('')
        fetchRates()
      } else { alert('❌ Error: ' + data.error) }
    } catch (err) { alert('❌ Error de conexión') }
    finally { setLoading(false) }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-800">💱 Gestión de Tasas</h1>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">← Volver al POS</button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Actualizar Tasa del Día</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Moneda</label>
              <select value={newCurrency} onChange={(e) => setNewCurrency(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                <option value="USD">🇺🇸 USD</option>
                <option value="EUR">🇪🇺 EUR</option>
                <option value="MLC">💳 MLC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nuevo Valor en CUP</label>
              <input type="number" step="0.01" value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="Ej: 350.50" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-xl font-bold" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors">
              {loading ? 'Guardando...' : '💾 GUARDAR NUEVA TASA'}
            </button>
          </form>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tasas Vigentes</h2>
          <div className="space-y-3">
            {Object.entries(rates).map(([curr, rate]) => (
              <div key={curr} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-bold text-gray-700 text-lg">1 {curr}</span>
                <span className="text-2xl font-black text-blue-600">{Number(rate).toFixed(2)} CUP</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
