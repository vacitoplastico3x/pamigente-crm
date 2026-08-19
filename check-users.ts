import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log('📊 USUARIOS EN LA BASE DE DATOS:')
  console.log(JSON.stringify(users, null, 2))
}

main()
  .catch((e) => console.error('❌ Error:', e))
  .finally(async () => await prisma.$disconnect())