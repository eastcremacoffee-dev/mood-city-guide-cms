// Servicio de geocoding específico para ciudades
export interface CityCoordinates {
  latitude: number
  longitude: number
}

export async function geocodeCity(cityName: string, country: string): Promise<CityCoordinates> {
  try {
    // Construir la query de búsqueda
    const query = `${cityName}, ${country}`
    
    // Usar la API de geocoding de OpenStreetMap (Nominatim) - gratuita
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MoodCityGuide/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      throw new Error(`No se encontraron coordenadas para: ${query}`)
    }

    const result = data[0]
    const latitude = parseFloat(result.lat)
    const longitude = parseFloat(result.lon)

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error(`Coordenadas inválidas recibidas: lat=${result.lat}, lon=${result.lon}`)
    }

    console.log(`✅ Geocoding exitoso para ${query}: ${latitude}, ${longitude}`)

    return {
      latitude,
      longitude
    }
  } catch (error) {
    console.error(`❌ Error en geocoding para ${cityName}, ${country}:`, error)
    throw error
  }
}

