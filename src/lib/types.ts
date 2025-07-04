export type AdminCredentials = {
  readonly username: string;
  readonly password: string;
}

export type DocStatus = 'draft' | 'published';

export type CategoryMeta = {
  readonly title: string;
  readonly description: string;
  readonly icon?: string;
  pages: string[];
}

export type DocMetadata = {
  readonly title: string;
  readonly description: string;
  readonly slug: string;
  readonly category: string;
  readonly icon?: string;
  readonly order: number;
  readonly status: DocStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type DocContent = {
  readonly metadata: DocMetadata;
  readonly content: string;
}

export type ApiResponse<T = void> = {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

export type EditorProps = {
  readonly initialContent: string;
  readonly onChange: (content: string) => void;
}

export type PreviewProps = {
  readonly content: string;
}
