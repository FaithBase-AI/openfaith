import { createStartAPIHandler, defaultAPIFileRouteHandler } from '@tanstack/react-start/api'

// Validate environment variables
import '@openfaith/shared/env'

export default createStartAPIHandler(defaultAPIFileRouteHandler)
