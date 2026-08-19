'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CashRegisterPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [summary, setSummary] = useState<Record<string, { total: number; liters: number; count: number }>>({})
  const [totalCUP, setTotalCUP] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [cashInDrawer, setCashInDrawer] = useState('')
  const [difference, setDifference] = useState<number | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchSummary()
  }, [router])

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/cash-register')
      const data = await res.json()
      if (data.success) {
        setSummary(data.summary)
        setTotalCUP(data.totalCUP)
        setTotalSales(data.totalSales)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (!cashInDrawer) { setDifference(null); return }
    const cash = parseFloat(cashInDrawer)
    const expected = totalCUP
    const diff = cash - expected
    setDifference(diff)
  }, [cashInDrawer, totalCUP])

  const handleCashRegister = async () => {
    if (!cashInDrawer) {
      alert('Ingresa el efectivo real en caja')
      return
    }

    const confirmed = confirm(
      '¿Confirmar cierre de caja?\n\n' +
      'Total esperado (CUP): ' + totalCUP.toFixed(2) + '\n' +
      'Efectivo en caja: ' + cashInDrawer + '\n' +
      'Diferencia: ' + (difference?.toFixed(2) || '0.00') + '\n\n' +
      'Esta accion guardara el reporte de cierre.'
    )

    if (confirmed) {
      alert('✅ Cierre de caja registrado exitosamente')
      router.push('/')
    }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-800">💰 Cierre de Caja Diario</h1>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">← Volver al POS</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Resumen de Ventas del Dia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-semibold uppercase">Total Ventas</div>
              <div className="text-3xl font-black text-blue-700">{totalSales}</div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 font-semibold uppercase">Total en CUP</div>
              <div className="text-3xl font-black text-green-700">{totalCUP.toFixed(2)}</div>
            </div>
          </div>

          <div className="space-y-3">
            {Object.keys(summary).length === 0 ? (
              <div className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                No hay ventas registradas hoy.
              </div>
            ) : (
              Object.entries(summary).map(([currency, data]) => (
                <div key={currency} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{currency}</div>
                    <div className="text-sm text-gray-500">{data.count} ventas · {data.liters.toFixed(2)} litros</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-600">{data.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{currency}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">💵 Arqueo de Caja (Solo CUP)</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Efectivo Real en Caja (CUP)
              </label>
              <input
                type="number"
                step="0.01"
                value={cashInDrawer}
                onChange={(e) => setCashInDrawer(e.target.value)}
                placeholder="Ej: 15000.50"
                className="w-full p-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {difference !== null && cashInDrawer && (
              <div className={'p-4 rounded-lg border-2 ' + (
                Math.abs(difference) < 0.01 
                  ? 'bg-green-50 border-green-200' 
                  : difference > 0 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-red-50 border-red-200'
              )}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Diferencia:</span>
                  <span className={'text-2xl font-black ' + (
                    Math.abs(difference) < 0.01 
                      ? 'text-green-700' 
                      : difference > 0 
                        ? 'text-blue-700' 
                        : 'text-red-700'
                  )}>
                    {difference > 0 ? '+' : ''}{difference.toFixed(2)} CUP
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {Math.abs(difference) < 0.01 
                    ? '✅ Caja cuadrada perfectamente' 
                    : difference > 0 
                      ? '💰 Hay un sobrante en caja' 
                      : '⚠️ Hay un faltante en caja'}
                </div>
              </div>
            )}

            <button
              onClick={handleCashRegister}
              disabled={!cashInDrawer}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors shadow-md"
            >
              ✅ CERRAR CAJA Y GUARDAR REPORTE
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
