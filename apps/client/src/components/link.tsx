/**
 * TODO: Update this component to use your client-side framework's link
 * component. We've provided examples of how to do this for Next.js, Remix, and
 * Inertia.js in the Catalyst documentation:
 *
 * https://catalyst.tailwindui.com/docs#client-side-router-integration
 */
import { DataInteractive as HeadlessDataInteractive } from '@headlessui/react'
import { forwardRef } from 'react'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'

/** to または href のどちらかで遷移先を指定（Catalyst 系は href で渡すことが多い） */
export type LinkProps = Omit<RouterLinkProps, 'to'> & {
  to?: RouterLinkProps['to']
  href?: string
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const { href, ...rest } = props
  const to = props.to ?? href ?? '.'
  return (
    <HeadlessDataInteractive>
      <RouterLink {...rest} to={to} ref={ref} />
    </HeadlessDataInteractive>
  )
})
