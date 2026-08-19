import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear productos (combustibles)
  const regular = await prisma.product.create({
    data: {
      name: 'Regular',
      priceCUP: 150.00, // Precio por litro en CUP
    },
  })

  const premium = await prisma.product.create({
    data: {
      name: 'Premium',
      priceCUP: 180.00,
    },
  })

  const diesel = await prisma.product.create({
    data: {
      name: 'Diesel',
      priceCUP: 140.00,
    },
  })

  // Crear tasas de cambio
  await prisma.exchangeRate.createMany({
    data: [
      { currency: 'USD', rateToCUP: 350.00 },
      { currency: 'EUR', rateToCUP: 380.00 },
      { currency: 'MLC', rateToCUP: 320.00 },
    ],
  })

  // Crear cliente de ejemplo
  await prisma.customer.create({
    data: {
      name: 'Cliente General',
      taxId: '0000000000',
      phone: '55555555',
    },
  })

  console.log('✅ Seed completado:')
  console.log('   - 3 productos (Regular, Premium, Diesel)')
  console.log('   - 3 tasas de cambio (USD, EUR, MLC)')
  console.log('   - 1 cliente general')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })