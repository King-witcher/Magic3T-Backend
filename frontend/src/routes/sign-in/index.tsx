import { createFileRoute } from '@tanstack/react-router'
import { SignInTemplate } from '@/components/templates'

export const Route = createFileRoute('/sign-in/')({
  component: Page,
  validateSearch,
})

function validateSearch(search: Record<string, unknown>): {
  referrer?: string
} {
  return {
    referrer: search.referrer?.toString(),
  }
}

function Page() {
  const { referrer } = Route.useSearch()
  return <SignInTemplate referrer={referrer} />
}
