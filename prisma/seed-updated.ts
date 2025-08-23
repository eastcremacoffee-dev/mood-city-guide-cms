import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...')

  // Limpiar datos existentes
  await prisma.coffeeFeature.deleteMany()
  await prisma.review.deleteMany()
  await prisma.userFavorite.deleteMany()
  await prisma.coffeeShopImage.deleteMany()
  await prisma.coffeeShop.deleteMany()
  await prisma.user.deleteMany()
  await prisma.city.deleteMany()

  console.log('🌍 Creando ciudades...')
  
  const madrid = await prisma.city.create({
    data: {
      name: 'Madrid',
      country: 'España',
      latitude: 40.4168,
      longitude: -3.7038,
      isActive: true
    }
  })

  const barcelona = await prisma.city.create({
    data: {
      name: 'Barcelona',
      country: 'España',
      latitude: 41.3851,
      longitude: 2.1734,
      isActive: true
    }
  })

  const paris = await prisma.city.create({
    data: {
      name: 'París',
      country: 'Francia',
      latitude: 48.8566,
      longitude: 2.3522,
      isActive: true
    }
  })

  const porto = await prisma.city.create({
    data: {
      name: 'Oporto',
      country: 'Portugal',
      latitude: 41.1579,
      longitude: -8.6291,
      isActive: true
    }
  })

  console.log('👥 Creando usuarios...')
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@moodcityguide.com',
      name: 'Admin User',
      role: 'ADMIN'
    }
  })

  const testUser = await prisma.user.create({
    data: {
      email: 'test@moodcityguide.com',
      name: 'Test User',
      role: 'USER'
    }
  })

  console.log('☕ Creando cafeterías en Madrid...')
  
  const cafecentral = await prisma.coffeeShop.create({
    data: {
      name: 'Café Central',
      description: 'Un café histórico en el corazón de Madrid con ambiente clásico y excelente café.',
      address: 'Plaza del Ángel, 10, 28012 Madrid',
      latitude: 40.4150,
      longitude: -3.7000,
      phone: '+34 913 69 41 43',
      website: 'https://cafecentral.es',
      instagram: '@cafecentral_madrid',
      email: 'info@cafecentral.es',
      openingHours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '22:00' },
        saturday: { open: '09:00', close: '22:00' },
        sunday: { open: '09:00', close: '20:00' }
      },
      hasWifi: true,
      hasOutdoor: false,
      hasPower: true,
      isQuiet: true,
      priceRange: 'MEDIUM',
      rating: 4.5,
      reviewCount: 10,
      isActive: true,
      isVerified: true,
      cityId: madrid.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2047&q=80',
            alt: 'Café Central - Interior clásico',
            isPrimary: true
          }
        ]
      }
    }
  })

  const lamallorquina = await prisma.coffeeShop.create({
    data: {
      name: 'La Mallorquina',
      description: 'Pastelería tradicional madrileña famosa por sus napolitanas y café.',
      address: 'Puerta del Sol, 8, 28013 Madrid',
      latitude: 40.4169,
      longitude: -3.7033,
      phone: '+34 915 21 12 01',
      website: 'https://lamallorquina.es',
      instagram: '@lamallorquina_oficial',
      openingHours: {
        monday: { open: '09:00', close: '21:00' },
        tuesday: { open: '09:00', close: '21:00' },
        wednesday: { open: '09:00', close: '21:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '09:00', close: '21:00' },
        sunday: { open: '10:00', close: '20:00' }
      },
      hasWifi: false,
      hasOutdoor: false,
      hasPower: false,
      isQuiet: false,
      priceRange: 'LOW',
      rating: 4.2,
      reviewCount: 8,
      isActive: true,
      isVerified: true,
      cityId: madrid.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=2047&q=80',
            alt: 'La Mallorquina - Pastelería tradicional',
            isPrimary: true
          }
        ]
      }
    }
  })

  console.log('☕ Creando cafeterías en Barcelona...')
  
  const federica = await prisma.coffeeShop.create({
    data: {
      name: 'Federica & Co',
      description: 'Café de especialidad con tostado propio y ambiente moderno.',
      address: 'Carrer de Salvà, 3, 08004 Barcelona',
      latitude: 41.3775,
      longitude: 2.1825,
      phone: '+34 934 41 87 13',
      website: 'https://federicaco.com',
      instagram: '@federica_co',
      openingHours: {
        monday: { open: '08:30', close: '19:00' },
        tuesday: { open: '08:30', close: '19:00' },
        wednesday: { open: '08:30', close: '19:00' },
        thursday: { open: '08:30', close: '19:00' },
        friday: { open: '08:30', close: '19:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '09:00', close: '18:00' }
      },
      hasWifi: true,
      hasOutdoor: true,
      hasPower: true,
      isQuiet: true,
      priceRange: 'HIGH',
      rating: 4.7,
      reviewCount: 15,
      isActive: true,
      isVerified: true,
      cityId: barcelona.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=2047&q=80',
            alt: 'Federica & Co - Café de especialidad',
            isPrimary: true
          }
        ]
      }
    }
  })

  const nomadcoffee = await prisma.coffeeShop.create({
    data: {
      name: 'Nomad Coffee Lab',
      description: 'Laboratorio de café con métodos de extracción únicos.',
      address: 'Carrer de la Passatge de la Pau, 11, 08002 Barcelona',
      latitude: 41.3888,
      longitude: 2.1590,
      phone: '+34 933 42 22 81',
      website: 'https://nomadcoffee.es',
      instagram: '@nomadcoffeelab',
      openingHours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '09:00', close: '19:00' }
      },
      hasWifi: true,
      hasOutdoor: false,
      hasPower: true,
      isQuiet: true,
      priceRange: 'HIGH',
      rating: 4.8,
      reviewCount: 12,
      isActive: true,
      isVerified: true,
      cityId: barcelona.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=2047&q=80',
            alt: 'Nomad Coffee Lab - Laboratorio de café',
            isPrimary: true
          }
        ]
      }
    }
  })

  console.log('☕ Creando cafeterías en París...')
  
  const cafeflore = await prisma.coffeeShop.create({
    data: {
      name: 'Café de Flore',
      description: 'Icónico café parisino con historia literaria y ambiente bohemio.',
      address: '172 Boulevard Saint-Germain, 75006 Paris',
      latitude: 48.8542,
      longitude: 2.3320,
      phone: '+33 1 45 48 55 26',
      website: 'https://cafedeflore.fr',
      instagram: '@cafedeflore_paris',
      openingHours: {
        monday: { open: '07:30', close: '01:30' },
        tuesday: { open: '07:30', close: '01:30' },
        wednesday: { open: '07:30', close: '01:30' },
        thursday: { open: '07:30', close: '01:30' },
        friday: { open: '07:30', close: '01:30' },
        saturday: { open: '07:30', close: '01:30' },
        sunday: { open: '07:30', close: '01:30' }
      },
      hasWifi: false,
      hasOutdoor: true,
      hasPower: false,
      isQuiet: false,
      priceRange: 'HIGH',
      rating: 4.3,
      reviewCount: 20,
      isActive: true,
      isVerified: true,
      cityId: paris.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1559496417-e7f25cb247cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2047&q=80',
            alt: 'Café de Flore - Icónico café parisino',
            isPrimary: true
          }
        ]
      }
    }
  })

  const eastcrema = await prisma.coffeeShop.create({
    data: {
      name: 'East Crema Coffee Almirante',
      description: 'Cafetería de especialidad con café de origen único y repostería artesanal.',
      address: 'Rua do Almirante, 15, 4050-010 Porto, Portugal',
      latitude: 41.1496,
      longitude: -8.6109,
      phone: '+351 22 987 6543',
      website: 'https://eastcrema.com',
      instagram: '@eastcrema_porto',
      openingHours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '09:00', close: '20:00' }
      },
      hasWifi: true,
      hasOutdoor: false,
      hasPower: true,
      isQuiet: true,
      priceRange: 'MEDIUM',
      rating: 4.6,
      reviewCount: 7,
      isActive: true,
      isVerified: true,
      cityId: porto.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2047&q=80',
            alt: 'East Crema Coffee Almirante - Interior',
            isPrimary: true
          }
        ]
      }
    }
  })

  console.log('⭐ Creando reviews...')
  
  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        comment: 'Excelente café y ambiente único. Muy recomendable.',
        userId: adminUser.id,
        coffeeShopId: cafecentral.id
      },
      {
        rating: 4,
        comment: 'Buen café, aunque un poco caro.',
        userId: testUser.id,
        coffeeShopId: federica.id
      },
      {
        rating: 5,
        comment: 'El mejor café de Barcelona sin duda.',
        userId: adminUser.id,
        coffeeShopId: nomadcoffee.id
      },
      {
        rating: 4,
        comment: 'Ambiente histórico increíble.',
        userId: testUser.id,
        coffeeShopId: cafeflore.id
      },
      {
        rating: 5,
        comment: 'Café excepcional y servicio perfecto.',
        userId: adminUser.id,
        coffeeShopId: eastcrema.id
      }
    ]
  })

  console.log('❤️ Creando favoritos...')
  
  await prisma.userFavorite.createMany({
    data: [
      {
        userId: adminUser.id,
        coffeeShopId: cafecentral.id
      },
      {
        userId: adminUser.id,
        coffeeShopId: nomadcoffee.id
      },
      {
        userId: testUser.id,
        coffeeShopId: federica.id
      },
      {
        userId: testUser.id,
        coffeeShopId: cafeflore.id
      }
    ]
  })

  console.log('🎯 Creando features de cafeterías...')
  
  // Obtener todas las features predefinidas
  const allFeatures = await prisma.featureTemplate.findMany({
    where: { isActive: true }
  })
  
  // Obtener todas las cafeterías
  const allCoffeeShops = [cafecentral, lamallorquina, federica, nomadcoffee, cafeflore, eastcrema]
  
  // Asignar features aleatorias a cada cafetería
  for (const coffeeShop of allCoffeeShops) {
    // Seleccionar 5-8 features aleatorias
    const shuffledFeatures = allFeatures.sort(() => Math.random() - 0.5)
    const selectedFeatures = shuffledFeatures.slice(0, Math.floor(Math.random() * 4) + 5)
    
    // Crear las relaciones
    for (const feature of selectedFeatures) {
      await prisma.coffeeFeature.create({
        data: {
          coffeeShopId: coffeeShop.id,
          featureId: feature.id
        }
      })
    }
    
    console.log(`   ✅ Asignadas ${selectedFeatures.length} features a ${coffeeShop.name}`)
  }

  console.log('✅ Seed completado exitosamente!')
  console.log(`
📊 Datos creados:
- 4 ciudades (Madrid, Barcelona, París, Oporto)
- 2 usuarios (admin y test)
- 6 cafeterías con imágenes
- 5 reviews
- 4 favoritos
- Features aleatorias para todas las cafeterías
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
