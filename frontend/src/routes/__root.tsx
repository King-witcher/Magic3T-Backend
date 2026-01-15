import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { ConsoleTab } from '@/components/organisms'
import { ErrorTemplate, NotFoundTemplate, RootLayout } from '@/components/templates'
import { Providers } from './-providers'

export const Route = createRootRoute({
  component: () => (
    <Providers>
      <RootLayout>
        <Outlet />
        <ConsoleTab />
      </RootLayout>
      <Analytics />
      <SpeedInsights />
      <ReactQueryDevtools />
      <TanStackRouterDevtools position="bottom-left" />
    </Providers>
  ),
  notFoundComponent: () => <NotFoundTemplate />,
  errorComponent: () => <ErrorTemplate />,
})
