import type { Meta, StoryObj } from 'storybook'
import { useState } from 'react'
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from './dialog'
import { Button } from './button'
import { Field, Label } from './fieldset'
import { Input } from './input'

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open dialog</Button>
        <Dialog open={isOpen} onClose={setIsOpen}>
          <DialogTitle>Refund payment</DialogTitle>
          <DialogDescription>
            Are you sure you want to refund this payment? This action cannot be undone.
          </DialogDescription>
          <DialogActions>
            <Button plain onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>Refund</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  },
}

export const WithForm: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open form dialog</Button>
        <Dialog open={isOpen} onClose={setIsOpen}>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Enter details for your new project.</DialogDescription>
          <DialogBody>
            <Field>
              <Label>Project name</Label>
              <Input placeholder="My project" />
            </Field>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>Create</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  },
}

export const Sizes: Story = {
  render: () => {
    const [openSize, setOpenSize] = useState<string | null>(null)
    return (
      <div className="flex gap-4">
        {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
          <Button key={size} onClick={() => setOpenSize(size)}>
            {size}
          </Button>
        ))}
        {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
          <Dialog key={size} size={size} open={openSize === size} onClose={() => setOpenSize(null)}>
            <DialogTitle>Size: {size}</DialogTitle>
            <DialogDescription>This dialog uses the &ldquo;{size}&rdquo; size variant.</DialogDescription>
            <DialogActions>
              <Button onClick={() => setOpenSize(null)}>Close</Button>
            </DialogActions>
          </Dialog>
        ))}
      </div>
    )
  },
}
