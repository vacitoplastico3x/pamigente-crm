import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    const where: any = {}
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        product: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Crear CSV
    const headers = ['ID', 'Fecha', 'Hora', 'Producto', 'Litros', 'Precio Unitario', 'Moneda', 'Tasa Cambio', 'Total Moneda', 'Total CUP', 'Cliente ID', 'Cliente Nombre']
    const rows = sales.map(sale => {
      const totalInCurrency = sale.currency === 'CUP' 
        ? Number(sale.totalCUP) 
        : Number(sale.totalCUP) / Number(sale.exchangeRate)
      
      return [
        sale.id,
        new Date(sale.createdAt).toLocaleDateString('es-CU'),
        new Date(sale.createdAt).toLocaleTimeString('es-CU'),
        sale.product.name,
        sale.liters,
        Number(sale.unitPrice).toFixed(2),
        sale.currency,
        Number(sale.exchangeRate).toFixed(2),
        totalInCurrency.toFixed(2),
        Number(sale.totalCUP).toFixed(2),
        sale.customer?.id || 'N/A',
        sale.customer?.name || 'Cliente General'
      ].join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=ventas-pamigente.csv'
      }
    })
  } catch (error: any) {
    console.error('Error al exportar:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
