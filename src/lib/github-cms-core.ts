import { Octokit } from 'octokit';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = process.env.GITHUB_OWNER!;
const REPO_NAME = process.env.GITHUB_REPO!;
const DOCS_PATH = 'src/content/docs/(docs)';

type VersionHistory = {
  sha: string;
  message: string;
  author: string;
  date: string;
  avatar: string;
  type: 'feat' | 'docs' | 'fix' | 'chore';
};

type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
};

const getBranchSHA = (): Promise<string> => {
  return octokit.rest.repos.getBranch({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    branch: 'main',
  })
    .then(response => response.data.commit.sha);
};

const getFileContent = (path: string, branch = 'main'): Promise<{ content: string; sha: string } | null> => {
  return octokit.rest.repos.getContent({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path,
    ref: branch,
  })
    .then(response => {
      const data = response.data;
      if ('content' in data) {
        return {
          content: Buffer.from(data.content, 'base64').toString('utf-8'),
          sha: data.sha,
        };
      }
      return null;
    })
    .catch(error => {
      if (error.status === 404) return null;
      throw error;
    });
};

const createSemanticCommitMessage = (action: 'add' | 'update' | 'remove', category: string, title: string): string => {
  const type = action === 'add' ? 'feat' : 'docs';
  const actionVerb = action === 'add' ? 'add' : action === 'update' ? 'update' : 'remove';
  return `${type}(${category}): ${actionVerb} ${title}`;
};

const createBranch = (branchName: string): Promise<void> => {
  return getBranchSHA()
    .then(mainSha =>
      octokit.rest.git.createRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `refs/heads/${branchName}`,
        sha: mainSha,
      })
    )
    .then(() => {})
    .catch(error => {
      if (error.status !== 422) throw error;
    });
};

export {
  octokit,
  REPO_OWNER,
  REPO_NAME,
  DOCS_PATH,
  getBranchSHA,
  getFileContent,
  createSemanticCommitMessage,
  createBranch,
  type VersionHistory,
  type GitHubCommit
};
