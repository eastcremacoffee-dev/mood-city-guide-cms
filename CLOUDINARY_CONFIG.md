# Configuración de Cloudinary

Para que funcione la subida de imágenes, necesitas configurar las siguientes variables de entorno en Vercel:

## Variables de Entorno Requeridas:

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key  
CLOUDINARY_API_SECRET=tu_api_secret
```

## Cómo obtener las credenciales de Cloudinary:

1. **Ve a:** https://cloudinary.com/
2. **Crea una cuenta gratuita** (si no tienes una)
3. **Ve al Dashboard**
4. **Copia las credenciales:**
   - Cloud Name
   - API Key
   - API Secret

## Cómo configurar en Vercel:

1. **Ve a:** https://vercel.com/alberto-s-projects-006fac50/mood-city-guide-cms-backup-20-1651/settings/environment-variables
2. **Agrega cada variable:**
   - Name: `CLOUDINARY_CLOUD_NAME`, Value: `tu_cloud_name`
   - Name: `CLOUDINARY_API_KEY`, Value: `tu_api_key`
   - Name: `CLOUDINARY_API_SECRET`, Value: `tu_api_secret`
3. **Redeploy el proyecto**

## Alternativa temporal:

Si no quieres configurar Cloudinary ahora, puedes usar URLs de imágenes externas:
- Sube la imagen a cualquier servicio (Google Drive, Dropbox, etc.)
- Obtén el enlace público
- Pégalo directamente en el campo de imagen

Una vez configurado, el sistema de upload funcionará automáticamente.
