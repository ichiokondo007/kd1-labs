import type { Meta, StoryObj } from 'storybook'
import { Button } from './button'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Solid: Story = {
  args: { color: 'dark/zinc' },
}

export const Outline: Story = {
  args: { outline: true },
}

export const Plain: Story = {
  args: { plain: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const AsLink: Story = {
  args: { href: '/' },
}

export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(
        [
          'dark/zinc',
          'light',
          'dark/white',
          'dark',
          'white',
          'zinc',
          'indigo',
          'cyan',
          'red',
          'orange',
          'amber',
          'yellow',
          'lime',
          'green',
          'emerald',
          'teal',
          'sky',
          'blue',
          'violet',
          'purple',
          'fuchsia',
          'pink',
          'rose',
        ] as const
      ).map((color) => (
        <Button key={color} color={color}>
          {color}
        </Button>
      ))}
    </div>
  ),
}
