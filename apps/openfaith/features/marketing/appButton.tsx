import { nullOp } from '@openfaith/shared'
import type { ButtonProps } from '@openfaith/ui'
import { Button } from '@openfaith/ui'
import { Link, useRouter } from '@tanstack/react-router'
import { Option, pipe } from 'effect'
import type { FC } from 'react'

export const AppButton: FC<ButtonProps> = (props) => {
  const router = useRouter()
  const session = router.options.context.session.data

  return pipe(
    session,
    Option.fromNullable,
    Option.match({
      onNone: nullOp,
      onSome: (x) =>
        pipe(
          x.activeOrganizationId,
          Option.fromNullable,
          Option.match({
            // No org, send em to onboarding
            onNone: () => (
              <Button asChild variant='secondary' {...props}>
                <Link to={'/onboarding' as string}>Dashboard</Link>
              </Button>
            ),
            // Has org, send em to dashboard
            onSome: () => (
              <Button asChild variant='secondary' {...props}>
                <Link to={'/directory/people' as string}>Dashboard</Link>
              </Button>
            ),
          }),
        ),
    }),
  )
}
