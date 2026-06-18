import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const MOCK_USERS = {
  organiser: {
    id: 1,
    name: 'Adaeze Okonkwo',
    email: 'adaeze@confetti.ng',
    role: 'organiser',
  },
  vendor: {
    id: 2,
    name: 'Chukwuemeka Bello',
    email: 'emeka@confetti.ng',
    role: 'vendor',
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('confetti_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  function login(role) {
    const mockUser = MOCK_USERS[role] ?? MOCK_USERS.organiser
    setUser(mockUser)
    localStorage.setItem('confetti_user', JSON.stringify(mockUser))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('confetti_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
