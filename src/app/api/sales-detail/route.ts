import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 })
    }

    const sale = await prisma.sale.findUnique({
      where: { id: Number(id) },
      include: {
        product: true,
        customer: true
      }
    })

    if (!sale) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, sale })
  } catch (error: any) {
    console.error('Error al obtener venta:', error)
    return NextResponse.json({ error: 'Error interno: ' + error.message }, { status: 500 })
  }
}
