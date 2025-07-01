import { docsCollection } from '@/../.source'
import { loader } from 'fumadocs-core/source'
import { icons } from 'lucide-react'
import { createElement } from 'react'

export const docs = loader({
  baseUrl: '/',
  source: docsCollection.toFumadocsSource(),
  icon: (icon) => {
    if (!icon || !(icon in icons)) {
      return
    }
    return createElement(icons[icon as keyof typeof icons])
  }
})
