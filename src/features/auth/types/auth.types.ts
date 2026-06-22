/** The authenticated user shape returned by the API */
export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'organiser' | 'vendor' | 'admin'
  createdAt: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: 'organiser' | 'vendor'
}
