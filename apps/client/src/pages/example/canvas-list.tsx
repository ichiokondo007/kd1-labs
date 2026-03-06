import { useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { Heading } from '@/components/heading'
import { Text, TextLink } from '@/components/text'
import { Button } from '@/components/button'
import { Input, InputGroup } from '@/components/input'
import { Select } from '@/components/select'
import { UserAvatar } from '@/components/user-avatar'
import { Divider } from '@/components/divider'
import { useCanvasList } from '@/features/canvas/hooks/useCanvas'
import type { CanvasListItem } from '@kd1-labs/types'

type SortKey = 'canvasName' | 'updatedAt' | 'updaterName'

const NOIMAGE_URL = '/noimage.svg'

function formatDate(iso: string): string {
  const date = new Date(iso)
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  const hour = date.getHours()
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${month} ${day}, ${year} at ${displayHour} ${ampm}`
}

function sortItems(items: CanvasListItem[], key: SortKey): CanvasListItem[] {
  return [...items].sort((a, b) => {
    switch (key) {
      case 'canvasName':
        return a.canvasName.localeCompare(b.canvasName)
      case 'updaterName':
        return a.updater.screenName.localeCompare(b.updater.screenName)
      case 'updatedAt':
      default:
        return b.updatedAt.localeCompare(a.updatedAt)
    }
  })
}

function filterItems(items: CanvasListItem[], query: string): CanvasListItem[] {
  if (!query) return items
  const q = query.toLowerCase()
  return items.filter(
    (item) =>
      item.canvasName.toLowerCase().includes(q) ||
      (item.canvasDescription ?? '').toLowerCase().includes(q) ||
      item.updater.screenName.toLowerCase().includes(q)
  )
}

export default function CanvasListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { items, isLoading, errorMessage } = useCanvasList()

  const query = searchParams.get('q') ?? ''
  const sortKey = (searchParams.get('sort') as SortKey) ?? 'updatedAt'

  const displayItems = useMemo(
    () => sortItems(filterItems(items, query), sortKey),
    [items, query, sortKey]
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading>Example &gt; Canvas App</Heading>
      <Text className="mt-2">Fabric.js canvas application Example</Text>

      {/* Search & Sort Bar */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <InputGroup>
            <MagnifyingGlassIcon data-slot="icon" />
            <Input
              type="search"
              placeholder="Search canvas..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev)
                  if (value) {
                    next.set('q', value)
                  } else {
                    next.delete('q')
                  }
                  return next
                })
              }}
            />
          </InputGroup>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={sortKey}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev)
                const value = e.target.value
                if (value !== 'updatedAt') {
                  next.set('sort', value)
                } else {
                  next.delete('sort')
                }
                return next
              })
            }}
          >
            <option value="updatedAt">Sort by updated</option>
            <option value="canvasName">Sort by name</option>
            <option value="updaterName">Sort by username</option>
          </Select>
        </div>
        <Button
          color="dark/zinc"
          onClick={() => navigate('/example/canvas/new')}
        >
          Create canvas
        </Button>
      </div>

      {/* Canvas List */}
      <div className="mt-8">
        {isLoading && (
          <Text className="py-12 text-center">Loading...</Text>
        )}

        {errorMessage && (
          <Text className="py-12 text-center text-red-600 dark:text-red-400">
            {errorMessage}
          </Text>
        )}

        {!isLoading && !errorMessage && displayItems.length === 0 && (
          <Text className="py-12 text-center">No canvas items found.</Text>
        )}

        {!isLoading &&
          !errorMessage &&
          displayItems.map((item, index) => (
            <div key={item.id}>
              {index > 0 && <Divider soft className="my-4" />}
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="hidden shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:block sm:h-20 sm:w-32 lg:h-24 lg:w-40 dark:bg-zinc-800">
                  <img
                    src={item.thumbnailUrl ?? NOIMAGE_URL}
                    alt={item.canvasName}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <TextLink to={`/example/canvas/${item.id}`}>
                    {item.canvasName}
                  </TextLink>
                  <Text className="mt-1 truncate">
                    {formatDate(item.updatedAt)}
                    {item.canvasDescription && (
                      <> &middot; {item.canvasDescription}</>
                    )}
                  </Text>
                  <div className="mt-2 flex items-center gap-2">
                    <UserAvatar
                      user={{
                        avatarUrl: item.updater.avatarUrl,
                        avatarColor: item.updater.avatarColor,
                        userName: item.updater.screenName,
                      }}
                      className="size-9"
                    />
                    <Text>{item.updater.screenName}</Text>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
