# mdx-docs

mdx-docs is a documentation system built with Next.js, designed to leverage MDX (Markdown with JSX) and GitHub as a CMS for managing and editing documentation content. This project aims to make it easy for developers and teams to write, manage, and deploy documentation with a modern, developer-friendly workflow.

## Features

- **Next.js Powered**: Utilizes the latest features and optimizations from Next.js for fast, scalable, and SEO-friendly documentation sites.
- **MDX Support**: Write documentation using MDX, allowing you to blend Markdown content with React components for interactive and dynamic docs.
- **GitHub-based CMS**: Manage your documentation directly from your GitHub repository. All docs and content changes are tracked with Git, making collaboration and version control seamless.
- **Live Editing**: Edit your documentation in real-time by modifying files like `app/page.tsx`. The application auto-updates as you save changes.
- **Font Optimization**: Uses `next/font` to automatically load and optimize the Geist font family from Vercel, ensuring clean and readable typography.
- **Easy Deployment**: Designed for effortless deployment on Vercel, the platform created by the Next.js team, with out-of-the-box support for preview and production environments.

## Getting Started

To run the project locally:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the documentation site in action.

### Editing Documentation

- Start editing the main page by modifying `app/page.tsx`.
- All content is hot-reloaded, so you’ll see updates instantly as you edit files.

### Folder Structure

- `.source/` – Contains the source files for the documentation system and GitHub CMS integration.
- `public/` – Static assets like favicon and images.
- `src/` – Main source code for the Next.js application.
- Additional config files for linting, TypeScript, PostCSS, and more.

## Deployment

The easiest way to deploy your documentation site is through [Vercel](https://vercel.com/). You can set up automatic deployments from your GitHub repository for both preview and production environments.

## Tech Stack

- **TypeScript**: For type-safe development.
- **Next.js**: The core React framework.
- **MDX**: For writing rich, interactive documentation.
- **CSS**: For styling.
- **GitHub**: As a headless CMS and version control system.

## Contributing

Feedback and contributions are welcome! Please open issues or pull requests if you have suggestions or improvements.

## License

This project is open source and available under the MIT License.

---

For more information, check out:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [MDX Documentation](https://mdxjs.com/)
