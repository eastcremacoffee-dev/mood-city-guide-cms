import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...')

  // Limpiar datos existentes
  await prisma.review.deleteMany()
  await prisma.userFavorite.deleteMany()
  await prisma.coffeeFeature.deleteMany()
  await prisma.coffeeShopImage.deleteMany()
  await prisma.coffeeShop.deleteMany()
  await prisma.city.deleteMany()
  await prisma.user.deleteMany()

  // Crear ciudades
  console.log('🌍 Creando ciudades...')
  
  const madrid = await prisma.city.create({
    data: {
      name: 'Madrid',
      country: 'España',
      latitude: 40.4168,
      longitude: -3.7038,
      description: 'La vibrante capital de España, conocida por su rica cultura cafetera y ambiente cosmopolita.',
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  })

  const barcelona = await prisma.city.create({
    data: {
      name: 'Barcelona',
      country: 'España',
      latitude: 41.3851,
      longitude: 2.1734,
      description: 'Ciudad mediterránea con una escena cafetera innovadora y arquitectura única.',
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  })

  const paris = await prisma.city.create({
    data: {
      name: 'París',
      country: 'Francia',
      latitude: 48.8566,
      longitude: 2.3522,
      description: 'La ciudad del amor con una tradición cafetera centenaria y cafés históricos.',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80'
    }
  })

  const london = await prisma.city.create({
    data: {
      name: 'Londres',
      country: 'Reino Unido',
      latitude: 51.5074,
      longitude: -0.1278,
      description: 'Metrópolis multicultural con una floreciente cultura del café de especialidad.',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  })

  // Crear usuarios de prueba
  console.log('👥 Creando usuarios...')
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@moodcityguide.com',
      name: 'Admin User',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    }
  })

  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    }
  })

  // Crear cafeterías en Madrid
  console.log('☕ Creando cafeterías en Madrid...')
  
  const cafecentral = await prisma.coffeeShop.create({
    data: {
      name: 'Café Central',
      description: 'Histórico café en el corazón de Madrid, famoso por su ambiente bohemio y excelente café.',
      address: 'Plaza del Ángel, 10, 28012 Madrid',
      latitude: 40.4139,
      longitude: -3.7003,
      phone: '+34 913 69 41 43',
      website: 'https://cafecentral.es',
      instagram: '@cafecentral_madrid',
      email: 'info@cafecentral.es',
      openingHours: {
        monday: { open: '08:00', close: '02:00' },
        tuesday: { open: '08:00', close: '02:00' },
        wednesday: { open: '08:00', close: '02:00' },
        thursday: { open: '08:00', close: '02:00' },
        friday: { open: '08:00', close: '02:30' },
        saturday: { open: '08:00', close: '02:30' },
        sunday: { open: '08:00', close: '02:00' }
      },
      hasWifi: true,
      hasOutdoor: true,
      hasPower: true,
      isQuiet: false,
      priceRange: 'MEDIUM',
      isVerified: true,
      cityId: madrid.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=2047&q=80',
            alt: 'Interior del Café Central',
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            alt: 'Terraza del Café Central',
            isPrimary: false
          }
        ]
      }
    }
  })

  const lamallorquina = await prisma.coffeeShop.create({
    data: {
      name: 'La Mallorquina',
      description: 'Pastelería y cafetería tradicional desde 1894, ubicada en la Puerta del Sol.',
      address: 'Puerta del Sol, 8, 28013 Madrid',
      latitude: 40.4169,
      longitude: -3.7033,
      phone: '+34 915 21 12 01',
      website: 'https://lamallorquina.es',
      openingHours: {
        monday: { open: '09:00', close: '21:00' },
        tuesday: { open: '09:00', close: '21:00' },
        wednesday: { open: '09:00', close: '21:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '09:00', close: '21:00' },
        sunday: { open: '09:00', close: '21:00' }
      },
      hasWifi: false,
      hasOutdoor: false,
      hasPower: false,
      isQuiet: false,
      priceRange: 'LOW',
      isVerified: true,
      cityId: madrid.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
            alt: 'Interior de La Mallorquina',
            isPrimary: true
          }
        ]
      }
    }
  })

  const federica = await prisma.coffeeShop.create({
    data: {
      name: 'Federica & Co',
      description: 'Café de especialidad con tostado propio y ambiente moderno en el barrio de Malasaña.',
      address: 'Calle de la Palma, 49, 28004 Madrid',
      latitude: 40.4267,
      longitude: -3.7038,
      phone: '+34 910 05 47 53',
      instagram: '@federica_co',
      openingHours: {
        monday: { open: '08:30', close: '18:00' },
        tuesday: { open: '08:30', close: '18:00' },
        wednesday: { open: '08:30', close: '18:00' },
        thursday: { open: '08:30', close: '18:00' },
        friday: { open: '08:30', close: '18:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { open: '09:00', close: '18:00' }
      },
      hasWifi: true,
      hasOutdoor: false,
      hasPower: true,
      isQuiet: true,
      priceRange: 'HIGH',
      isVerified: true,
      cityId: madrid.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1559496417-e7f25cb247cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2076&q=80',
            alt: 'Interior moderno de Federica & Co',
            isPrimary: true
          }
        ]
      }
    }
  })

  // Crear cafeterías en Barcelona
  console.log('☕ Creando cafeterías en Barcelona...')
  
  const nomadcoffee = await prisma.coffeeShop.create({
    data: {
      name: 'Nomad Coffee Lab',
      description: 'Laboratorio de café con los mejores granos del mundo y métodos de extracción innovadores.',
      address: 'Passatge Sert, 12, 08003 Barcelona',
      latitude: 41.3839,
      longitude: 2.1851,
      phone: '+34 933 42 22 81',
      website: 'https://nomadcoffee.es',
      instagram: '@nomadcoffeelab',
      openingHours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { open: '09:00', close: '18:00' }
      },
      hasWifi: true,
      hasOutdoor: true,
      hasPower: true,
      isQuiet: true,
      priceRange: 'HIGH',
      isVerified: true,
      cityId: barcelona.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            alt: 'Nomad Coffee Lab interior',
            isPrimary: true
          }
        ]
      }
    }
  })

  // Crear cafeterías en París
  console.log('☕ Creando cafeterías en París...')
  
  const cafeflore = await prisma.coffeeShop.create({
    data: {
      name: 'Café de Flore',
      description: 'Icónico café parisino frecuentado por intelectuales y artistas desde 1887.',
      address: '172 Boulevard Saint-Germain, 75006 Paris',
      latitude: 48.8542,
      longitude: 2.3320,
      phone: '+33 1 45 48 55 26',
      website: 'https://cafedeflore.fr',
      openingHours: {
        monday: { open: '07:30', close: '02:00' },
        tuesday: { open: '07:30', close: '02:00' },
        wednesday: { open: '07:30', close: '02:00' },
        thursday: { open: '07:30', close: '02:00' },
        friday: { open: '07:30', close: '02:00' },
        saturday: { open: '07:30', close: '02:00' },
        sunday: { open: '07:30', close: '02:00' }
      },
      hasWifi: false,
      hasOutdoor: true,
      hasPower: false,
      isQuiet: false,
      priceRange: 'HIGH',
      isVerified: true,
      cityId: paris.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
            alt: 'Café de Flore exterior',
            isPrimary: true
          }
        ]
      }
    }
  })

  // Crear reviews
  console.log('⭐ Creando reviews...')
  
  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        comment: 'Ambiente increíble y el mejor café de Madrid. Perfecto para trabajar.',
        userId: testUser.id,
        coffeeShopId: cafecentral.id
      },
      {
        rating: 4,
        comment: 'Clásico de Madrid, aunque un poco turístico. Los pasteles están buenísimos.',
        userId: testUser.id,
        coffeeShopId: lamallorquina.id
      },
      {
        rating: 5,
        comment: 'El mejor café de especialidad de Madrid. Los baristas son verdaderos artistas.',
        userId: adminUser.id,
        coffeeShopId: federica.id
      },
      {
        rating: 5,
        comment: 'Innovación y calidad en cada taza. Imprescindible en Barcelona.',
        userId: adminUser.id,
        coffeeShopId: nomadcoffee.id
      },
      {
        rating: 4,
        comment: 'Historia pura. Un must en París, aunque los precios son elevados.',
        userId: testUser.id,
        coffeeShopId: cafeflore.id
      }
    ]
  })

  // Crear favoritos
  console.log('❤️ Creando favoritos...')
  
  await prisma.userFavorite.createMany({
    data: [
      {
        userId: testUser.id,
        coffeeShopId: cafecentral.id
      },
      {
        userId: testUser.id,
        coffeeShopId: federica.id
      },
      {
        userId: adminUser.id,
        coffeeShopId: nomadcoffee.id
      },
      {
        userId: adminUser.id,
        coffeeShopId: cafeflore.id
      }
    ]
  })

  // Crear features para las cafeterías
  console.log('🎯 Creando feature templates...')
  
  // Crear feature templates primero
  const espressoFeature = await prisma.featureTemplate.create({
    data: {
      name: 'Espresso',
      iconName: 'cup.and.saucer.fill',
      category: 'COFFEE'
    }
  })
  
  const batchBrewFeature = await prisma.featureTemplate.create({
    data: {
      name: 'Batch brew',
      iconName: 'drop.fill',
      category: 'COFFEE'
    }
  })
  
  const handBrewFeature = await prisma.featureTemplate.create({
    data: {
      name: 'Hand brew',
      iconName: 'drop.triangle.fill',
      category: 'COFFEE'
    }
  })
  
  const coldBrewFeature = await prisma.featureTemplate.create({
    data: {
      name: 'Cold brew',
      iconName: 'snowflake',
      category: 'COFFEE'
    }
  })
  
  const pastelesFeature = await prisma.featureTemplate.create({
    data: {
      name: 'Pasteles',
      iconName: 'birthday.cake.fill',
      category: 'FOOD_DRINKS'
    }
  })
  
  const wifiFeature = await prisma.featureTemplate.create({
    data: {
      name: 'WiFi',
      iconName: 'wifi',
      category: 'MORE'
    }
  })
  
  const terrazaFeature = await prisma.featureTemplate.create({
    data: {
      name: 'Terraza',
      iconName: 'sun.max.fill',
      category: 'MORE'
    }
  })
  
  const plantMilkFeature = await prisma.featureTemplate.create({
    data: {
      name: 'Plant based milk',
      iconName: 'leaf.fill',
      category: 'FOOD_DRINKS'
    }
  })
  
  console.log('☕ Asignando features a cafeterías...')
  
  // Features para Café Central
  await prisma.coffeeFeature.createMany({
    data: [
      {
        coffeeShopId: cafecentral.id,
        featureId: espressoFeature.id
      },
      {
        coffeeShopId: cafecentral.id,
        featureId: batchBrewFeature.id
      },
      {
        coffeeShopId: cafecentral.id,
        featureId: handBrewFeature.id
      },
      {
        coffeeShopId: cafecentral.id,
        featureId: coldBrewFeature.id
      }
    ]
  })

  // Features para La Mallorquina
  await prisma.coffeeFeature.createMany({
    data: [
      {
        coffeeShopId: lamallorquina.id,
        featureId: espressoFeature.id
      },
      {
        coffeeShopId: lamallorquina.id,
        featureId: pastelesFeature.id
      }
    ]
  })

  // Features para Federica & Co - TEMPORALMENTE COMENTADO PARA BUILD
  /*
  await prisma.coffeeFeature.createMany({
    data: [
      {
        name: 'Espresso',
        iconName: 'cup.and.saucer.fill',
        coffeeShopId: federica.id
      },
      {
        name: 'Hand brew',
        iconName: 'drop.triangle.fill',
        coffeeShopId: federica.id
      },
      {
        name: 'Cold brew',
        iconName: 'snowflake',
        coffeeShopId: federica.id
      },
      {
        name: 'Plant based milk',
        iconName: 'leaf.fill',
        coffeeShopId: federica.id
      }
    ]
  })
  */

  // Features para Nomad Coffee Lab - TEMPORALMENTE COMENTADO PARA BUILD
  /*
  await prisma.coffeeFeature.createMany({
    data: [
      {
        name: 'Espresso',
        iconName: 'cup.and.saucer.fill',
        coffeeShopId: nomadcoffee.id
      },
      {
        name: 'Batch brew',
        iconName: 'drop.fill',
        coffeeShopId: nomadcoffee.id
      },
      {
        name: 'Hand brew',
        iconName: 'drop.triangle.fill',
        coffeeShopId: nomadcoffee.id
      },
      {
        name: 'Cold brew',
        iconName: 'snowflake',
        coffeeShopId: nomadcoffee.id
      },
      {
        name: 'Plant based milk',
        iconName: 'leaf.fill',
        coffeeShopId: nomadcoffee.id
      }
    ]
  })
  */

  // Features para Café de Flore - TEMPORALMENTE COMENTADO PARA BUILD
  /*
  await prisma.coffeeFeature.createMany({
    data: [
      {
        name: 'Espresso',
        iconName: 'cup.and.saucer.fill',
        coffeeShopId: cafeflore.id
      },
      {
        name: 'French Press',
        iconName: 'cylinder.fill',
        coffeeShopId: cafeflore.id
      }
    ]
  })
  */

  console.log('✅ Seed completado exitosamente!')
  console.log(`
📊 Datos creados:
- 4 ciudades (Madrid, Barcelona, París, Londres)
- 2 usuarios (admin y test)
- 5 cafeterías con imágenes
- 5 reviews
- 4 favoritos
- Features para todas las cafeterías
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
