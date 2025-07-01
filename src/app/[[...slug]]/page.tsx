import { docs } from '@/lib/docs/docs'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle
} from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { getMDXComponents } from '@/mdx-components'

type DocsPageProps = {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function Page(props: DocsPageProps) {

  const { slug } = await props.params
  const page = docs.getPage(slug)

  if (!page) {
    notFound()
  }

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} article={{ className: 'gap-4' }}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0 text-base">{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  )
}

export const generateStaticParams = async () => {
  return docs.generateParams()
}

export const generateMetadata = async (props: DocsPageProps) => {

  const { slug } = await props.params
  const page = docs.getPage(slug)

  if (!page) {
    notFound()
  }

  return {
    title: page.data.title,
    description: page.data.description
  }
}
