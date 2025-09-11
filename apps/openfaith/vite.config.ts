import { env } from '@openfaith/shared'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { Option, pipe, String } from 'effect'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({
      spa: {
        enabled: true,
      },
      target: 'bun',
      tsr: {
        srcDirectory: 'app',
      },
    }),
    tailwindcss(),
  ],
  server: {
    allowedHosts: [
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
