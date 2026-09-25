export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'

export type UnavailableType = 'BOOKED' | 'PENDING' | 'BLOCKED'

export interface UnavailableRange {
  start: string
  end: string
  type: UnavailableType
}

export interface AvailabilityResponse {
  from: string
  to: string
  unavailable: UnavailableRange[]
}

export interface Booking {
  id: number
  bookingReference: string
  guestName: string
  contactNumber: string
  email: string
  numberOfGuests: number
  checkIn: string
  checkOut: string
  nights: number
  message?: string | null
  status: BookingStatus
  createdAt: string
  updatedAt: string
}

export interface BookingCreateResponse {
  booking: Booking
  status: BookingStatus
}

export interface BlockedDate {
  id: number
  startDate: string
  endDate: string
  reason: string
  createdAt: string
}
