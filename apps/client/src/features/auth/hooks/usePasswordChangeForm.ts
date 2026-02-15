import { useState, type FormEvent } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface PasswordChangeFormState {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface PasswordChangeFormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  general?: string
}

const MIN_PASSWORD_LENGTH = 8

export function usePasswordChangeForm() {
  const { changePassword } = useAuth()
  const [values, setValues] = useState<PasswordChangeFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<PasswordChangeFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = (field: keyof PasswordChangeFormState, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
  }

  const validate = (): boolean => {
    const next: PasswordChangeFormErrors = {}
    if (!values.currentPassword) next.currentPassword = 'Current password is required'
    if (!values.newPassword) {
      next.newPassword = 'New password is required'
    } else if (values.newPassword.length < MIN_PASSWORD_LENGTH) {
      next.newPassword = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    }
    if (!values.confirmPassword) {
      next.confirmPassword = 'Please confirm the new password'
    } else if (values.newPassword !== values.confirmPassword) {
      next.confirmPassword = 'Passwords do not match'
    }
    if (values.currentPassword && values.newPassword && values.currentPassword === values.newPassword) {
      next.newPassword = 'New password must be different from current password'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Password change failed' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, errors, isSubmitting, setField, submit }
}
