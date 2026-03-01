import type { Preview } from 'storybook'
import { withThemeByClassName } from '@storybook/addon-themes'
import { MemoryRouter } from 'react-router-dom'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { http, HttpResponse } from 'msw'
import '../src/index.css'

// GET /api/users/items をモック（User management ページ用）
const usersItemsHandler = http.get('/api/users/items', () => {
  return HttpResponse.json({
    data: [
      { id: '1', userName: 'Alice Johnson', screenName: 'alice', role: 'Admin', avatarUrl: null, avatarColor: '#3b82f6' },
      { id: '2', userName: 'Bob Smith', screenName: 'bob_smith', role: 'Editor', avatarUrl: null, avatarColor: '#22c55e' },
      { id: '3', userName: 'Carol Williams', screenName: 'carol', role: 'Viewer', avatarUrl: null, avatarColor: 'zinc-900' },
    ],
  })
})

initialize({ onUnhandledRequest: 'bypass' }, [usersItemsHandler])

const preview: Preview = {
  loaders: [mswLoader],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
  parameters: {
    layout: 'centered',
  },
}

export default preview
