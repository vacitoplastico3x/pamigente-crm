import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: today } },
      include: { product: true }
    })

    const summary: Record<string, { total: number; liters: number; count: number }> = {}
    
    sales.forEach(sale => {
      const curr = sale.currency
      if (!summary[curr]) {
        summary[curr] = { total: 0, liters: 0, count: 0 }
      }
      const totalInCurrency = Number(sale.totalCUP) / Number(sale.exchangeRate)
      summary[curr].total += totalInCurrency
      summary[curr].liters += Number(sale.liters)
      summary[curr].count += 1
    })

    const totalCUP = sales.reduce((sum, sale) => sum + Number(sale.totalCUP), 0)

    return NextResponse.json({
      success: true,
      summary,
      totalCUP,
      totalSales: sales.length,
      sales
    })
  } catch (error) {
    console.error('Error al obtener resumen de caja:', error)
    return NextResponse.json({ error: 'Error al obtener resumen de caja' }, { status: 500 })
  }
}
