// Type definitions

// Auth types
export type User = {
  id: string
  email: string
  name: string
  token?: string
}

// Diagnostic types
export type VideoLink = {
  title: string
  url: string
}

export type DiagnosticResult = {
  issue: string
  confidence: number
  description: string
  recommendation: string
  severity: "low" | "medium" | "high"
  videoLinks?: VideoLink[]
}

export type Diagnostic = {
  id: string
  type: "engine" | "dashboard"
  title: string
  date: string
  status: "pending" | "completed"
  result?: DiagnosticResult
}

// Notification types
export type Notification = {
  id: string
  title: string
  message: string
  type: "engine_result" | "dashboard_result" | "mechanic_message"
  read: boolean
  date: string
  linkId?: string
}

// Mechanic types
export type BusinessHour = {
  day: string
  hours: string
}

export type Review = {
  id: string
  user: string
  rating: number
  date: string
  comment: string
  helpful: number
  unhelpful: number
}

export type Mechanic = {
  id: string
  name: string
  rating: number
  reviewCount: number
  specialty: string
  distance: number
  imageUri: string
  location: string
  description?: string
  isOpen: boolean
  certified: boolean
  hours?: BusinessHour[]
  phone?: string
  email?: string
  services?: string[]
  reviews?: Review[]
}
