import { readFile, writeFile, readdir, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import type { DocContent, DocMetadata, CategoryMeta } from './types';

const PROJECT_ROOT = process.cwd();
const CONTENT_DIR = join(PROJECT_ROOT, 'content');
const DRAFTS_DIR = join(CONTENT_DIR, 'drafts');
const SRC_DIR = join(PROJECT_ROOT, 'src');
const SRC_CONTENT_DIR = join(SRC_DIR, 'content');
const DOCS_DIR = join(SRC_CONTENT_DIR, 'docs', '(docs)');

const ensureDir = (dir: string): Promise<void> =>
  mkdir(dir, { recursive: true }).then(() => {});

const createFrontmatter = (metadata: DocMetadata) => ({
  title: metadata.title,
  description: metadata.description,
  ...(metadata.icon && { icon: metadata.icon }),
  ...(metadata.order && metadata.order !== 0 && { order: metadata.order })
});

const updateCategoryMeta = (baseDir: string, category: string, slug: string): Promise<void> => {
  const categoryMetaPath = join(baseDir, category, 'meta.json');

  return readFile(categoryMetaPath, 'utf-8')
    .then(content => JSON.parse(content) as CategoryMeta)
    .then(meta => {
      if (!meta.pages.includes(slug)) {
        meta.pages.push(slug);
        return writeFile(categoryMetaPath, JSON.stringify(meta, null, 2), 'utf-8');
      }
    })
    .catch(() => {
      const newMeta: CategoryMeta = {
        title: category.charAt(0).toUpperCase() + category.slice(1),
        description: `${category} documentation`,
        icon: "BookMarked",
        pages: [slug]
      };
      return ensureDir(join(baseDir, category))
        .then(() => writeFile(categoryMetaPath, JSON.stringify(newMeta, null, 2), 'utf-8'));
    });
};

const removeDraftMeta = (category: string, slug: string): Promise<void> => {
  const categoryMetaPath = join(DRAFTS_DIR, category, 'meta.json');

  return readFile(categoryMetaPath, 'utf-8')
    .then(content => JSON.parse(content) as CategoryMeta)
    .then(meta => {
      meta.pages = meta.pages.filter(page => page !== slug);
      if (meta.pages.length === 0) {
        return unlink(categoryMetaPath).catch(() => {});
      }
      return writeFile(categoryMetaPath, JSON.stringify(meta, null, 2), 'utf-8');
    })
    .catch(() => {});
};

export const saveDraft = (slug: string, content: DocContent): Promise<void> => {
  const categoryDir = join(DRAFTS_DIR, content.metadata.category);
  const mdxPath = join(categoryDir, `${slug}.mdx`);
  const frontmatter = createFrontmatter(content.metadata);
  const fileContent = matter.stringify(content.content, frontmatter);

  return ensureDir(categoryDir)
    .then(() => Promise.all([
      writeFile(mdxPath, fileContent, 'utf-8'),
      updateCategoryMeta(DRAFTS_DIR, content.metadata.category, slug)
    ]))
    .then(() => {});
};

export const deleteDraft = (slug: string, category: string): Promise<void> => {
  const draftPath = join(DRAFTS_DIR, category, `${slug}.mdx`);
  return Promise.all([
    unlink(draftPath),
    removeDraftMeta(category, slug)
  ]).then(() => {});
};

export const publishDoc = (slug: string, category: string): Promise<void> => {
  const draftPath = join(DRAFTS_DIR, category, `${slug}.mdx`);
  const publishDir = join(DOCS_DIR, category);
  const publishPath = join(publishDir, `${slug}.mdx`);

  return readFile(draftPath, 'utf-8')
    .then(content =>
      ensureDir(publishDir)
        .then(() => Promise.all([
          writeFile(publishPath, content, 'utf-8'),
          updateCategoryMeta(DOCS_DIR, category, slug),
          deleteDraft(slug, category)
        ]))
    )
    .then(() => {});
};

const parseDocFromFile = (file: string, category: string, status: 'draft' | 'published') =>
  (content: string): DocMetadata => {
    const { data } = matter(content);
    const slug = file.replace('.mdx', '');
    return {
      title: data.title || 'Untitled',
      description: data.description || '',
      slug,
      category,
      icon: data.icon,
      order: data.order || 0,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

const getDocsFromDir = (baseDir: string, status: 'draft' | 'published'): Promise<DocMetadata[]> =>
  ensureDir(baseDir)
    .then(() => readdir(baseDir, { withFileTypes: true }))
    .then(entries =>
      Promise.all(
        entries
          .filter(entry => entry.isDirectory())
          .map(entry =>
            readdir(join(baseDir, entry.name))
              .then(files =>
                Promise.all(
                  files
                    .filter(file => file.endsWith('.mdx'))
                    .map(file =>
                      readFile(join(baseDir, entry.name, file), 'utf-8')
                        .then(parseDocFromFile(file, entry.name, status))
                    )
                )
              )
          )
      )
    )
    .then(results => results.flat());

export const getDrafts = (): Promise<DocMetadata[]> =>
  getDocsFromDir(DRAFTS_DIR, 'draft');

export const getPublishedDocs = (): Promise<DocMetadata[]> =>
  getDocsFromDir(DOCS_DIR, 'published');

export const getDraft = (slug: string, category: string): Promise<DocContent> => {
  const mdxPath = join(DRAFTS_DIR, category, `${slug}.mdx`);

  return readFile(mdxPath, 'utf-8')
    .then(content => {
      const { data, content: mdxContent } = matter(content);
      return {
        metadata: {
          title: data.title || 'Untitled',
          description: data.description || '',
          slug,
          category,
          icon: data.icon,
          order: data.order || 0,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        content: mdxContent
      };
    });
};

export const getPublishedDoc = (slug: string, category: string): Promise<DocContent> => {
  const mdxPath = join(DOCS_DIR, category, `${slug}.mdx`);

  return readFile(mdxPath, 'utf-8')
    .then(content => {
      const { data, content: mdxContent } = matter(content);
      return {
        metadata: {
          title: data.title || 'Untitled',
          description: data.description || '',
          slug,
          category,
          icon: data.icon,
          order: data.order || 0,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        content: mdxContent
      };
    });
};
