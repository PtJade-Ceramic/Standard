import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

import { visit } from "unist-util-visit";

const rootDir = process.cwd();
const outDir = path.join(rootDir, "dist");
const siteTitle = "Standard";

const alertTitleMap = {
  NOTE: "Note",
  TIP: "Tip",
  IMPORTANT: "Important",
  WARNING: "Warning",
  CAUTION: "Caution"
};


function isNodeOfType(node, type) {
  return node && node.type === type;
}

function hasChildren(node) {
  return node && Array.isArray(node.children) && node.children.length > 0;
}


function firstChildOfType(node, type) {
  if (!hasChildren(node)) return undefined;
  return node.children.find(child => isNodeOfType(child, type));
}

function firstChildValueOfType(node, type) {
  const child = firstChildOfType(node, type);
  return child && child.value !== undefined ? child.value : undefined;
}

function remarkGithubAlerts() {
  const marker = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/;

  return (tree) => {
    visit(tree, "blockquote", (node) => {

      if (!hasChildren(node)) return;

      const firstParagraph = firstChildOfType(node, "paragraph");
      if (!firstParagraph) return;

      const firstText = firstChildOfType(firstParagraph, "text");
      const firstTextValue = firstText && firstText.value !== undefined ? firstText.value : undefined;
      if (!firstTextValue) return;

      const match = firstTextValue.match(marker);
      if (!match) return;

      const alertType = match[1];
      firstText.value = firstTextValue.replace(marker, "");

      const titleParagraph = {
        type: "paragraph",
        data: {
          hName: "p",
          hProperties: {
            className: ["markdown-alert-title"]
          }
        },
        children: [
          {
            type: "text",
            value: alertTitleMap[alertType] || alertType
          }
        ]
      };

      const firstParagraphIsEmpty = hasChildren(firstParagraph) && firstParagraph.children.every((child) => isNodeOfType(child, "text") && child.value.trim() === "");
      const bodyChildren = firstParagraphIsEmpty ? node.children.slice(1) : node.children;

      node.data = {
        hName: "div",
        hProperties: {
          className: ["markdown-alert", `markdown-alert-${alertType.toLowerCase()}`]
        }
      };
      node.children = [titleParagraph, ...bodyChildren];
    });
  };
}

async function ensureCleanOutDir() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });
}

async function getMarkdownFiles() {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function toOutputFile(markdownFileName) {
  const baseName = markdownFileName.replace(/\.md$/i, "");
  if (baseName.toLowerCase() === "index") {
    return path.join(outDir, "index.html");
  }
  return path.join(outDir, baseName, "index.html");
}

function renderPage({ title, html }) {
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${fullTitle}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css">
    <style>
      body {
        margin: 0;
        background: #ffffff;
      }
      .page-wrap {
        max-width: 980px;
        margin: 2rem auto;
        padding: 0 1rem;
      }
      .markdown-body {
        box-sizing: border-box;
        min-width: 200px;
      }
      .page-title {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      .markdown-alert {
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;
        border-left: 0.25rem solid #0969da;
        border-radius: 0.25rem;
        background: #f6f8fa;
      }
      .markdown-alert-title {
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-weight: 600;
        display: flex;
        align-items: center;
      }
      .markdown-alert-note {
        border-left-color: #0969da;
      }
      .markdown-alert-tip {
        border-left-color: #1a7f37;
      }
      .markdown-alert-important {
        border-left-color: #8250df;
      }
      .markdown-alert-warning {
        border-left-color: #9a6700;
      }
      .markdown-alert-caution {
        border-left-color: #cf222e;
      }
      /* 图标样式（合并公共属性，减少重复） */
      .markdown-alert-title::before {
        font-size: 1.2em;
        margin-right: 0.4em;
        color: inherit;
      }
      .markdown-alert-note .markdown-alert-title {
        color: #0969da;
      }
      .markdown-alert-tip .markdown-alert-title {
        color: #1a7f37;
      }
      .markdown-alert-important .markdown-alert-title {
        color: #8250df;
      }
      .markdown-alert-warning .markdown-alert-title {
        color: #9a6700;
      }
      .markdown-alert-caution .markdown-alert-title {
        color: #cf222e;
      }
      .markdown-alert-note .markdown-alert-title::before {
        content: "\\24D8\\FE0F"; /* ℹ⃝ */
      }
      .markdown-alert-tip .markdown-alert-title::before {
        content: "\\1F4A1"; /* 💡 */
      }
      .markdown-alert-important .markdown-alert-title::before {
        content: "\\0021\\2A62"; /* !⃢ */
      }
      .markdown-alert-warning .markdown-alert-title::before {
        content: "\\0021\\2A64"; /* !⃤ */
      }
      .markdown-alert-caution .markdown-alert-title::before {
        content: "\\0021\\200D"; /* !‍ */
      }
    </style>
  </head>
  <body>
    <div class="page-wrap">
      <article class="markdown-body">
        ${title ? `<h1 class="page-title">${title}</h1>` : ""}
        ${html}
      </article>
    </div>
  </body>
</html>
`;
}

async function buildOne(fileName, processor) {
  const absPath = path.join(rootDir, fileName);
  const raw = await fs.readFile(absPath, "utf8");
  const parsed = matter(raw);
  const pageTitle = parsed.data?.title || path.basename(fileName, ".md");
  const html = String(await processor.process(parsed.content));

  const outputFile = toOutputFile(fileName);
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, renderPage({ title: pageTitle, html }), "utf8");
}

async function main() {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkGithubAlerts)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify);

  await ensureCleanOutDir();
  const markdownFiles = await getMarkdownFiles();

  for (const file of markdownFiles) {
    await buildOne(file, processor);
  }

  await fs.writeFile(path.join(outDir, ".nojekyll"), "", "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
