import { NextResponse } from 'next/server'

export async function POST() {
  // En un sistema real, aquí borraríamos la cookie de sesión.
  // Para este MVP, el frontend se encarga de borrar el localStorage.
  return NextResponse.json({ success: true })
}