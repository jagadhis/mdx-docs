import {
  octokit,
  REPO_OWNER,
  REPO_NAME,
  DOCS_PATH
} from './github-cms-core';

type VersionHistory = {
  sha: string;
  message: string;
  author: string;
  date: string;
  avatar: string;
  type: 'feat' | 'docs' | 'fix' | 'chore';
};

export const getDocumentHistory = (slug: string, category: string): Promise<VersionHistory[]> => {
  const filePath = `${DOCS_PATH}/${category}/${slug}.mdx`;

  return octokit.rest.repos.listCommits({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path: filePath,
    per_page: 20,
  })
    .then(response => {
      return response.data.map(commit => {
        const message = commit.commit.message;
        const typeMatch = message.match(/^(feat|docs|fix|chore)/);

        return {
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.author?.login || commit.commit.author?.name || 'Unknown',
          date: commit.commit.author?.date || new Date().toISOString(),
          avatar: commit.author?.avatar_url || '',
          type: (typeMatch ? typeMatch[1] : 'docs') as 'feat' | 'docs' | 'fix' | 'chore',
        };
      });
    });
};
