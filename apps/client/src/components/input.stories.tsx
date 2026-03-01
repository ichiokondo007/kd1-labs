import type { Meta, StoryObj } from '@storybook/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { Input, InputGroup } from './input'
import { Field, Label, Description } from './fieldset'

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: 'Enter text…' },
}

export const WithFieldAndLabel: Story = {
  render: () => (
    <Field>
      <Label>Full name</Label>
      <Input placeholder="Enter your name" />
    </Field>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <Field>
      <Label>Email</Label>
      <Description>We&apos;ll use this for account recovery.</Description>
      <Input type="email" placeholder="you@example.com" />
    </Field>
  ),
}

export const Disabled: Story = {
  args: { placeholder: 'Disabled', disabled: true },
}

export const WithInputGroup: Story = {
  render: () => (
    <Field>
      <Label>Search</Label>
      <InputGroup>
        <MagnifyingGlassIcon data-slot="icon" />
        <Input placeholder="Search…" />
      </InputGroup>
    </Field>
  ),
}

export const DateInput: Story = {
  args: { type: 'date' },
}
