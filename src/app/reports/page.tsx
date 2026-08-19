'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'contador') {
      alert('No tienes permiso')
      router.push('/')
      return
    }
  }, [router])

  const handleExport = () => {
    let url = '/api/export'
    const params = new URLSearchParams()
    if (startDate) params.append('start', startDate)
    if (endDate) params.append('end', endDate)
    if (params.toString()) url += '?' + params.toString()
    
    window.open(url, '_blank')
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-800">📑 Reportes de Ventas - PA'MIGENTE</h1>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">← Volver al POS</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Exportar Ventas a CSV (Excel)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleExport}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors shadow-md"
          >
            📥 DESCARGAR REPORTE CSV
          </button>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">ℹ️ Información del Reporte:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• El archivo se descargará en formato CSV (compatible con Excel)</li>
              <li>• Incluye: ID, Fecha, Hora, Producto, Litros, Precio, Moneda, Tasa, Totales, Cliente</li>
              <li>• Si no seleccionas fechas, se exportarán TODAS las ventas</li>
              <li>• Los totales se muestran en la moneda de pago Y en CUP</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
