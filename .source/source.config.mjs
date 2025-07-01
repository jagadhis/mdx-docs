// source.config.ts
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
var docsCollection = defineDocs({
  dir: "src/content/docs"
});
var source_config_default = defineConfig({
  lastModifiedTime: "none"
});
export {
  source_config_default as default,
  docsCollection
};
