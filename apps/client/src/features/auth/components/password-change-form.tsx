import { Field, Label, Description, ErrorMessage } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { usePasswordChangeForm } from '@/features/auth/hooks/usePasswordChangeForm'

export function PasswordChangeForm() {
  const { values, errors, isSubmitting, setField, submit } = usePasswordChangeForm()

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <img src="/kd.icon.svg" className="mx-auto h-10 w-10" alt="KD1 Labs" />
        <h1 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">
          Change Your Password
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          You must change your initial password before continuing.
        </p>
      </div>

      {errors.general && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-400 dark:ring-red-800">
          {errors.general}
        </div>
      )}

      <Field>
        <Label>Current Password</Label>
        <Description>Enter the password you were given</Description>
        <Input
          name="current_password"
          type="password"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(e) => setField('currentPassword', e.target.value)}
          invalid={!!errors.currentPassword}
        />
        {errors.currentPassword && <ErrorMessage>{errors.currentPassword}</ErrorMessage>}
      </Field>

      <Field>
        <Label>New Password</Label>
        <Description>At least 8 characters</Description>
        <Input
          name="new_password"
          type="password"
          autoComplete="new-password"
          value={values.newPassword}
          onChange={(e) => setField('newPassword', e.target.value)}
          invalid={!!errors.newPassword}
        />
        {errors.newPassword && <ErrorMessage>{errors.newPassword}</ErrorMessage>}
      </Field>

      <Field>
        <Label>Confirm New Password</Label>
        <Input
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => setField('confirmPassword', e.target.value)}
          invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
      </Field>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Changing password...' : 'Change Password'}
      </Button>
    </form>
  )
}
