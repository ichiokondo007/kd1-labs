import type { Meta, StoryObj } from 'storybook'
import { Badge, BadgeButton } from './badge'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: 'Badge',
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(
        [
          'zinc',
          'red',
          'orange',
          'amber',
          'yellow',
          'lime',
          'green',
          'emerald',
          'teal',
          'cyan',
          'sky',
          'blue',
          'indigo',
          'violet',
          'purple',
          'fuchsia',
          'pink',
          'rose',
        ] as const
      ).map((color) => (
        <Badge key={color} color={color}>
          {color}
        </Badge>
      ))}
    </div>
  ),
}

export const AsBadgeButton: Story = {
  render: () => <BadgeButton color="blue">Click me</BadgeButton>,
}

export const BadgeButtonLink: Story = {
  render: () => (
    <BadgeButton color="indigo" href="/">
      Link badge
    </BadgeButton>
  ),
}
