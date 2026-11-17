import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { defaultBranding, getBranding } from '../lib/data'
import type { Branding } from '../types'

interface BrandingContextValue {
  branding: Branding
  logoUrl: string
  bannerUrl: string
  refresh: () => Promise<void>
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined)

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(defaultBranding)

  async function refresh() {
    try {
      setBranding(await getBranding())
    } catch {
      setBranding(defaultBranding)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <BrandingContext.Provider
      value={{
        branding,
        logoUrl: branding.logo_url,
        bannerUrl: branding.banner_url,
        refresh,
      }}
    >
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding(): BrandingContextValue {
  const ctx = useContext(BrandingContext)
  if (!ctx) throw new Error('useBranding debe usarse dentro de BrandingProvider')
  return ctx
}
