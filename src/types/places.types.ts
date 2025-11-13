// Places and Mosque Finder Types

export type DistanceUnit = 'mi' | 'km'

export interface MosqueData {
  id: string | number
  name: string
  lat: number
  lng: number
  distanceKm: number
  address: {
    street?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
  tags: {
    phone?: string
    website?: string
    opening_hours?: string
    wheelchair?: string
    denomination?: string
    [key: string]: string | undefined
  }
}

export interface OverpassElement {
  type: string
  id: number
  lat: number
  lon: number
  tags?: {
    name?: string
    'addr:street'?: string
    'addr:housenumber'?: string
    'addr:city'?: string
    'addr:state'?: string
    'addr:postcode'?: string
    'addr:country'?: string
    phone?: string
    website?: string
    opening_hours?: string
    wheelchair?: string
    denomination?: string
    [key: string]: string | undefined
  }
}

export interface OverpassResponse {
  version: number
  generator: string
  elements: OverpassElement[]
}

export interface MosqueSearchParams {
  lat: number
  lng: number
  radiusMeters: number
}

export interface LocationSearchResult {
  lat: number
  lng: number
  displayName: string
}

// Halal Food Finder Types (Geoapify API)

export interface HalalFoodData {
  id: string
  name: string
  lat: number
  lng: number
  distanceKm: number
  address: {
    street?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
    formatted?: string
  }
  categories: string[]
  cuisine?: string
  diet?: {
    halal?: boolean
    [key: string]: boolean | undefined
  }
  contact?: {
    phone?: string
    website?: string
  }
  openingHours?: string
  facilities?: {
    wheelchair?: boolean
    takeaway?: boolean
    delivery?: boolean
    [key: string]: boolean | undefined
  }
}

export interface GeoapifyFeature {
  type: 'Feature'
  properties: {
    name?: string
    country?: string
    country_code?: string
    state?: string
    state_code?: string
    county?: string
    city?: string
    postcode?: string
    district?: string
    neighbourhood?: string
    street?: string
    housenumber?: string
    lon: number
    lat: number
    formatted?: string
    address_line1?: string
    address_line2?: string
    categories?: string[]
    datasource?: {
      sourcename: string
      raw?: {
        name?: string
        cuisine?: string
        'diet:halal'?: string
        phone?: string
        website?: string
        opening_hours?: string
        wheelchair?: string
        takeaway?: string
        delivery?: string
        [key: string]: string | number | undefined
      }
    }
    catering?: {
      cuisine?: string
      diet?: {
        halal?: boolean
        [key: string]: boolean | undefined
      }
    }
    contact?: {
      phone?: string
      website?: string
    }
    opening_hours?: string
    facilities?: {
      wheelchair?: boolean
      takeaway?: boolean
      delivery?: boolean
      [key: string]: boolean | undefined
    }
    distance?: number
    place_id: string
    [key: string]: unknown
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

export interface GeoapifyResponse {
  type: 'FeatureCollection'
  features: GeoapifyFeature[]
}

export interface FoodSearchParams {
  lat: number
  lng: number
  radiusMeters: number
}

