import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { Link } from '@/components/link'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-32 text-center sm:py-40">
      <p className="text-base/8 font-semibold text-zinc-950 dark:text-white">404</p>
      <Heading className="mt-4">Page not found</Heading>
      <Text className="mt-6">お探しのページは見つかりませんでした。</Text>
      <div className="mt-10">
        <Link to="/home" className="text-sm/7 font-semibold text-zinc-950 dark:text-white">
          <span aria-hidden="true">&larr;</span> Back to home
        </Link>
      </div>
    </div>
  )
}
