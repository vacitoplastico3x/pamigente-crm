import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rates = await prisma.exchangeRate.findMany({
      orderBy: { date: 'desc' }
    })
    
    const latestRates: Record<string, number> = { CUP: 1 }
    rates.forEach(rate => {
      if (!latestRates[rate.currency]) {
        latestRates[rate.currency] = Number(rate.rateToCUP)
      }
    })

    return NextResponse.json({ success: true, rates: latestRates, history: rates })
  } catch (error: any) {
    console.error('Error en API de rates:', error)
    return NextResponse.json({ error: 'Error al obtener tasas: ' + error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { currency, rateToCUP } = await req.json()

    if (!currency || !rateToCUP || currency === 'CUP') {
      return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
    }

    const newRate = await prisma.exchangeRate.create({
      data: {
        currency,
        rateToCUP: Number(rateToCUP),
      }
    })

    return NextResponse.json({ success: true, rate: newRate })
  } catch (error: any) {
    console.error('Error al actualizar tasa:', error)
    return NextResponse.json({ error: 'Error al actualizar tasa: ' + error.message }, { status: 500 })
  }
}
