import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox, CheckboxField, CheckboxGroup } from './checkbox'
import { Label, Description } from './fieldset'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLabel: Story = {
  render: () => (
    <CheckboxField>
      <Checkbox />
      <Label>Accept terms and conditions</Label>
    </CheckboxField>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <CheckboxField>
      <Checkbox />
      <Label>Email notifications</Label>
      <Description>Get notified when someone mentions you.</Description>
    </CheckboxField>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Group: Story = {
  render: () => (
    <CheckboxGroup>
      <CheckboxField>
        <Checkbox />
        <Label>Option A</Label>
      </CheckboxField>
      <CheckboxField>
        <Checkbox />
        <Label>Option B</Label>
      </CheckboxField>
      <CheckboxField>
        <Checkbox />
        <Label>Option C</Label>
      </CheckboxField>
    </CheckboxGroup>
  ),
}

export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(
        [
          'dark/zinc',
          'dark/white',
          'white',
          'dark',
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
        <CheckboxField key={color}>
          <Checkbox color={color} defaultChecked />
          <Label>{color}</Label>
        </CheckboxField>
      ))}
    </div>
  ),
}
