import { Document } from "earthstar";
import { Link, Outlet, useParams } from "react-router-dom";
import {
  getDocPublishedTimestamp,
  Post,
  ThreadRoot,
  useLetterboxLayer,
} from "./letterbox-layer";
import { formatRelative } from "date-fns";
import { AuthorLabel, useCurrentAuthor } from "react-earthstar";
import { renderMarkdown } from "./util/markdown";

function PostDetails(
  { post, threadId }: { post: Post | ThreadRoot; threadId: string },
) {
  const letterBoxLayer = useLetterboxLayer();
  const firstPostedTimestamp = getDocPublishedTimestamp(post.doc);
  const isUnread = letterBoxLayer.isUnread(threadId, firstPostedTimestamp);
  const [currentAuthor] = useCurrentAuthor();

  return <div className={"text-gray-500 flex justify-between items-baseline"}>
    <div className="flex items-baseline gap-1">
      <b>
        <AuthorLabel address={post.doc.author} />
      </b>{" "}
      {formatRelative(post.firstPosted, Date.now())}
    </div>
    <div>
      {currentAuthor
        ? isUnread
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
              onClick={() => {
                letterBoxLayer.markReadUpTo(threadId, firstPostedTimestamp - 1);
              }}
              className="text-blue-600 text-sm"
            >
              Mark as unread from here
            </button>
          </div>
        : null}
    </div>
  </div>;
}

function ThreadRootView({ root }: { root: ThreadRoot }) {
  const letterBoxLayer = useLetterboxLayer();
  const firstPostedTimestamp = getDocPublishedTimestamp(root.doc);
  const isUnread = letterBoxLayer.isUnread(root.id, firstPostedTimestamp);

  return <article
    className={`px-6 py-6 ${isUnread ? "" : "bg-gray-100 text-gray-600"}`}
  >
    <PostDetails
      post={root}
      threadId={root.id}
    />
    <PostContent doc={root.doc} />
  </article>;
}

function PostView({ post, threadId }: { post: Post; threadId: string }) {
  const letterBoxLayer = useLetterboxLayer();
  const firstPostedTimestamp = getDocPublishedTimestamp(post.doc);
  const isUnread = letterBoxLayer.isUnread(threadId, firstPostedTimestamp);

  return <article
    className={`px-6 py-6 ${isUnread ? "" : "bg-gray-100 text-gray-600"}`}
  >
    <PostDetails
      post={post}
      threadId={threadId}
    />
    <PostContent doc={post.doc} />
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

  const threadId = `${authorPubKey}/${timestamp}`;
  const thread = letterboxLayer.getThread(threadId);

  if (!thread) {
    return <p>No thread found.</p>;
  }

  const lastThreadItem = letterboxLayer.lastThreadItem(threadId);

  const mostRecentIsUnread = lastThreadItem
    ? letterboxLayer.isUnread(
      threadId,
      getDocPublishedTimestamp(lastThreadItem.doc),
    )
    : true;

  const nowTimestamp = Date.now() * 1000;

  return <div className="overflow-scroll shadow-lg">
    <ol>
      <ThreadRootView root={thread.root} />
      <hr className="border-gray-300" />
      {thread.replies.map((post) =>
        <>
          <PostView key={post.doc.path} post={post} threadId={thread.root.id} />
          <hr className="border-gray-300" />
        </>
      )}
    </ol>
    <footer className="flex gap-2 px-6 justify-between py-3">
      <Link className="link-btn" to={"reply"}>New reply</Link>
      {mostRecentIsUnread
        ? <button
          className="btn"
          onClick={() =>
            letterboxLayer.markReadUpTo(thread.root.id, nowTimestamp)}
        >
          Mark thread as read
        </button>
        : null}
    </footer>
    <Outlet />
  </div>;
}
