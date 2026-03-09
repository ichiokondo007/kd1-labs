import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { Link } from '@/components/link'

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-32 text-center sm:py-40">
      <Heading>Coming Soon</Heading>
      <Text className="mt-6">このページは現在準備中です。もうしばらくお待ちください。</Text>
      <div className="mt-10">
        <Link to="/home" className="text-sm/7 font-semibold text-zinc-950 dark:text-white">
          <span aria-hidden="true">&larr;</span> Back to home
        </Link>
      </div>
    </div>
  )
}
