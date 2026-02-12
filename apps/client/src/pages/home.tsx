import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { Button } from '@/components/button'

export default function HomePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading>Dashboard Home</Heading>
      <Text className="mt-2">
        Welcome to KD1 Labs. Select a menu item from the sidebar.
      </Text>
      <div className="mt-6">
        <Button>Get Started</Button>
      </div>
    </div>
  )
}
