'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (data.success) {
        // Guardar sesión en el navegador
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/')
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⛽</div>
          <h1 className="text-3xl font-black text-gray-800">Fuel CRM</h1>
          <p className="text-gray-500 mt-2">Sistema de Control y Ventas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="Ej: admin"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            {loading ? 'Verificando...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Credenciales de Prueba:</div>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between"><span>👑 Jefe:</span> <span className="font-mono bg-gray-200 px-2 rounded">admin / admin123</span></div>
            <div className="flex justify-between"><span>📊 Contador:</span> <span className="font-mono bg-gray-200 px-2 rounded">contador / conta123</span></div>
            <div className="flex justify-between"><span>💰 Cajera:</span> <span className="font-mono bg-gray-200 px-2 rounded">cajera / caja123</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}