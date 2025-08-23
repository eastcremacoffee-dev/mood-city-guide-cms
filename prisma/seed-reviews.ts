import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedReviews() {
  console.log('🌱 Seeding reviews...')

  try {
    // Crear usuarios de prueba
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'maria@example.com' },
        update: {},
        create: {
          email: 'maria@example.com',
          name: 'María García',
          role: 'USER'
        }
      }),
      prisma.user.upsert({
        where: { email: 'carlos@example.com' },
        update: {},
        create: {
          email: 'carlos@example.com',
          name: 'Carlos López',
          role: 'USER'
        }
      }),
      prisma.user.upsert({
        where: { email: 'ana@example.com' },
        update: {},
        create: {
          email: 'ana@example.com',
          name: 'Ana Martínez',
          role: 'USER'
        }
      }),
      prisma.user.upsert({
        where: { email: 'pedro@example.com' },
        update: {},
        create: {
          email: 'pedro@example.com',
          name: 'Pedro Rodríguez',
          role: 'USER'
        }
      })
    ])

    console.log(`✅ Created ${users.length} users`)

    // Obtener cafeterías existentes
    const coffeeShops = await prisma.coffeeShop.findMany({
      where: { isActive: true }
    })

    if (coffeeShops.length === 0) {
      console.log('❌ No coffee shops found. Please seed coffee shops first.')
      return
    }

    // Crear reviews para cada cafetería
    const reviewsData = [
      {
        rating: 5,
        comment: 'Excelente café y ambiente muy acogedor. El personal es muy amable y el WiFi funciona perfectamente. Definitivamente volveré.',
        userId: users[0].id
      },
      {
        rating: 4,
        comment: 'Muy buen café, aunque a veces está un poco lleno. Los pasteles están deliciosos.',
        userId: users[1].id
      },
      {
        rating: 5,
        comment: '¡Increíble! El mejor café de la ciudad. El barista realmente sabe lo que hace.',
        userId: users[2].id
      },
      {
        rating: 3,
        comment: 'Está bien, pero he probado mejores. El servicio podría ser más rápido.',
        userId: users[3].id
      },
      {
        rating: 4,
        comment: 'Lugar perfecto para trabajar. Buen WiFi y ambiente tranquilo.',
        userId: users[0].id
      },
      {
        rating: 5,
        comment: 'Me encanta este lugar. El café está siempre perfecto y la música es genial.',
        userId: users[1].id
      }
    ]

    let reviewCount = 0

    // Crear reviews para cada cafetería
    for (const coffeeShop of coffeeShops) {
      // Crear 2-4 reviews por cafetería
      const numReviews = Math.floor(Math.random() * 3) + 2
      
      for (let i = 0; i < numReviews && reviewCount < reviewsData.length; i++) {
        const reviewData = reviewsData[reviewCount]
        
        try {
          await prisma.review.create({
            data: {
              ...reviewData,
              coffeeShopId: coffeeShop.id,
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
            }
          })
          reviewCount++
        } catch (error) {
          // Skip if review already exists (unique constraint)
          console.log(`⚠️  Review already exists for user ${reviewData.userId} and coffee shop ${coffeeShop.id}`)
        }
      }
    }

    console.log(`✅ Created ${reviewCount} reviews`)

    // Actualizar ratings de las cafeterías
    for (const coffeeShop of coffeeShops) {
      const reviews = await prisma.review.findMany({
        where: { coffeeShopId: coffeeShop.id },
        select: { rating: true }
      })

      if (reviews.length > 0) {
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        
        await prisma.coffeeShop.update({
          where: { id: coffeeShop.id },
          data: {
            rating: Math.round(averageRating * 10) / 10,
            reviewCount: reviews.length
          }
        })
      }
    }

    console.log('✅ Updated coffee shop ratings')
    console.log('🎉 Reviews seeding completed!')

  } catch (error) {
    console.error('❌ Error seeding reviews:', error)
    throw error
  }
}

seedReviews()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
