'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'cajera') {
      alert('No tienes permiso para ver esta pagina.')
      router.push('/')
      return
    }
    fetchCustomers()
  }, [router])

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      if (data.success) setCustomers(data.customers)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, taxId, phone, email })
      })
      const data = await res.json()
      if (data.success) {
        alert('Cliente creado con ID: ' + data.customer.id)
        setName(''); setTaxId(''); setPhone(''); setEmail('')
        setShowForm(false)
        fetchCustomers()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (err) {
      alert('Error de conexion')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.taxId && c.taxId.includes(searchTerm)) ||
    (c.phone && c.phone.includes(searchTerm))
  )

  if (!user) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-800">👥 Gestion de Clientes - PA'MIGENTE</h1>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">← Volver al POS</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, ID fiscal o telefono..."
            className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
          >
            {showForm ? '✖ Cancelar' : '➕ Nuevo Cliente'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Registrar Nuevo Cliente</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ID Fiscal / NIT</label>
                <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="Ej: 0000000000" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefono</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: 55555555" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <button type="submit" disabled={loading} className="md:col-span-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg">
                {loading ? 'Guardando...' : '💾 GUARDAR CLIENTE'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Clientes Registrados ({filteredCustomers.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">ID Fiscal</th>
                  <th className="p-3">Telefono</th>
                  <th className="p-3">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-400">No hay clientes registrados</td></tr>
                ) : (
                  filteredCustomers.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-blue-600">#{c.id}</td>
                      <td className="p-3 font-semibold">{c.name}</td>
                      <td className="p-3 text-sm text-gray-600">{c.taxId || '-'}</td>
                      <td className="p-3 text-sm text-gray-600">{c.phone || '-'}</td>
                      <td className="p-3 text-sm text-gray-600">{c.email || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
