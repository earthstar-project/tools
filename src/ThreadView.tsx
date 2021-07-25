import { Document } from "earthstar";
import { Link, Outlet, useMatch, useParams } from "react-router-dom";
import {
  getDocPublishedTimestamp,
  Post,
  ThreadRoot,
  useLetterboxLayer,
} from "./letterbox-layer";
import { formatRelative } from "date-fns";
import { AuthorLabel, useCurrentAuthor } from "react-earthstar";
import { renderMarkdown } from "./util/markdown";
import ThreadTitle from "./ThreadTitle";

function ThreadBar({ id }: { id: string }) {
  const match = useMatch("/:lookup/*");

  const lookup = match?.params.lookup;

  const letterboxLayer = useLetterboxLayer();

  const lastThreadItem = letterboxLayer.lastThreadItem(id);

  const mostRecentIsUnread = lastThreadItem
    ? letterboxLayer.isUnread(
      id,
      getDocPublishedTimestamp(lastThreadItem.doc),
    )
    : true;

  const nowTimestamp = Date.now() * 1000;

  return <div
    className="flex py-2 px-3 md:px-3 bg-gray-100 border-b shadow-sm justify-between sticky top-0 z-50 items-baseline"
  >
    <div className="flex">
      <Link
        className="md:hidden mr-2 text-blue-500 text-xl"
        to={`/${lookup}` || "/"}
      >
        ⬅
      </Link>
      <div className={"font-bold text-xl"}>
        <ThreadTitle threadId={id} />
      </div>
    </div>

    {mostRecentIsUnread
      ? <button
        className="p-1.5 bg-blue-800 text-white rounded"
        onClick={() => letterboxLayer.markReadUpTo(id, nowTimestamp)}
      >
        Mark thread as read
      </button>
      : null}
  </div>;
}

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
        ? <label>
          <span className="text-sm">Read</span>
          <input
            type="checkbox"
            className="ml-1"
            checked={!isUnread}
            onChange={() => {
              if (isUnread) {
                letterBoxLayer.markReadUpTo(threadId, firstPostedTimestamp);
              } else {
                letterBoxLayer.markReadUpTo(threadId, firstPostedTimestamp - 1);
              }
            }}
          />
        </label>
        : null}
    </div>
  </div>;
}

function ThreadRootView({ root }: { root: ThreadRoot }) {
  const letterBoxLayer = useLetterboxLayer();
  const firstPostedTimestamp = getDocPublishedTimestamp(root.doc);
  const isUnread = letterBoxLayer.isUnread(root.id, firstPostedTimestamp);

  return <article
    className={`p-3 md:p-6  ${isUnread ? "" : "bg-gray-100 text-gray-600"}`}
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
    className={`p-3 md:p-6 ${isUnread ? "" : "bg-gray-100 text-gray-600"}`}
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

  const [currentAuthor] = useCurrentAuthor();

  const letterboxLayer = useLetterboxLayer();

  const threadId = `${authorPubKey}/${timestamp}`;
  const thread = letterboxLayer.getThread(threadId);

  if (!thread) {
    return <p>No thread found.</p>;
  }

  return <div className="overflow-scroll shadow-lg">
    <ThreadBar id={thread.root.id} />
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
    <footer className="flex gap-2 p-3 lg:px-6 justify-between py-3">
      {currentAuthor
        ? <Link className="link-btn" to={"reply"}>New reply</Link>
        : null}
    </footer>
    <Outlet />
  </div>;
}
