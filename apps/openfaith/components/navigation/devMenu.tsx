import { DevMenuContent } from '@openfaith/openfaith/components/navigation/devMenuContent'
import { nullOp } from '@openfaith/shared'
import { useRouter } from '@tanstack/react-router'
import { Boolean, pipe } from 'effect'

export const DevMenu = () => {
  const router = useRouter()
  const { session } = router.options.context

  return pipe(
    session.data?.userRole === 'admin' || !!session.data?.impersonatedBy,
    Boolean.match({
      onFalse: nullOp,
      onTrue: () => <DevMenuContent impersonatedBy={session.data?.impersonatedBy} />,
    }),
  )
}
