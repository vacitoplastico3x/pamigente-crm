import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// LISTAR todos los clientes
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, customers })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}

// CREAR nuevo cliente
export async function POST(req: NextRequest) {
  try {
    const { name, taxId, phone, email } = await req.json()

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        taxId: taxId?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
      }
    })

    return NextResponse.json({ success: true, customer })
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al crear cliente: ' + error.message }, { status: 500 })
  }
}
