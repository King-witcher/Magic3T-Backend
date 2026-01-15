import { createFileRoute } from '@tanstack/react-router'
import { StoreTemplate } from '@/components/templates'

export const Route = createFileRoute('/_auth-guarded/store')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StoreTemplate />
}
