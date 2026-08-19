import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Corrigiendo y garantizando contraseñas en la base de datos...')
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: 'admin123', name: 'Jefe Principal', role: 'admin', active: true },
    create: { username: 'admin', password: 'admin123', name: 'Jefe Principal', role: 'admin' },
  })
  
  await prisma.user.upsert({
    where: { username: 'contador' },
    update: { password: 'conta123', name: 'Contador', role: 'contador', active: true },
    create: { username: 'contador', password: 'conta123', name: 'Contador', role: 'contador' },
  })
  
  await prisma.user.upsert({
    where: { username: 'cajera' },
    update: { password: 'caja123', name: 'María (Cajera)', role: 'cajera', active: true },
    create: { username: 'cajera', password: 'caja123', name: 'María (Cajera)', role: 'cajera' },
  })

  console.log('✅ ¡Contraseñas corregidas y garantizadas al 100%!')
  console.log('   👑 admin / admin123')
  console.log('   📊 contador / conta123')
  console.log('   💰 cajera / caja123')
}

main()
  .catch((e) => console.error('❌ Error:', e))
  .finally(async () => await prisma.$disconnect())