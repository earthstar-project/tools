import * as React from "react";
import { unified } from "unified";
import parse from "remark-parse";
import remark2rehype from "remark-rehype";
import rehype2react from "rehype-react";
import rehypeTruncate from "rehype-truncate";

function Heading(props: any) {
  return <h1 className="text-2xl my-2 font-bold" {...props} />;
}

function Heading2(props: any) {
  return <h2 className="text-xl my-2 font-bold" {...props} />;
}

function Heading3(props: any) {
  return <ul className="text-lg my-2 font-bold" {...props} />;
}

function Paragraph(props: any) {
  return <p className="my-2 max-w-prose" {...props} />;
}

function Pre(props: any) {
  return <pre
    className="my-2 border p-4 text-sm bg-gray-50 overflow-scroll"
    {...props}
  />;
}

function UnorderedList(props: any) {
  return <ul className="pl-6 my-2 list-disc" {...props} />;
}

function OrderedList(props: any) {
  return <ol className="pl-6 my-2 list-decimal" {...props} />;
}

function ListItem(props: any) {
  return <li {...props} />;
}

function BlockQuote(props: any) {
  return <blockquote
    className="border-l-2 border-gray-400 pl-2 my-2"
    {...props}
  />;
}

function Link(props: any) {
  return <a className="text-blue-600 underline" {...props} />;
}

function Code(props: any) {
  return <code className="bg-gray-100 text-sm p-1" {...props} />;
}

const processor = unified().use(parse)
  .use(remark2rehype)
  .use(rehype2react, {
    createElement: React.createElement,
    components: {
      h1: Heading,
      h2: Heading2,
      h3: Heading3,
      p: Paragraph,
      pre: Pre,
      ul: UnorderedList,
      ol: OrderedList,
      li: ListItem,
      blockquote: BlockQuote,
      a: Link,
      code: Code,
    },
  });

export function renderMarkdown(raw: string) {
  return (processor.processSync(raw).result) as React.ReactNode;
}

function PreviewHeading(props: any) {
  return <h1 className="font-bold inline" {...props} />;
}

function PreviewHeading2(props: any) {
  return <h2 className="font-bold inline" {...props} />;
}

function PreviewHeading3(props: any) {
  return <ul className="font-bold inline" {...props} />;
}

function PreviewParagraph(props: any) {
  return <p className="inline" {...props} />;
}

function PreviewPre(props: any) {
  return <pre
    className="inline text-sm bg-gray-50 whitespace-nowrap"
    {...props}
  />;
}

function PreviewUnorderedList(props: any) {
  return <ul className="inline list-disc" {...props} />;
}

function PreviewOrderedList(props: any) {
  return <ol className="inline list-decimal" {...props} />;
}

function PreviewListItem(props: any) {
  return <li className="inline" {...props} />;
}

function PreviewBlockQuote({ children, ...rest }: any) {
  return <blockquote
    className="inline"
    {...rest}
  >
    {"“"}
    {children}
    {"”"}
  </blockquote>;
}

function PreviewLink(props: any) {
  return <a className="text-blue-600 underline" {...props} />;
}

function PreviewCode(props: any) {
  return <code className="bg-gray-100 text-sm p-1" {...props} />;
}

const previewProcessor = unified().use(parse)
  .use(remark2rehype)
  .use(rehypeTruncate, { maxChars: 100 })
  .use(rehype2react, {
    Fragment: React.Fragment,
    createElement: React.createElement,
    components: {
      h1: PreviewHeading,
      h2: PreviewHeading2,
      h3: PreviewHeading3,
      p: PreviewParagraph,
      pre: PreviewPre,
      ul: PreviewUnorderedList,
      ol: PreviewOrderedList,
      li: PreviewListItem,
      blockquote: PreviewBlockQuote,
      a: PreviewLink,
      code: PreviewCode,
    },
  });

export function renderMarkdownPreview(raw: string) {
  return (previewProcessor.processSync(raw).result) as React.ReactNode;
}
