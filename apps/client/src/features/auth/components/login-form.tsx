import { Field, Label, ErrorMessage } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useLoginForm } from '@/features/auth/hooks/useLoginForm'

export function LoginForm() {
  const { values, errors, isSubmitting, setField, submit } = useLoginForm()

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <img src="/kd.icon.svg" className="mx-auto h-10 w-10" alt="KD1 Labs" />
        <h1 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">
          Sign in to KD1 Labs
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Enter your credentials to continue
        </p>
      </div>

      {errors.general && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-400 dark:ring-red-800">
          {errors.general}
        </div>
      )}

      <Field>
        <Label>Login Name</Label>
        <Input
          name="login_name"
          type="text"
          autoComplete="username"
          value={values.loginName}
          onChange={(e) => setField('loginName', e.target.value)}
          invalid={!!errors.loginName}
        />
        {errors.loginName && <ErrorMessage>{errors.loginName}</ErrorMessage>}
      </Field>

      <Field>
        <Label>Password</Label>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => setField('password', e.target.value)}
          invalid={!!errors.password}
        />
        {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
      </Field>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
