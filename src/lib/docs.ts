import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import type { DocContent, DocMetadata, MetaJsonEntry } from './types';

const DOCS_DIR = join(process.cwd(), 'content/docs');
const DRAFTS_DIR = join(process.cwd(), 'content/drafts');

export const ensureDir = (dir: string): Promise<void> => {
  return mkdir(dir, { recursive: true }).then(() => {});
};

export const saveDraft = (slug: string, content: DocContent): Promise<void> => {
  const categoryDir = join(DRAFTS_DIR, content.metadata.category);
  const filePath = join(categoryDir, `${slug}.mdx`);
  const fileContent = matter.stringify(content.content, {
    title: content.metadata.title,
    description: content.metadata.description
  });

  return ensureDir(categoryDir)
    .then(() => writeFile(filePath, fileContent, 'utf-8'));
};

export const updateMetaJson = (category: string, slug: string, title: string): Promise<void> => {
  const metaPath = join(DOCS_DIR, `(docs)/${category}/meta.json`);

  return readFile(metaPath, 'utf-8')
    .then(content => JSON.parse(content) as MetaJsonEntry)
    .then(meta => {
      if (!meta.pages.includes(slug)) {
        meta.pages.push(slug);
      }
      return writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
    })
    .catch(() => {
      // Create new meta.json if it doesn't exist
      const newMeta: MetaJsonEntry = {
        title: category.charAt(0).toUpperCase() + category.slice(1),
        description: `${category} documentation`,
        pages: [slug]
      };
      return ensureDir(join(DOCS_DIR, `(docs)/${category}`))
        .then(() => writeFile(metaPath, JSON.stringify(newMeta, null, 2), 'utf-8'));
    });
};

export const publishDoc = (slug: string): Promise<void> => {
  const draftPath = join(DRAFTS_DIR, `${slug}.mdx`);

  return readFile(draftPath, 'utf-8')
    .then(content => {
      const { data, content: mdxContent } = matter(content);
      const metadata = data as DocMetadata;
      const categoryDir = join(DOCS_DIR, `(docs)/${metadata.category}`);
      const publishPath = join(categoryDir, `${slug}.mdx`);

      return ensureDir(categoryDir)
        .then(() => writeFile(publishPath, content, 'utf-8'))
        .then(() => updateMetaJson(metadata.category, slug, metadata.title));
    });
};

export const getDrafts = (): Promise<DocMetadata[]> => {
  return ensureDir(DRAFTS_DIR)
    .then(() => readdir(DRAFTS_DIR, { withFileTypes: true }))
    .then(entries => {
      const promises = entries.flatMap(entry => {
        if (entry.isDirectory()) {
          return readdir(join(DRAFTS_DIR, entry.name))
            .then(files => files.filter(file => file.endsWith('.mdx')))
            .then(files => Promise.all(
              files.map(file =>
                readFile(join(DRAFTS_DIR, entry.name, file), 'utf-8')
                  .then(content => {
                    const { data } = matter(content);
                    return {
                      ...data,
                      category: entry.name,
                      slug: file.replace('.mdx', ''),
                      status: 'draft',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    } as DocMetadata;
                  })
              )
            ));
        }
        return [];
      });

      return Promise.all(promises).then(results => results.flat());
    });
};

export const getDraft = (slug: string, category: string): Promise<DocContent> => {
  const filePath = join(DRAFTS_DIR, category, `${slug}.mdx`);

  return readFile(filePath, 'utf-8')
    .then(content => {
      const { data, content: mdxContent } = matter(content);
      return {
        metadata: {
          ...data,
          slug,
          category,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as DocMetadata,
        content: mdxContent
      };
    });
};
