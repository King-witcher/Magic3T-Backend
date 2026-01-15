import { createFileRoute } from '@tanstack/react-router'
import { Loading, RankingTemplate } from '@/components/templates'

export const Route = createFileRoute('/ranking')({
  component: () => <RankingTemplate />,
  pendingComponent: () => <Loading />,
})
