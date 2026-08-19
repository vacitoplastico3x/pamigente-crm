import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })
    return NextResponse.json({ success: true, products })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener inventario' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productId, liters, reason } = await req.json()
    const numLiters = Number(liters)
    const numProductId = Number(productId)

    if (!numProductId || numLiters <= 0) {
      return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: numProductId },
        data: { currentStock: { increment: numLiters } }
      })

      await tx.inventoryLog.create({
        data: {
          productId: numProductId,
          type: 'ENTRADA',
          liters: numLiters,
          reason: reason || 'Reabastecimiento'
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al agregar inventario' }, { status: 500 })
  }
}