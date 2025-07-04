import matter from 'gray-matter';
import type { DocContent, DocMetadata } from './types';
import {
  octokit,
  REPO_OWNER,
  REPO_NAME,
  DOCS_PATH,
  getFileContent
} from './github-cms-core';

export const publishDoc = (slug: string, category: string): Promise<void> => {
  const branchName = `docs/${category}/${slug}`;

  return octokit.rest.pulls.list({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    head: `${REPO_OWNER}:${branchName}`,
    state: 'open',
  })
    .then(response => {
      const pr = response.data[0];
      if (!pr) throw new Error('No draft PR found');
      return pr;
    })
    .then(pr => {
      const title = pr.title.replace(/^docs\([^)]+\):\s*(add|update)\s*/, '');
      return octokit.rest.pulls.merge({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        pull_number: pr.number,
        commit_title: `docs(${category}): publish ${title}`,
        commit_message: `Merge pull request #${pr.number}\n\nPublish documentation for ${title}`,
        merge_method: 'squash',
      });
    })
    .then(() =>
      octokit.rest.git.deleteRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `heads/${branchName}`,
      })
    )
    .then(() => {});
};

export const getPublishedDocs = (): Promise<DocMetadata[]> => {
  console.error(REPO_NAME, REPO_OWNER)
  return octokit.rest.repos.getContent({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path: DOCS_PATH,
    ref: 'main',
  })
    .then(response => {
      const contents = response.data;
      if (!Array.isArray(contents)) return [];
      console.error(contents)

      return Promise.all(
        contents
          .filter(item => item.type === 'dir')
          .map(item =>
            octokit.rest.repos.getContent({
              owner: REPO_OWNER,
              repo: REPO_NAME,
              path: `${DOCS_PATH}/${item.name}`,
              ref: 'main',
            })
              .then(categoryResponse => {
                const categoryContents = categoryResponse.data;
                if (!Array.isArray(categoryContents)) return [];

                return Promise.all(
                  categoryContents
                    .filter(file => file.type === 'file' && file.name.endsWith('.mdx'))
                    .map(file =>
                      getFileContent(file.path, 'main')
                        .then(fileContent => {
                          if (!fileContent) return null;

                          const { data } = matter(fileContent.content);
                          return {
                            title: data.title || 'Untitled',
                            description: data.description || '',
                            slug: file.name.replace('.mdx', ''),
                            category: item.name,
                            icon: data.icon,
                            order: data.order || 0,
                            status: 'published' as const,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          };
                        })
                        .catch(() => null)
                    )
                );
              })
              .then(docs => docs.filter(doc => doc !== null))
              .catch(() => [])
          )
      );
    })
    .then(results => results.flat())
    .catch(() => []);
};

export const getPublishedDoc = (slug: string, category: string): Promise<DocContent> => {
  const filePath = `${DOCS_PATH}/${category}/${slug}.mdx`;

  return getFileContent(filePath)
    .then(file => {
      if (!file) throw new Error('Published document not found');

      const { data, content } = matter(file.content);
      return {
        metadata: {
          title: data.title || 'Untitled',
          description: data.description || '',
          slug,
          category,
          icon: data.icon,
          order: data.order || 0,
          status: 'published' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        content,
      };
    });
};
