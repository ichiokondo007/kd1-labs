import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
  viteFinal(config) {
    config.plugins ??= []
    config.plugins.push(tailwindcss(), tsconfigPaths())
    return config
  },
}

export default config
