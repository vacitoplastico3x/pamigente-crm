import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  console.log('🌱 Creando productos...')
  await p.product.createMany({
    data: [
      { name: 'Regular', priceCUP: 150, currentStock: 10000 },
      { name: 'Premium', priceCUP: 180, currentStock: 10000 },
      { name: 'Diesel', priceCUP: 140, currentStock: 10000 }
    ]
  })
  console.log('✅ Productos creados')
}

main()
  .catch(e => console.error(e))
  .finally(() => p.$disconnect())