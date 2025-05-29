import { createRouter } from '@openfaith/openfaith/app/router'
import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler)
