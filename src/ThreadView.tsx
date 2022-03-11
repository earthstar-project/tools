import * as React from "react";
import { Doc, isErr } from "earthstar";
import { Link, Outlet, useMatch, useParams } from "react-router-dom";
import { Post, Thread } from "@earthstar-project/rich-threads-layer";
import { formatDistanceToNow } from "date-fns";
import { IdentityLabel, useIdentity, useReplica } from "react-earthstar";
import { renderMarkdown } from "./util/markdown";
import ThreadTitle from "./ThreadTitle";
import MarkdownPreview from "./MarkdownPreview";
import { useWorkspaceAddrFromRouter } from "./WorkspaceLookup";
import { useLetterboxLayer } from "./util/use-letterbox-layer";
import { useIsCacheHeated } from "./util/use-cache-heated";

function ThreadBar({ thread }: { thread: Thread }) {
  const { workspaceLookup, authorPubKey, timestamp } = useParams();

  const letterboxLayer = useLetterboxLayer();

  const lastThreadItem = letterboxLayer.lastThreadItem(thread);

  const mostRecentIsUnread = lastThreadItem
    ? letterboxLayer.isUnread(lastThreadItem)
    : true;

  const lastItemTimestamp = letterboxLayer.getPostTimestamp(lastThreadItem.doc);

  return (
    <div className="flex py-2 px-3 pl-6 bg-white dark:bg-black border-b shadow-sm justify-between sticky top-0 z-50 items-baseline overflow-hidden dark:text-white dark:border-gray-800">
      <div className="flex">
        <Link
          className="md:hidden mr-2 text-blue-500 text-xl"
          to={`/${workspaceLookup}` || "/"}
        >
          ⬅
        </Link>
        <div className={"font-bold text-xl"}>
          <ThreadTitle thread={thread} />
        </div>
      </div>

      {mostRecentIsUnread
        ? (
          <button
            className="p-1.5 bg-blue-800 text-white rounded"
            onClick={() =>
              letterboxLayer.markReadUpTo(
                parseInt(timestamp || ""),
                authorPubKey || "",
                lastItemTimestamp,
              )}
          >
            Mark thread as read
          </button>
        )
        : null}
    </div>
  );
}

function PostDetails({
  post,
  onEdit,
  isEditing,
  onDelete,
}: {
  post: Post;
  onEdit: () => void;
  isEditing: boolean;
  onDelete: () => void;
}) {
  const workspace = useWorkspaceAddrFromRouter();

  const storage = useReplica(workspace);
  const [currentAuthor] = useIdentity();

  const letterboxLayer = useLetterboxLayer(workspace);

  const firstPostedTimestamp = letterboxLayer.getPostTimestamp(post.doc);
  const { authorPubKey, timestamp } = useParams();

  const isUnread = letterboxLayer.isUnread(post);

  const isOwnPost = currentAuthor?.address === post.doc.author;

  const authorDisplayNameDoc = storage.getLatestDocAtPath(
    `/about/~${post.doc.author}/displayName.txt`,
  );

  return (
    <div
      className={"text-gray-500 dark:text-gray-400 flex justify-between items-baseline mb-1 w-full self-stretch overflow-hidden space-x-1 text-sm"}
    >
      {authorDisplayNameDoc
        ? (
          <>
            <span className="font-bold text-gray-800 dark:text-gray-200 truncate flex-shrink min-w-0">
              {authorDisplayNameDoc.content}
            </span>{" "}
            <IdentityLabel className="font-bold" address={post.doc.author} />
          </>
        )
        : (
          <IdentityLabel
            className="text-gray-800 dark:text-gray-200 font-bold"
            address={post.doc.author}
          />
        )}
      <span className="flex-initial whitespace-nowrap">
        {formatDistanceToNow(post.firstPosted, { addSuffix: true })}
      </span>
      {isOwnPost
        ? (
          <button
            className={isEditing ? "text-purple-600" : "text-blue-500"}
            onClick={onEdit}
          >
            {isEditing ? "Cancel edit" : "Edit"}
          </button>
        )
        : null}

      {isOwnPost && post.doc.content.length > 0
        ? (
          <button
            className={"text-red-900 dark:text-red-200"}
            onClick={onDelete}
          >
            Delete
          </button>
        )
        : null}
      <div className="flex-grow pl-5 text-right">
        {currentAuthor
          ? (
            <label>
              <span>Read</span>
              <input
                type="checkbox"
                className="ml-1"
                checked={!isUnread}
                onChange={() => {
                  letterboxLayer.markReadUpTo(
                    parseInt(timestamp || ""),
                    authorPubKey || "",
                    isUnread ? firstPostedTimestamp : firstPostedTimestamp - 1,
                  );
                }}
              />
            </label>
          )
          : null}
      </div>
    </div>
  );
}

function PostEditForm({ post, onEdit }: { post: Post; onEdit: () => void }) {
  const [content, setContent] = React.useState(post.doc.content);

  const letterboxLayer = useLetterboxLayer();

  return (
    <form
      className="flex flex-col mt-3"
      onSubmit={(e) => {
        e.preventDefault();

        const res = letterboxLayer.editPost(post, content);

        if (!isErr(res)) {
          onEdit();
        } else {
          alert("Something went wrong editing this post!");
        }
      }}
    >
      <textarea
        value={content}
        className="border p-2 mb-2 shadow-inner dark:bg-gray-800 dark:text-white dark:border-gray-700"
        onChange={(e) => {
          setContent(e.target.value);
        }}
        rows={10}
      />
      <MarkdownPreview raw={content} />
      <button className="btn mt-1" type="submit">
        Edit post
      </button>
    </form>
  );
}

function ThreadRootView({ root }: { root: Post }) {
  const letterboxLayer = useLetterboxLayer();
  const isUnread = letterboxLayer.isUnread(root);

  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <article
      className={`p-3 py-4 pl-6 sm:py-6 ${isUnread
        ? "bg-white dark:bg-black dark:text-gray-100"
        : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300"
        }`}
    >
      <PostDetails
        isEditing={isEditing}
        onEdit={() => setIsEditing((prev) => !prev)}
        post={root}
        onDelete={() => {
          const shouldDelete = window.confirm(
            "Are you sure you want to delete this post?",
          );

          if (shouldDelete) {
            letterboxLayer.editPost(root, "");
          }
        }}
      />
      {isEditing
        ? <PostEditForm onEdit={() => setIsEditing(false)} post={root} />
        : <PostContent doc={root.doc} />}
    </article>
  );
}

function PostView({ post }: { post: Post }) {
  const letterboxLayer = useLetterboxLayer();
  const isUnread = letterboxLayer.isUnread(post);

  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <article
      className={`p-3 py-4 pl-6 sm:py-6 ${isUnread
        ? "bg-white dark:bg-black dark:text-gray-100"
        : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300"
        }`}
    >
      <PostDetails
        isEditing={isEditing}
        onEdit={() => setIsEditing((prev) => !prev)}
        post={post}
        onDelete={() => {
          letterboxLayer.editPost(post, "");
        }}
      />
      {isEditing
        ? <PostEditForm onEdit={() => setIsEditing(false)} post={post} />
        : <PostContent doc={post.doc} />}
    </article>
  );
}

function PostContent({ doc }: { doc: Doc }) {
  const mdMemo = React.useMemo(() => {
    if (doc.content.length > 0) return renderMarkdown(doc.content);
    return null;
  }, [doc.content]);

  return (
    <div className="text-sm sm:text-base overflow-hidden">
      {mdMemo || (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          The author deleted this message.
        </span>
      )}
    </div>
  );
}

export default function ThreadView() {
  const { authorPubKey, timestamp } = useParams();

  const [currentAuthor] = useIdentity();

  const letterboxLayer = useLetterboxLayer();

  const thread = letterboxLayer.getThread(
    parseInt(timestamp || ""),
    authorPubKey || "",
  );

  const match = useMatch("/:workspace/thread/:pubKey/:timestamp/reply");

  const isHeated = useIsCacheHeated(thread)

  if (!isHeated) {
    return <div className="h-full w-full flex text-gray-500 items-center justify-center bg-gray-50"><div>Loading thread...</div></div>
  }

  if (!thread && isHeated) {
    return <p>No thread found.</p>;
  }

  if (!thread) {
    return null
  }

  return (
    <div className="overflow-auto shadow-lg">
      <ThreadBar thread={thread} />
      <ol>
        <ThreadRootView root={thread.root} key={thread.root.doc.path} />
        <hr className="border-gray-300 dark:border-gray-700" />
        {thread.replies.map((post) => (
          <React.Fragment key={post.doc.path}>
            <PostView post={post} />
            <hr className="border-gray-300 dark:border-gray-700" />
          </React.Fragment>
        ))}
      </ol>
      <footer className="flex gap-2 p-3 lg:px-6 justify-between py-3">
        {!match && currentAuthor
          ? (
            <Link className="link-btn" to={"reply"}>
              Reply
            </Link>
          )
          : null}
      </footer>
      <Outlet />
    </div>
  );
}
