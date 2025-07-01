import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { Terminal } from 'lucide-react'

export const docsLayoutOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="inline-flex items-center gap-2 font-semibold text-lg">
        <Terminal className="w-5 h-5" />
        Dev Jags
      </span>
    ),
    url: '/',
    transparentMode: 'top'
  }
}
