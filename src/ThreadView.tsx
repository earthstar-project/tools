import * as React from "react";
import { Document } from "earthstar";
import { Link, Outlet, useParams } from "react-router-dom";
import {
  getDocPublishedTimestamp,
  Post,
  ThreadRoot,
  useLetterboxLayer,
} from "./letterbox-layer";
import { formatRelative } from "date-fns";
import { AuthorLabel } from "react-earthstar";
import { renderMarkdown } from "./util/markdown";

function PostDetails(
  { post, threadId }: { post: Post | ThreadRoot; threadId: string },
) {
  const letterBoxLayer = useLetterboxLayer();
  const firstPostedTimestamp = getDocPublishedTimestamp(post.doc);
  const isUnread = letterBoxLayer.isUnread(threadId, firstPostedTimestamp);

  return <div className={"text-gray-500 flex justify-between items-baseline"}>
    <div className="flex items-baseline gap-1">
      <div
        className={isUnread ? "bg-blue-500 rounded-full w-3 h-3" : "w-3"}
      />

      <b>
        <AuthorLabel address={post.doc.author} />
      </b>{" "}
      {formatRelative(post.firstPosted, Date.now())}
    </div>
    <div>
      {isUnread
        ? <div>
          <button
            className="text-sm"
            onClick={() =>
              letterBoxLayer.markReadUpTo(threadId, firstPostedTimestamp)}
          >
            Mark as read up to here
          </button>
        </div>
        : <div>
          <button
            onClick={() =>
              letterBoxLayer.markReadUpTo(threadId, firstPostedTimestamp - 1)}
            className="text-blue-600 text-sm"
          >
            Mark as unread from here
          </button>
        </div>}
    </div>
  </div>;
}

function ThreadRootView({ root }: { root: ThreadRoot }) {
  return <article className="border shadow p-2 mb-3">
    <PostContent doc={root.doc} />
    <hr className="my-2" />
    <PostDetails
      post={root}
      threadId={root.id}
    />
  </article>;
}

function PostView({ post, threadId }: { post: Post; threadId: string }) {
  return <article className="border shadow p-2 mb-3">
    <PostContent doc={post.doc} />
    <hr className="my-2" />
    <PostDetails
      post={post}
      threadId={threadId}
    />
  </article>;
}

function PostContent({ doc }: { doc: Document }) {
  return <div>
    {renderMarkdown(doc.content)}
  </div>;
}

export default function ThreadView() {
  const { authorPubKey, timestamp } = useParams();

  const letterboxLayer = useLetterboxLayer();

  const thread = letterboxLayer.getThread(`${authorPubKey}/${timestamp}`);

  if (!thread) {
    return <p>No thread found.</p>;
  }

  const nowTimestamp = Date.now() * 1000;

  return <div>
    <Outlet />
    <ol className="my-3">
      <ThreadRootView root={thread.root} />
      {thread.replies.map((post) =>
        <PostView key={post.doc.path} post={post} threadId={thread.root.id} />
      )}
    </ol>
    <footer className="flex gap-2">
      <Link className="link-btn" to={"reply"}>New reply</Link>
      <button
        className="btn"
        onClick={() =>
          letterboxLayer.markReadUpTo(thread.root.id, nowTimestamp)}
      >
        Mark thread as read
      </button>
    </footer>
  </div>;
}
