/**
 * TODO: Update this component to use your client-side framework's link
 * component. We've provided examples of how to do this for Next.js, Remix, and
 * Inertia.js in the Catalyst documentation:
 *
 * https://catalyst.tailwindui.com/docs#client-side-router-integration
 */
import { DataInteractive as HeadlessDataInteractive } from '@headlessui/react'
import React, { forwardRef } from 'react'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'

export const Link = forwardRef<HTMLAnchorElement, RouterLinkProps>(function Link(
  props,
  ref
) {
  return (
    <HeadlessDataInteractive>
      <RouterLink {...props} ref={ref} />
    </HeadlessDataInteractive>
  )
})
