import { AppLoading } from '@openfaith/openfaith/components/appLoading'
import { PostCodeMessage } from '@openfaith/openfaith/components/postCodeMessage'
import { createFileRoute } from '@tanstack/react-router'
import { Schema } from 'effect'

const OAuthSearch = Schema.Struct({
  code: Schema.String,
})

export const Route = createFileRoute('/oauth/$provider')({
  component: RouteComponent,
  validateSearch: Schema.standardSchemaV1(OAuthSearch),
})

function RouteComponent() {
  const { code } = Route.useSearch()

  return (
    <>
      <AppLoading />
      <PostCodeMessage code={code} />
    </>
  )
}
