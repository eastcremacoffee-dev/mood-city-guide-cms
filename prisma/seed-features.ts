import { PrismaClient, FeatureCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Creando features predefinidas...')

  // Features de Coffee
  const coffeeFeatures = [
    { name: 'Espresso', iconName: 'cup.and.saucer.fill', category: FeatureCategory.COFFEE },
    { name: 'Batch brew', iconName: 'drop.fill', category: FeatureCategory.COFFEE },
    { name: 'Hand brew', iconName: 'drop.triangle.fill', category: FeatureCategory.COFFEE },
    { name: 'Cold brew', iconName: 'snowflake', category: FeatureCategory.COFFEE },
    { name: 'Nitro cold brew', iconName: 'bubble.left.and.bubble.right.fill', category: FeatureCategory.COFFEE },
    { name: 'Descafeinado', iconName: 'cup.and.saucer', category: FeatureCategory.COFFEE },
    { name: 'Plant based milk', iconName: 'leaf.fill', category: FeatureCategory.COFFEE },
    { name: 'Bolsas de café', iconName: 'bag.fill', category: FeatureCategory.COFFEE }
  ]

  // Features de Food & Drinks
  const foodFeatures = [
    { name: 'Gluten free', iconName: 'checkmark.seal.fill', category: FeatureCategory.FOOD_DRINKS },
    { name: 'Brunch/lunch', iconName: 'fork.knife', category: FeatureCategory.FOOD_DRINKS },
    { name: 'Vegan / Opciones vegetarianas', iconName: 'leaf.circle.fill', category: FeatureCategory.FOOD_DRINKS },
    { name: 'Alcohol / Cerveza', iconName: 'wineglass.fill', category: FeatureCategory.FOOD_DRINKS }
  ]

  // Features de More
  const moreFeatures = [
    { name: 'Espacio para sentarse', iconName: 'chair.fill', category: FeatureCategory.MORE },
    { name: 'Terraza', iconName: 'sun.max.fill', category: FeatureCategory.MORE },
    { name: 'Aceptan tarjetas', iconName: 'creditcard.fill', category: FeatureCategory.MORE },
    { name: 'Wi-Fi', iconName: 'wifi', category: FeatureCategory.MORE },
    { name: 'Laptop friendly', iconName: 'laptopcomputer', category: FeatureCategory.MORE },
    { name: 'Pet friendly', iconName: 'pawprint.fill', category: FeatureCategory.MORE },
    { name: 'Accesibilidad', iconName: 'figure.roll', category: FeatureCategory.MORE },
    { name: 'Tarjeta de fidelización', iconName: 'star.circle.fill', category: FeatureCategory.MORE }
  ]

  // Combinar todas las features
  const allFeatures = [...coffeeFeatures, ...foodFeatures, ...moreFeatures]

  // Crear features en la base de datos
  for (const feature of allFeatures) {
    await prisma.featureTemplate.upsert({
      where: { name: feature.name },
      update: {
        iconName: feature.iconName,
        category: feature.category,
        isActive: true
      },
      create: {
        name: feature.name,
        iconName: feature.iconName,
        category: feature.category,
        isActive: true
      }
    })
  }

  console.log(`✅ Creadas ${allFeatures.length} features predefinidas`)

  // Mostrar resumen por categoría
  const coffeeCount = await prisma.featureTemplate.count({ where: { category: FeatureCategory.COFFEE } })
  const foodCount = await prisma.featureTemplate.count({ where: { category: FeatureCategory.FOOD_DRINKS } })
  const moreCount = await prisma.featureTemplate.count({ where: { category: FeatureCategory.MORE } })

  console.log(`📊 Resumen:`)
  console.log(`   ☕ Coffee: ${coffeeCount} features`)
  console.log(`   🍽️  Food & Drinks: ${foodCount} features`)
  console.log(`   ➕ More: ${moreCount} features`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
