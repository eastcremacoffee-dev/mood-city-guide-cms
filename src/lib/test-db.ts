// Configuración de base de datos para testing
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
// import { join } from 'path' // Removed unused import

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db'
    }
  }
})

// Setup de base de datos para tests
export async function setupTestDatabase() {
  try {
    // Aplicar migraciones a la base de datos de test
    execSync('npx prisma db push --force-reset', {
      env: { ...process.env, DATABASE_URL: 'file:./test.db' },
      stdio: 'pipe'
    })

    console.log('✅ Base de datos de test configurada')
  } catch (error) {
    console.error('❌ Error configurando base de datos de test:', error)
    throw error
  }
}

// Limpiar base de datos después de cada test
export async function cleanupTestDatabase() {
  try {
    // Limpiar todas las tablas en orden correcto (respetando foreign keys)
    await prisma.coffeeFeature.deleteMany()
    await prisma.userFavorite.deleteMany()
    await prisma.review.deleteMany()
    await prisma.coffeeShopImage.deleteMany()
    await prisma.coffeeShop.deleteMany()
    await prisma.featureTemplate.deleteMany()
    await prisma.city.deleteMany()
    await prisma.user.deleteMany()

    console.log('🧹 Base de datos de test limpiada')
  } catch (error) {
    console.error('❌ Error limpiando base de datos de test:', error)
    throw error
  }
}

// Cerrar conexión de base de datos
export async function closeTestDatabase() {
  await prisma.$disconnect()
}

// Crear datos de prueba
export async function createTestData() {
  // Crear usuario de prueba
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      appleUserId: 'test-apple-id',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER'
    }
  })

  // Crear ciudad de prueba
  const testCity = await prisma.city.create({
    data: {
      name: 'Madrid Test',
      country: 'España',
      latitude: 40.4168,
      longitude: -3.7038,
      description: 'Ciudad de prueba',
      isActive: true
    }
  })

  // Crear cafetería de prueba
  const testCoffeeShop = await prisma.coffeeShop.create({
    data: {
      name: 'Café Test',
      description: 'Cafetería de prueba',
      address: 'Calle Test, 123',
      latitude: 40.4168,
      longitude: -3.7038,
      phone: '+34 123 456 789',
      hasWifi: true,
      hasOutdoor: false,
      hasPower: true,
      isQuiet: true,
      priceRange: 'MEDIUM',
      cityId: testCity.id,
      isActive: true
    }
  })

  // Crear feature template de prueba
  const testFeature = await prisma.featureTemplate.create({
    data: {
      name: 'WiFi Test',
      iconName: 'wifi',
      category: 'MORE',
      isActive: true
    }
  })

  return {
    user: testUser,
    city: testCity,
    coffeeShop: testCoffeeShop,
    feature: testFeature
  }
}

export { prisma as testPrisma }
