import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'today' // today, week, month

    const now = new Date()
    let startDate = new Date()

    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    }

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        product: true,
        customer: true
      }
    })

    // Estadísticas generales
    const totalSales = sales.length
    const totalCUP = sales.reduce((sum, s) => sum + Number(s.totalCUP), 0)
    const totalLiters = sales.reduce((sum, s) => sum + Number(s.liters), 0)

    // Ventas por moneda
    const byCurrency: Record<string, { total: number; count: number }> = {}
    sales.forEach(sale => {
      const curr = sale.currency
      if (!byCurrency[curr]) byCurrency[curr] = { total: 0, count: 0 }
      byCurrency[curr].total += Number(sale.totalCUP) / Number(sale.exchangeRate)
      byCurrency[curr].count += 1
    })

    // Ventas por producto
    const byProduct: Record<string, { liters: number; total: number; count: number }> = {}
    sales.forEach(sale => {
      const prod = sale.product.name
      if (!byProduct[prod]) byProduct[prod] = { liters: 0, total: 0, count: 0 }
      byProduct[prod].liters += Number(sale.liters)
      byProduct[prod].total += Number(sale.totalCUP)
      byProduct[prod].count += 1
    })

    // Ventas por día (últimos 7 días)
    const byDay: Record<string, { total: number; count: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(now.getDate() - i)
      const key = date.toISOString().split('T')[0]
      byDay[key] = { total: 0, count: 0 }
    }
    sales.forEach(sale => {
      const key = new Date(sale.createdAt).toISOString().split('T')[0]
      if (byDay[key]) {
        byDay[key].total += Number(sale.totalCUP)
        byDay[key].count += 1
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalSales,
        totalCUP,
        totalLiters,
        byCurrency,
        byProduct,
        byDay
      }
    })
  } catch (error: any) {
    console.error('Error en dashboard:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
