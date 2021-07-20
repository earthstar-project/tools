import * as React from 'react'
import { unified } from "unified";
import parse from "remark-parse";
import remark2rehype from "remark-rehype";
import rehype2react from "rehype-react";

function Heading(props: any) {
  return <h1 className="text-2xl my-2 font-bold" {...props}/>
}

function Heading2(props: any) {
  return <h2 className='text-xl my-2 font-bold' {...props}/>
}

function Heading3(props: any) {
  return <ul className="text-lg my-2 font-bold" {...props} />
}

function Paragraph(props: any) {
  return <p className="my-2" {...props}/>
}

function Pre(props: any) {
  return <pre className="my-2 border p-4 text-sm bg-gray-50" {...props}/>
}

function UnorderedList(props: any) {
  return <ul className="pl-6 my-2 list-disc" {...props} />
}

function OrderedList(props: any) {
  return <ol className="pl-6 my-2 list-decimal" {...props} />
}

function ListItem (props: any) {
  return <li  {...props} />
}

function BlockQuote(props: any) {
  return <blockquote className="border-l-2 border-gray-400 pl-2 my-2" {...props} />
}

function Link(props: any) {
  return <a className="text-blue-600 underline" {...props} />
}

function Code(props: any) {
  return <code className="bg-gray-100 text-sm p-1" {...props} />
}

const processor = unified().use(parse)
  .use(remark2rehype)
  .use(rehype2react, { createElement: React.createElement, components: {
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
    code: Code
  } });

  
export default function renderMarkdown(raw: string) {
  return (processor.processSync(raw).result) as React.ReactNode
}