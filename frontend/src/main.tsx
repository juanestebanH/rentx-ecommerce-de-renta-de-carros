import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './shared/lib/queryClient'
import { SessionBootstrap } from './features/auth/components/SessionBootstrap'
import { Toaster } from './shared/components/ui/sonner'
import { router } from './router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>
        <RouterProvider router={router} />
      </SessionBootstrap>
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
)
