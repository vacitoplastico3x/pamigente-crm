'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function TicketContent() {
  const searchParams = useSearchParams()
  const saleId = searchParams.get('id')
  const [sale, setSale] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!saleId) {
      setLoading(false)
      return
    }
    const fetchSale = async () => {
      try {
        const res = await fetch('/api/sales-detail?id=' + saleId)
        const data = await res.json()
        if (data.success) setSale(data.sale)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSale()
  }, [saleId])

  const handlePrint = () => window.print()

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando ticket...</div>
  if (!saleId) return <div className="min-h-screen flex items-center justify-center text-red-600">Error: No se proporciono ID de venta</div>
  if (!sale) return <div className="min-h-screen flex items-center justify-center text-red-600">Ticket no encontrado</div>

  const totalInCurrency = sale.currency === 'CUP' 
    ? Number(sale.totalCUP) 
    : Number(sale.totalCUP) / Number(sale.exchangeRate)

  return (
    <div className="min-h-screen bg-gray-200 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-4 flex gap-2 no-print">
          <button onClick={handlePrint} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
            IMPRIMIR TICKET
          </button>
          <button onClick={() => window.close()} className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
            Cerrar
          </button>
        </div>

        <div className="bg-white p-8 shadow-lg font-mono text-sm">
          <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
            <h1 className="text-2xl font-black">PA'MIGENTE</h1>
            <p className="text-xs text-gray-600 mt-1">Sistema de Ventas de Combustible</p>
            <p className="text-xs text-gray-500 mt-1">Ticket #{String(sale.id).padStart(6, '0')}</p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-semibold">{new Date(sale.createdAt).toLocaleDateString('es-CU')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hora:</span>
              <span className="font-semibold">{new Date(sale.createdAt).toLocaleTimeString('es-CU')}</span>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-4">
            <div className="mb-3">
              <div className="text-gray-600 text-xs">CLIENTE:</div>
              <div className="font-bold text-base">
                {sale.customer ? '#' + sale.customer.id + ' - ' + sale.customer.name : 'Cliente General'}
              </div>
              {sale.customer?.taxId && (
                <div className="text-xs text-gray-500">ID Fiscal: {sale.customer.taxId}</div>
              )}
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 text-xs">PRODUCTO</th>
                  <th className="text-right py-2 text-xs">CANT.</th>
                  <th className="text-right py-2 text-xs">PRECIO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">{sale.product.name}</td>
                  <td className="text-right py-2">{sale.liters} L</td>
                  <td className="text-right py-2">{Number(sale.unitPrice).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{totalInCurrency.toFixed(2)} {sale.currency}</span>
            </div>
            {sale.currency !== 'CUP' && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Tasa aplicada:</span>
                <span>1 {sale.currency} = {Number(sale.exchangeRate).toFixed(2)} CUP</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black border-t-2 border-gray-300 pt-2">
              <span>TOTAL:</span>
              <span>{totalInCurrency.toFixed(2)} {sale.currency}</span>
            </div>
            {sale.currency !== 'CUP' && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Equivalente en CUP:</span>
                <span>{Number(sale.totalCUP).toFixed(2)} CUP</span>
              </div>
            )}
          </div>

          <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-4 text-center">
            <p className="text-xs text-gray-600">Metodo de pago: Efectivo</p>
            <p className="text-xs text-gray-500 mt-2">Gracias por su compra!</p>
            <p className="text-xs text-gray-400 mt-1">PA'MIGENTE - Su combustible de confianza</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  )
}

export default function TicketPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <TicketContent />
    </Suspense>
  )
}
