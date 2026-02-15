import { useState, type FormEvent } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface LoginFormState {
  loginName: string
  password: string
}

interface LoginFormErrors {
  loginName?: string
  password?: string
  general?: string
}

export function useLoginForm() {
  const { login } = useAuth()
  const [values, setValues] = useState<LoginFormState>({ loginName: '', password: '' })
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = (field: keyof LoginFormState, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
  }

  const validate = (): boolean => {
    const next: LoginFormErrors = {}
    if (!values.loginName.trim()) next.loginName = 'Login name is required'
    if (!values.password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await login({ loginName: values.loginName.trim(), password: values.password })
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Login failed' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, errors, isSubmitting, setField, submit }
}
