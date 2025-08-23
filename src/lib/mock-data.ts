// Datos mock para el CMS en producción
export const mockCities = [
  {
    id: "1",
    name: "Madrid",
    description: "La capital de España, conocida por su vibrante vida nocturna y excelentes cafeterías.",
    imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "2", 
    name: "Barcelona",
    description: "Ciudad cosmopolita con una increíble cultura del café y arquitectura única.",
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "3",
    name: "Valencia", 
    description: "Ciudad mediterránea con una creciente escena de cafeterías especializadas.",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
]

export const mockCoffeeShops = [
  {
    id: "1",
    name: "Café Central Madrid",
    description: "Histórica cafetería en el corazón de Madrid",
    address: "Plaza del Ángel, 10, Madrid",
    phone: "+34 913 69 41 43",
    email: "info@cafecentral.com",
    website: "https://cafecentral.es",
    cityId: "1",
    latitude: 40.4168,
    longitude: -3.7038,
    rating: 4.5,
    priceRange: "€€",
    openingHours: "L-D: 8:00-24:00",
    wifiAvailable: true,
    petFriendly: false,
    hasOutdoorSeating: true,
    acceptsCards: true,
    hasParking: false,
    isActive: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
        alt: "Interior del Café Central"
      }
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "2",
    name: "Nomad Coffee Barcelona",
    description: "Tostadores de café especializado con múltiples ubicaciones",
    address: "Carrer de la Diputació, 213, Barcelona", 
    phone: "+34 932 72 61 18",
    email: "hello@nomadcoffee.es",
    website: "https://nomadcoffee.es",
    cityId: "2",
    latitude: 41.3851,
    longitude: 2.1734,
    rating: 4.7,
    priceRange: "€€€",
    openingHours: "L-V: 7:30-19:00, S-D: 9:00-19:00",
    wifiAvailable: true,
    petFriendly: true,
    hasOutdoorSeating: false,
    acceptsCards: true,
    hasParking: false,
    isActive: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
        alt: "Nomad Coffee interior"
      }
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "3",
    name: "Blueproject Valencia",
    description: "Café de especialidad con enfoque en sostenibilidad",
    address: "Carrer de Xàtiva, 15, Valencia",
    phone: "+34 963 52 67 89", 
    email: "info@blueproject.es",
    website: "https://blueproject.es",
    cityId: "3",
    latitude: 39.4699,
    longitude: -0.3763,
    rating: 4.6,
    priceRange: "€€",
    openingHours: "L-V: 8:00-20:00, S-D: 9:00-20:00",
    wifiAvailable: true,
    petFriendly: true,
    hasOutdoorSeating: true,
    acceptsCards: true,
    hasParking: true,
    isActive: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1559496417-e7f25cb247cd?w=800&h=600&fit=crop",
        alt: "Blueproject Valencia"
      }
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
]

export const mockFeatures = [
  { id: "1", name: "WiFi Gratuito", icon: "wifi" },
  { id: "2", name: "Pet Friendly", icon: "pet" },
  { id: "3", name: "Terraza", icon: "outdoor" },
  { id: "4", name: "Acepta Tarjetas", icon: "card" },
  { id: "5", name: "Parking", icon: "parking" },
  { id: "6", name: "Café de Especialidad", icon: "specialty" },
  { id: "7", name: "Comida Vegana", icon: "vegan" },
  { id: "8", name: "Desayunos", icon: "breakfast" }
]

export const mockReviews = [
  {
    id: "1",
    coffeeShopId: "1",
    userId: "user1",
    userName: "María García",
    rating: 5,
    comment: "Excelente café y ambiente histórico. Perfecto para trabajar.",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "2", 
    coffeeShopId: "2",
    userId: "user2",
    userName: "Carlos López",
    rating: 5,
    comment: "El mejor café de Barcelona. Los baristas son muy profesionales.",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "3",
    coffeeShopId: "3", 
    userId: "user3",
    userName: "Ana Martín",
    rating: 4,
    comment: "Muy buen café y compromiso con el medio ambiente. Recomendado.",
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25")
  }
]
