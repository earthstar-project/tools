import * as React from "react";
import { Document } from "earthstar";
import { Link, Outlet, useParams } from "react-router-dom";
import { Post, ThreadRoot, useLetterboxLayer } from "./letterbox-layer";
import { micromark } from "micromark";
import { formatRelative } from "date-fns";
import { AuthorLabel } from "react-earthstar";

function PostAttribution(
  { authorPubKey, postedOn }: { authorPubKey: string; postedOn: Date },
) {
  return <div>
    <b>
      <AuthorLabel address={authorPubKey} />
    </b>{" "}
    {formatRelative(postedOn, Date.now())}
  </div>;
}

function ThreadRootView({ root }: { root: ThreadRoot }) {
  return <article>
    <PostContent doc={root.doc} />
    <PostAttribution
      authorPubKey={root.doc.author}
      postedOn={root.firstPosted}
    />
  </article>;
}

function PostView({ post }: { post: Post }) {
  return <article>
    <PostContent doc={post.doc} />
    <PostAttribution
      authorPubKey={post.doc.author}
      postedOn={post.firstPosted}
    />
  </article>;
}

function PostContent({ doc }: { doc: Document }) {
  const html = micromark(doc.content);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ThreadView() {
  const { authorPubKey, timestamp } = useParams();

  const letterboxLayer = useLetterboxLayer();

  const thread = letterboxLayer.getThread(`${authorPubKey}/${timestamp}`);

  if (!thread) {
    return <p>No thread found.</p>;
  }

  return <div>
    <Outlet />
    <ol>
      <ThreadRootView root={thread.root} />
      {thread.replies.map((post) =>
        <PostView key={post.doc.path} post={post} />
      )}
    </ol>
    <Link to={"reply"}>Reply</Link>
  </div>;
}
