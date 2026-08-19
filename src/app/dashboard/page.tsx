'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [period, setPeriod] = useState('today')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    if (parsedUser.role !== 'admin') { alert('No tienes permiso'); router.push('/'); return }
    fetchStats()
  }, [router, period])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard?period=' + period)
      const data = await res.json()
      if (data.success) setStats(data.stats)
    } catch (err) {
      console.error(err)
    }
  }

  if (!user || !stats) return <div className="min-h-screen flex items-center justify-center">Cargando dashboard...</div>

  const maxDayTotal = Math.max(...Object.values(stats.byDay).map((d: any) => d.total), 1)

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-800">📊 Dashboard - PA'MIGENTE</h1>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">← Volver al POS</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Selector de Período */}
        <div className="flex gap-2">
          <button onClick={() => setPeriod('today')} className={'px-4 py-2 rounded-lg font-semibold ' + (period === 'today' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700')}>Hoy</button>
          <button onClick={() => setPeriod('week')} className={'px-4 py-2 rounded-lg font-semibold ' + (period === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700')}>Última Semana</button>
          <button onClick={() => setPeriod('month')} className={'px-4 py-2 rounded-lg font-semibold ' + (period === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700')}>Último Mes</button>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 font-semibold uppercase">Total Ventas</div>
            <div className="text-3xl font-black text-blue-700 mt-2">{stats.totalSales}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 font-semibold uppercase">Total en CUP</div>
            <div className="text-3xl font-black text-green-700 mt-2">{stats.totalCUP.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 font-semibold uppercase">Litros Vendidos</div>
            <div className="text-3xl font-black text-purple-700 mt-2">{stats.totalLiters.toFixed(2)} L</div>
          </div>
        </div>

        {/* Gráfico de Ventas por Día */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Ventas por Día (últimos 7 días)</h2>
          <div className="space-y-3">
            {Object.entries(stats.byDay).map(([date, data]: [string, any]) => (
              <div key={date} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-600 font-mono">{date.slice(5)}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full flex items-center justify-end pr-2 text-white text-sm font-bold transition-all"
                    style={{ width: (data.total / maxDayTotal * 100) + '%' }}
                  >
                    {data.total > 0 && data.total.toFixed(0)}
                  </div>
                </div>
                <div className="w-20 text-right text-sm text-gray-600">{data.count} ventas</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ventas por Producto y Moneda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">⛽ Ventas por Producto</h2>
            <div className="space-y-3">
              {Object.entries(stats.byProduct).map(([product, data]: [string, any]) => (
                <div key={product} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-bold text-gray-800">{product}</div>
                    <div className="text-sm text-gray-500">{data.count} ventas · {data.liters.toFixed(2)} L</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-green-600">{data.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">CUP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💱 Ventas por Moneda</h2>
            <div className="space-y-3">
              {Object.entries(stats.byCurrency).map(([currency, data]: [string, any]) => (
                <div key={currency} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{currency}</div>
                    <div className="text-sm text-gray-500">{data.count} ventas</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-blue-600">{data.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{currency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
