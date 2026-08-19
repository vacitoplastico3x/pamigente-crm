import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Eliminamos espacios en blanco accidentales al inicio o final
    const username = String(body.username).trim()
    const password = String(body.password).trim()

    console.log('🔍 Intento de login -> Usuario:', `"${username}"`, '| Contraseña:', `"${password}"`)

    const user = await prisma.user.findUnique({ where: { username } })

    if (!user) {
      console.log('❌ Fallo: El usuario NO existe en la base de datos.')
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
    }

    if (user.password !== password) {
      console.log('❌ Fallo: La contraseña NO coincide. (En BD:', `"${user.password}"`, ')')
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
    }

    if (!user.active) {
      console.log('❌ Fallo: El usuario está desactivado.')
      return NextResponse.json({ error: 'Usuario desactivado' }, { status: 401 })
    }

    console.log('✅ Login exitoso para:', user.username)
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, username: user.username, name: user.name, role: user.role }
    })
  } catch (error: any) {
    console.error('❌ Error crítico en login:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}