import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FeatureCategory } from '@prisma/client'

// GET - Obtener todas las features predefinidas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as FeatureCategory | null
    const isActive = searchParams.get('isActive')

    const whereClause: Record<string, unknown> = {}
    
    if (category) {
      whereClause.category = category
    }
    
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true'
    }

    const features = await prisma.featureTemplate.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            coffeeFeatures: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Agrupar por categoría
    const groupedFeatures = features.reduce((acc, feature) => {
      const category = feature.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({
        id: feature.id,
        name: feature.name,
        iconName: feature.iconName,
        category: feature.category,
        isActive: feature.isActive,
        usageCount: feature._count.coffeeFeatures,
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt
      })
      return acc
    }, {} as Record<FeatureCategory, unknown[]>)

    return NextResponse.json({
      success: true,
      data: groupedFeatures,
      total: features.length
    })

  } catch (error) {
    console.error('Error fetching features:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching features' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva feature predefinida
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, iconName, category, isActive = true } = body

    // Validaciones
    if (!name || !iconName || !category) {
      return NextResponse.json(
        { success: false, error: 'Nombre, icono y categoría son requeridos' },
        { status: 400 }
      )
    }

    if (!Object.values(FeatureCategory).includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Categoría inválida' },
        { status: 400 }
      )
    }

    // Verificar que no exista una feature con el mismo nombre
    const existingFeature = await prisma.featureTemplate.findUnique({
      where: { name }
    })

    if (existingFeature) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una feature con ese nombre' },
        { status: 400 }
      )
    }

    const feature = await prisma.featureTemplate.create({
      data: {
        name,
        iconName,
        category,
        isActive
      },
      include: {
        _count: {
          select: {
            coffeeFeatures: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: feature.id,
        name: feature.name,
        iconName: feature.iconName,
        category: feature.category,
        isActive: feature.isActive,
        usageCount: feature._count.coffeeFeatures,
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt
      }
    })

  } catch (error) {
    console.error('Error creating feature:', error)
    return NextResponse.json(
      { success: false, error: 'Error creating feature' },
      { status: 500 }
    )
  }
}
