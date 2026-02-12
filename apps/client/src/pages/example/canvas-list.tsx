import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { Heading } from '@/components/heading'
import { Text, TextLink } from '@/components/text'
import { Button } from '@/components/button'
import { Input, InputGroup } from '@/components/input'
import { Select } from '@/components/select'
import { Avatar } from '@/components/avatar'
import { Divider } from '@/components/divider'
import {
  Pagination,
  PaginationPrevious,
  PaginationNext,
  PaginationList,
  PaginationPage,
  PaginationGap,
} from '@/components/pagination'

interface CanvasItem {
  id: string
  name: string
  thumbnailUrl: string | null
  updatedAt: Date
  description: string
  updater: {
    name: string
    avatarUrl: string | null
    initials: string
  }
}

type SortKey = 'name' | 'updatedAt' | 'updaterName'

const PAGE_SIZE = 6

const MOCK_CANVAS_ITEMS: CanvasItem[] = [
  {
    id: '1',
    name: 'Marketing Campaign Banner',
    thumbnailUrl: null,
    updatedAt: new Date('2024-06-02T20:00:00'),
    description: 'Main banner design for Q3 marketing campaign',
    updater: { name: 'Alice Johnson', avatarUrl: null, initials: 'AJ' },
  },
  {
    id: '2',
    name: 'Product Wireframe v2',
    thumbnailUrl: 'https://picsum.photos/seed/canvas2/300/200',
    updatedAt: new Date('2024-05-28T14:30:00'),
    description: 'Updated wireframes for the new product page redesign',
    updater: { name: 'Bob Smith', avatarUrl: null, initials: 'BS' },
  },
  {
    id: '3',
    name: 'Team Org Chart',
    thumbnailUrl: null,
    updatedAt: new Date('2024-05-15T09:00:00'),
    description: 'Organization chart for the engineering department',
    updater: { name: 'Carol Williams', avatarUrl: null, initials: 'CW' },
  },
  {
    id: '4',
    name: 'Dashboard Mockup',
    thumbnailUrl: 'https://picsum.photos/seed/canvas4/300/200',
    updatedAt: new Date('2024-06-01T16:45:00'),
    description: 'Analytics dashboard UI mockup with chart components',
    updater: { name: 'David Lee', avatarUrl: null, initials: 'DL' },
  },
  {
    id: '5',
    name: 'Logo Concepts',
    thumbnailUrl: 'https://picsum.photos/seed/canvas5/300/200',
    updatedAt: new Date('2024-04-20T11:00:00'),
    description: 'Brand identity logo exploration concepts',
    updater: { name: 'Eve Martinez', avatarUrl: null, initials: 'EM' },
  },
  {
    id: '6',
    name: 'Floor Plan Layout',
    thumbnailUrl: null,
    updatedAt: new Date('2024-05-30T13:15:00'),
    description: 'New office floor plan with seating arrangements',
    updater: { name: 'Frank Brown', avatarUrl: null, initials: 'FB' },
  },
  {
    id: '7',
    name: 'Infographic Design',
    thumbnailUrl: 'https://picsum.photos/seed/canvas7/300/200',
    updatedAt: new Date('2024-05-10T10:00:00'),
    description: 'Annual report infographic with key statistics',
    updater: { name: 'Grace Kim', avatarUrl: null, initials: 'GK' },
  },
  {
    id: '8',
    name: 'Storyboard Frames',
    thumbnailUrl: null,
    updatedAt: new Date('2024-06-03T08:30:00'),
    description: 'Product demo video storyboard with scene descriptions',
    updater: { name: 'Henry Tanaka', avatarUrl: null, initials: 'HT' },
  },
  {
    id: '9',
    name: 'Mobile App Screens',
    thumbnailUrl: 'https://picsum.photos/seed/canvas9/300/200',
    updatedAt: new Date('2024-05-22T17:00:00'),
    description: 'Mobile application screen designs for iOS and Android',
    updater: { name: 'Alice Johnson', avatarUrl: null, initials: 'AJ' },
  },
  {
    id: '10',
    name: 'Presentation Slides',
    thumbnailUrl: null,
    updatedAt: new Date('2024-05-18T15:30:00'),
    description: 'Investor pitch deck slide designs',
    updater: { name: 'Bob Smith', avatarUrl: null, initials: 'BS' },
  },
  {
    id: '11',
    name: 'Icon Set Draft',
    thumbnailUrl: 'https://picsum.photos/seed/canvas11/300/200',
    updatedAt: new Date('2024-04-25T12:00:00'),
    description: 'Custom icon set for the design system',
    updater: { name: 'Carol Williams', avatarUrl: null, initials: 'CW' },
  },
  {
    id: '12',
    name: 'Event Poster',
    thumbnailUrl: 'https://picsum.photos/seed/canvas12/300/200',
    updatedAt: new Date('2024-06-04T19:00:00'),
    description: 'Annual company event promotional poster',
    updater: { name: 'David Lee', avatarUrl: null, initials: 'DL' },
  },
  {
    id: '13',
    name: 'Color Palette Board',
    thumbnailUrl: null,
    updatedAt: new Date('2024-05-08T14:00:00'),
    description: 'Brand color palette exploration and swatches',
    updater: { name: 'Eve Martinez', avatarUrl: null, initials: 'EM' },
  },
  {
    id: '14',
    name: 'Architecture Diagram',
    thumbnailUrl: null,
    updatedAt: new Date('2024-05-25T09:45:00'),
    description: 'System architecture diagram for microservices',
    updater: { name: 'Frank Brown', avatarUrl: null, initials: 'FB' },
  },
  {
    id: '15',
    name: 'Newsletter Template',
    thumbnailUrl: 'https://picsum.photos/seed/canvas15/300/200',
    updatedAt: new Date('2024-05-12T16:00:00'),
    description: 'Monthly newsletter email template design',
    updater: { name: 'Grace Kim', avatarUrl: null, initials: 'GK' },
  },
]

function formatDate(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  const hour = date.getHours()
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${month} ${day}, ${year} at ${displayHour} ${ampm}`
}

function getPageNumbers(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | 'gap')[] = [1]
  if (current > 3) pages.push('gap')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('gap')
  pages.push(total)
  return pages
}

function buildPageUrl(page: number, searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams)
  if (page === 1) {
    params.delete('page')
  } else {
    params.set('page', String(page))
  }
  const qs = params.toString()
  return `/example/canvas${qs ? `?${qs}` : ''}`
}

export default function CanvasListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const sortKey = (searchParams.get('sort') as SortKey) ?? 'updatedAt'
  const currentPage = Number(searchParams.get('page') ?? '1')

  const filteredAndSorted = useMemo(() => {
    let items: CanvasItem[] = MOCK_CANVAS_ITEMS

    if (query) {
      const q = query.toLowerCase()
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.updater.name.toLowerCase().includes(q)
      )
    }

    items = [...items].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'updaterName':
          return a.updater.name.localeCompare(b.updater.name)
        case 'updatedAt':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime()
      }
    })

    return items
  }, [query, sortKey])

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pagedItems = filteredAndSorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )
  const pageNumbers = getPageNumbers(safePage, totalPages)

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
                  next.delete('page')
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
            <option value="name">Sort by name</option>
            <option value="updaterName">Sort by username</option>
          </Select>
        </div>
        <Button color="dark/zinc">Create canvas</Button>
      </div>

      {/* Canvas List */}
      <div className="mt-8">
        {pagedItems.length === 0 ? (
          <Text className="py-12 text-center">No canvas items found.</Text>
        ) : (
          pagedItems.map((item, index) => (
            <div key={item.id}>
              {index > 0 && <Divider soft className="my-4" />}
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="hidden shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:block sm:h-20 sm:w-32 lg:h-24 lg:w-40 dark:bg-zinc-800">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
                      No image
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <TextLink to={`/example/canvas/${item.id}`}>
                    {item.name}
                  </TextLink>
                  <Text className="mt-1 truncate">
                    {formatDate(item.updatedAt)} &middot; {item.description}
                  </Text>
                  <div className="mt-2 flex items-center gap-2">
                    <Avatar
                      src={item.updater.avatarUrl}
                      initials={item.updater.initials}
                      className="size-6"
                    />
                    <Text>{item.updater.name}</Text>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationPrevious
            href={safePage > 1 ? buildPageUrl(safePage - 1, searchParams) : null}
          />
          <PaginationList>
            {pageNumbers.map((p, i) =>
              p === 'gap' ? (
                <PaginationGap key={`gap-${i}`} />
              ) : (
                <PaginationPage
                  key={p}
                  href={buildPageUrl(p, searchParams)}
                  current={p === safePage}
                >
                  {p}
                </PaginationPage>
              )
            )}
          </PaginationList>
          <PaginationNext
            href={
              safePage < totalPages
                ? buildPageUrl(safePage + 1, searchParams)
                : null
            }
          />
        </Pagination>
      )}
    </div>
  )
}
