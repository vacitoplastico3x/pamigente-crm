import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  console.log('🌱 Creando tasas de cambio...')
  await p.exchangeRate.createMany({
    data: [
      { currency: 'USD', rateToCUP: 350 },
      { currency: 'EUR', rateToCUP: 380 },
      { currency: 'MLC', rateToCUP: 320 }
    ]
  })
  console.log('✅ Tasas creadas')
}

main()
  .catch(e => console.error(e))
  .finally(() => p.$disconnect())