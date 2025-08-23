import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FeatureCategory } from '@prisma/client'

// GET - Obtener feature por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const feature = await prisma.featureTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            coffeeFeatures: true
          }
        }
      }
    })

    if (!feature) {
      return NextResponse.json(
        { success: false, error: 'Feature no encontrada' },
        { status: 404 }
      )
    }

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
    console.error('Error fetching feature:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching feature' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar feature
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { name, iconName, category, isActive } = body

    // Verificar que la feature existe
    const existingFeature = await prisma.featureTemplate.findUnique({
      where: { id }
    })

    if (!existingFeature) {
      return NextResponse.json(
        { success: false, error: 'Feature no encontrada' },
        { status: 404 }
      )
    }

    // Validaciones
    if (name && name !== existingFeature.name) {
      const duplicateFeature = await prisma.featureTemplate.findUnique({
        where: { name }
      })
      
      if (duplicateFeature) {
        return NextResponse.json(
          { success: false, error: 'Ya existe una feature con ese nombre' },
          { status: 400 }
        )
      }
    }

    if (category && !Object.values(FeatureCategory).includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Categoría inválida' },
        { status: 400 }
      )
    }

    const updatedFeature = await prisma.featureTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(iconName && { iconName }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive })
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
        id: updatedFeature.id,
        name: updatedFeature.name,
        iconName: updatedFeature.iconName,
        category: updatedFeature.category,
        isActive: updatedFeature.isActive,
        usageCount: updatedFeature._count.coffeeFeatures,
        createdAt: updatedFeature.createdAt,
        updatedAt: updatedFeature.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating feature:', error)
    return NextResponse.json(
      { success: false, error: 'Error updating feature' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar feature
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    // Verificar que la feature existe
    const existingFeature = await prisma.featureTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            coffeeFeatures: true
          }
        }
      }
    })

    if (!existingFeature) {
      return NextResponse.json(
        { success: false, error: 'Feature no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si la feature está siendo usada
    if (existingFeature._count.coffeeFeatures > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `No se puede eliminar la feature porque está siendo usada por ${existingFeature._count.coffeeFeatures} cafeterías` 
        },
        { status: 400 }
      )
    }

    await prisma.featureTemplate.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Feature eliminada correctamente'
    })

  } catch (error) {
    console.error('Error deleting feature:', error)
    return NextResponse.json(
      { success: false, error: 'Error deleting feature' },
      { status: 500 }
    )
  }
}
