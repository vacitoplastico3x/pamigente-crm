import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creando usuarios de prueba...')
  
  await prisma.user.createMany({
    data: [
      { username: 'admin', password: 'admin123', name: 'Jefe Principal', role: 'admin' },
      { username: 'contador', password: 'conta123', name: 'Contador', role: 'contador' },
      { username: 'cajera', password: 'caja123', name: 'María (Cajera)', role: 'cajera' },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Usuarios creados exitosamente:')
  console.log('   👑 admin / admin123 → Jefe')
  console.log('   📊 contador / conta123 → Contador')
  console.log('   💰 cajera / caja123 → Cajera')
}

main()
  .catch((e) => console.error('❌ Error:', e))
  .finally(async () => await prisma.$disconnect())