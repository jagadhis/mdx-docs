import { docs } from '@/lib/docs/docs'
import { createFromSource } from 'fumadocs-core/search/server'

export const { GET } = createFromSource(docs)
