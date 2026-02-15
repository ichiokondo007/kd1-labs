import type { ApiResponse } from '@kd1-labs/types'

export interface AuthUser {
  id: string
  loginName: string
  mailAddress: string | null
  isInitialPassword: boolean
}

export interface LoginRequest {
  loginName: string
  password: string
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

const API_BASE = '/api/auth'

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthUser>> => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message ?? 'Login failed')
    }
    return res.json()
  },

  changePassword: async (data: PasswordChangeRequest): Promise<ApiResponse<AuthUser>> => {
    const res = await fetch(`${API_BASE}/password-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message ?? 'Password change failed')
    }
    return res.json()
  },

  me: async (): Promise<ApiResponse<AuthUser>> => {
    const res = await fetch(`${API_BASE}/me`)
    if (!res.ok) {
      throw new Error('Not authenticated')
    }
    return res.json()
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE}/logout`, { method: 'POST' })
  },
}
