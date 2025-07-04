import matter from 'gray-matter';
import type { DocContent, DocMetadata } from './types';
import {
  octokit,
  REPO_OWNER,
  REPO_NAME,
  DOCS_PATH,
  getFileContent,
  createSemanticCommitMessage,
  createBranch
} from './github-cms-core';

const updateCategoryMeta = async (category: string, slug: string, branch: string): Promise<void> => {
  const metaPath = `${DOCS_PATH}/${category}/meta.json`;
  const existingMeta = await getFileContent(metaPath, branch);

  let meta;
  if (existingMeta) {
    meta = JSON.parse(existingMeta.content);
    if (!meta.pages.includes(slug)) {
      meta.pages.push(slug);
    }
  } else {
    meta = {
      title: category.charAt(0).toUpperCase() + category.slice(1),
      description: `${category} documentation`,
      icon: "BookMarked",
      pages: [slug]
    };
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path: metaPath,
    message: createSemanticCommitMessage('update', category, 'meta configuration'),
    content: Buffer.from(JSON.stringify(meta, null, 2)).toString('base64'),
    branch,
    ...(existingMeta?.sha && { sha: existingMeta.sha }),
  });
};

export const saveDraft = async (slug: string, content: DocContent): Promise<{ prNumber: number; branchName: string }> => {
  const branchName = `docs/${content.metadata.category}/${slug}`;
  const filePath = `${DOCS_PATH}/${content.metadata.category}/${slug}.mdx`;

  const frontmatter = {
    title: content.metadata.title,
    description: content.metadata.description,
    ...(content.metadata.icon && { icon: content.metadata.icon }),
    ...(content.metadata.order && content.metadata.order !== 0 && { order: content.metadata.order }),
  };
  const fileContent = matter.stringify(content.content, frontmatter);

  await createBranch(branchName);

  const existingFile = await getFileContent(filePath, branchName);
  const isNew = !existingFile;
  const commitMessage = createSemanticCommitMessage(
    isNew ? 'add' : 'update',
    content.metadata.category,
    content.metadata.title
  );

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path: filePath,
    message: commitMessage,
    content: Buffer.from(fileContent).toString('base64'),
    branch: branchName,
    ...(existingFile?.sha && { sha: existingFile.sha }),
  });

  await updateCategoryMeta(content.metadata.category, slug, branchName);

  try {
    const pr = await octokit.rest.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `docs(${content.metadata.category}): add ${content.metadata.title}`,
      head: branchName,
      base: 'main',
      body: `## Summary\n\n**Category:** ${content.metadata.category}\n**Type:** Documentation\n\n${content.metadata.description}\n\n## Changes\n- Add new documentation for ${content.metadata.title}`,
    });
    return { prNumber: pr.data.number, branchName };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 422) {
      const existingPRs = await octokit.rest.pulls.list({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        head: `${REPO_OWNER}:${branchName}`,
        state: 'open',
      });
      const prNumber = existingPRs.data[0]?.number;
      if (!prNumber) throw error;
      return { prNumber, branchName };
    }
    throw error;
  }
};

export const deleteDraft = async (slug: string, category: string): Promise<void> => {
  const branchName = `docs/${category}/${slug}`;

  try {
    const pullsResponse = await octokit.rest.pulls.list({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      head: `${REPO_OWNER}:${branchName}`,
      state: 'open',
    });

    const pr = pullsResponse.data[0];
    if (pr) {
      await octokit.rest.pulls.update({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        pull_number: pr.number,
        state: 'closed',
      });
    }

    await octokit.rest.git.deleteRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${branchName}`,
    });
  } catch (error) {
    console.warn('Delete draft error:', error);
  }
};

export const getDrafts = (): Promise<DocMetadata[]> => {
  return octokit.rest.pulls.list({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open',
  })
    .then(response => {
      const draftPRs = response.data.filter(pr => pr.head.ref.startsWith('docs/'));

      if (draftPRs.length === 0) return [];

      return Promise.all(
        draftPRs.map(pr => {
          const pathParts = pr.head.ref.split('/');
          if (pathParts.length >= 3) {
            const category = pathParts[1];
            const slug = pathParts.slice(2).join('/');
            const filePath = `${DOCS_PATH}/${category}/${slug}.mdx`;

            return getFileContent(filePath, pr.head.ref)
              .then(file => {
                if (!file) return null;

                const { data } = matter(file.content);
                return {
                  title: data.title || 'Untitled',
                  description: data.description || '',
                  slug,
                  category,
                  icon: data.icon,
                  order: data.order || 0,
                  status: 'draft' as const,
                  createdAt: pr.created_at,
                  updatedAt: pr.updated_at,
                };
              })
              .catch(() => null);
          }
          return Promise.resolve(null);
        })
      );
    })
    .then(results => results.filter(doc => doc !== null))
    .catch(() => []);
};

export const getDraft = async (slug: string, category: string): Promise<DocContent> => {
  const branchName = `docs/${category}/${slug}`;
  const filePath = `${DOCS_PATH}/${category}/${slug}.mdx`;

  const file = await getFileContent(filePath, branchName);
  if (!file) {
    throw new Error('Draft not found');
  }

  const { data, content } = matter(file.content);
  return {
    metadata: {
      title: data.title || 'Untitled',
      description: data.description || '',
      slug,
      category,
      icon: data.icon,
      order: data.order || 0,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    content,
  };
};
