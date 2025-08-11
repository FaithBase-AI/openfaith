import { createClient } from 'redis'

export const redis = createClient({
  url: 'redis://localhost:6379',
})
