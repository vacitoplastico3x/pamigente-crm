import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, customerId, liters, currency, userId } = body

    const numLiters = Number(liters)
    const numProductId = Number(productId)
    const numCustomerId = customerId ? Number(customerId) : null

    const product = await prisma.product.findUnique({ where: { id: numProductId } })
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    if (Number(product.currentStock) < numLiters) {
      return NextResponse.json({ error: 'Stock insuficiente. Quedan ' + Number(product.currentStock) + ' litros.' }, { status: 400 })
    }

    let exchangeRate = 1
    if (currency !== 'CUP') {
      const rateRecord = await prisma.exchangeRate.findFirst({ where: { currency }, orderBy: { date: 'desc' } })
      if (!rateRecord) return NextResponse.json({ error: 'Tasa para ' + currency + ' no encontrada' }, { status: 404 })
      exchangeRate = Number(rateRecord.rateToCUP)
    }

    const numPriceCUP = Number(product.priceCUP)
    const totalCUP = numLiters * numPriceCUP
    const unitPrice = currency === 'CUP' ? numPriceCUP : numPriceCUP / exchangeRate

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          customerId: numCustomerId,
          productId: numProductId,
          liters: numLiters,
          unitPrice: Number(unitPrice.toFixed(4)),
          currency,
          exchangeRate: Number(exchangeRate.toFixed(4)),
          totalCUP: Number(totalCUP.toFixed(4)),
          paymentMethod: 'cash',
        },
        include: { product: true, customer: true }
      })

      await tx.product.update({
        where: { id: numProductId },
        data: { currentStock: { decrement: numLiters } }
      })

      await tx.inventoryLog.create({
        data: {
          productId: numProductId,
          type: 'SALIDA',
          liters: numLiters,
          reason: 'Venta en POS'
        }
      })

      return newSale
    })

    return NextResponse.json({ success: true, sale })
  } catch (error: any) {
    console.error('ERROR AL CREAR VENTA:', error)
    return NextResponse.json({ error: 'Error interno: ' + (error.message || 'Desconocido') }, { status: 500 })
  }
}
