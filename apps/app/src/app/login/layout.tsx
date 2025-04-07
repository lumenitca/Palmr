import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface LayoutProps {
  children: React.ReactNode
}

export async function generateMetadata(): Promise<Metadata> {
  const translate = await getTranslations()
  
  return {
    title: translate('login.pageTitle'),
  }
}

export default function LoginLayout({ children }: LayoutProps) {
  return <>{children}</>
}