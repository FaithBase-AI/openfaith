import { AppLoading } from '@openfaith/openfaith/components/appLoading'
import { PostCodeMessage } from '@openfaith/openfaith/components/postCodeMessage'
import { createFileRoute } from '@tanstack/react-router'

type OAuthSearch = {
  code: string
}

export const Route = createFileRoute('/oauth/$provider')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): OAuthSearch => {
    return {
      code: (search.code as string) || '',
    }
  },
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
