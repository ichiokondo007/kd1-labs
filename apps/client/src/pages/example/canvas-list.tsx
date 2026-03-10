import { useNavigate } from 'react-router-dom'
import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { Button } from '@/components/button'
import { CanvasListTable } from '@/components/canvas-list-table'
import { useCanvasList } from '@/features/canvas/hooks/useCanvas'
import type { CanvasListItem } from '@kd1-labs/types'

const getItemHref = (item: CanvasListItem) => `/example/canvas/${item.id}`

export default function CanvasListPage() {
  const navigate = useNavigate()
  const { items, isLoading, errorMessage } = useCanvasList()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading>Example &gt; Canvas App</Heading>
      <Text className="mt-2">Fabric.js canvas application Example</Text>

      <CanvasListTable
        items={items}
        isLoading={isLoading}
        errorMessage={errorMessage}
        getItemHref={getItemHref}
        headerAction={
          <Button
            color="dark/zinc"
            onClick={() => navigate('/example/canvas/new')}
          >
            Create canvas
          </Button>
        }
      />
    </div>
  )
}
