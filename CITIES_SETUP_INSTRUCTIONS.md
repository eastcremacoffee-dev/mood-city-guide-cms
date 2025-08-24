# 🏙️ Instrucciones para Configurar Ciudades en CMS

## 📋 **PASOS REQUERIDOS**

### 1. **Crear Tabla City en Supabase**
Ejecuta este SQL en el editor SQL de Supabase:

```sql
-- Copiar y pegar el contenido de: create-cities-table.sql
```

### 2. **Actualizar Cafeterías Existentes**
Ejecuta este SQL para asociar las cafeterías con ciudades:

```sql
-- Copiar y pegar el contenido de: update-coffeeshops-cityid.sql
```

### 3. **Verificar Cloudinary**
- ✅ ImageUpload ya está configurado para usar Cloudinary
- ✅ Carpeta "cities" se creará automáticamente
- ✅ Las imágenes se subirán a Cloudinary correctamente

## 🔧 **CAMBIOS REALIZADOS EN EL CMS**

### ✅ **APIs Actualizadas:**
- **GET /api/cities**: Lista todas las ciudades con conteo de cafeterías
- **POST /api/cities**: Crea nueva ciudad con validaciones
- **GET /api/cities/[id]**: Obtiene ciudad específica con cafeterías
- **PUT /api/cities/[id]**: Actualiza ciudad existente

### ✅ **Páginas del CMS:**
- **Lista de ciudades**: `/admin/cities` - Funcional
- **Nueva ciudad**: `/admin/cities/nueva` - Con subida de imágenes
- **Ver ciudad**: `/admin/cities/[id]` - Con lista de cafeterías
- **Editar ciudad**: `/admin/cities/[id]/editar` - Con subida de imágenes

### ✅ **Funcionalidades Implementadas:**
- 📸 **Subida de imágenes**: Integrado con Cloudinary
- 🗺️ **Coordenadas**: Campos de latitud y longitud
- 🏪 **Asociación**: Cafeterías asociadas automáticamente
- ✏️ **CRUD completo**: Crear, leer, actualizar ciudades
- 🔍 **Búsqueda**: Filtro por nombre y país
- 📊 **Estadísticas**: Conteo de cafeterías por ciudad

## 🚨 **IMPORTANTE**

### ❌ **NO se eliminaron cafeterías existentes**
- Las cafeterías actuales se mantienen intactas
- Solo se agregó el campo `cityId` para asociación
- Se asignaron automáticamente a Madrid

### ✅ **Consistencia con Supabase**
- Todos los endpoints usan Supabase directamente
- NO se usa localhost
- Campos consistentes con el schema

## 📝 **PRÓXIMOS PASOS**

1. **Ejecutar los SQLs** en Supabase
2. **Verificar** que las ciudades aparecen en `/admin/cities`
3. **Crear ciudades adicionales** si es necesario
4. **Asociar cafeterías** con las ciudades correctas

## 🎯 **RESULTADO ESPERADO**

Después de ejecutar los SQLs:
- ✅ Sección ciudades completamente funcional
- ✅ Subida de imágenes con Cloudinary
- ✅ Cafeterías asociadas correctamente
- ✅ CRUD completo para ciudades
- ✅ Estadísticas y conteos automáticos
