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
  return <article className="border shadow p-2 mb-3">
    <PostContent doc={root.doc} />
    <hr className="my-2" />
    <PostAttribution
      authorPubKey={root.doc.author}
      postedOn={root.firstPosted}
    />
  </article>;
}

function PostView({ post }: { post: Post }) {
  return <article className="border shadow p-2 mb-3">
    <PostContent doc={post.doc} />
    <hr className="my-2" />
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
    <ol className="my-3">
      <ThreadRootView root={thread.root} />
      {thread.replies.map((post) =>
        <PostView key={post.doc.path} post={post} />
      )}
    </ol>
    <Link className="link-btn" to={"reply"}>Reply</Link>
  </div>;
}
