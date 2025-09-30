import { env } from '@openfaith/shared'
import tailwindcss from '@tailwindcss/vite'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { Option, pipe, String } from 'effect'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_NAME': JSON.stringify(process.env.VITE_APP_NAME),
    'import.meta.env.VITE_BASE_URL': JSON.stringify(process.env.VITE_BASE_URL),
    'import.meta.env.VITE_PLANNING_CENTER_CLIENT_ID': JSON.stringify(
      process.env.VITE_PLANNING_CENTER_CLIENT_ID,
    ),
    'import.meta.env.VITE_PROD_EMAIL_DOMAIN': JSON.stringify(process.env.VITE_PROD_EMAIL_DOMAIN),
    'import.meta.env.VITE_PROD_ROOT_DOMAIN': JSON.stringify(process.env.VITE_PROD_ROOT_DOMAIN),
    'import.meta.env.VITE_ZERO_SERVER': JSON.stringify(process.env.VITE_ZERO_SERVER),
  },
  plugins: [
    tailwindcss(),
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({
      router: {
        routesDirectory: 'routes',
      },
      spa: {
        enabled: true,
      },
      srcDirectory: 'app',
    }),
    nitroV2Plugin({ preset: 'bun' }),
    viteReact(),
  ],
  server: {
    allowedHosts: [
      env.VITE_PROD_ROOT_DOMAIN,
      ...pipe(
        env.TUNNEL_URL,
        Option.fromNullable,
        Option.match({
          onNone: () => [],
          onSome: (x) => [pipe(x, String.replace('https://', ''))],
        }),
      ),
    ],
    port: 3000,
  },
})
