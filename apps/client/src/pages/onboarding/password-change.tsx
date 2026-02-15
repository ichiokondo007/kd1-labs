import { AuthLayout } from '@/components/auth-layout'
import { PasswordChangeForm } from '@/features/auth/components/password-change-form'

export default function PasswordChangePage() {
  return (
    <AuthLayout>
      <PasswordChangeForm />
    </AuthLayout>
  )
}
