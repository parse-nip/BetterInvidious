import { useState, useEffect } from 'react';
import { api, getAuthorThumbnail } from '../lib/api';
import type { Comment, CommentsJsonResponse } from '../lib/api';

const SvgSort = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
    <path d="M21 6H3V5h18v1zm0 5H3v1h18v-1zm0 6H3v1h18v-1z" />
  </svg>
);
const SvgMore = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z" />
  </svg>
);
const SvgThumbsUp = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.5]">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);
const SvgThumbsDown = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.5] scale-x-[-1] rotate-180">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);
const SvgReplies = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="m7 10 5 5 5-5z" />
  </svg>
);

function CommentItem({
  comment,
  hasReplies,
  onLoadReplies,
}: {
  comment: Comment;
  hasReplies: boolean;
  onLoadReplies?: () => void;
}) {
  const avatarUrl = getAuthorThumbnail(comment as { authorThumbnails?: { url: string; width: number; height: number }[] });

  return (
    <div className="relative">
      {hasReplies && (
        <div
          className="absolute left-5 top-11 bottom-[-20px] w-0.5 bg-gray-200 -z-10"
          aria-hidden
        />
      )}
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-slate-200">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-slate-300 flex items-center justify-center text-gray-500 text-xs font-medium">
              {comment.author?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-medium">{comment.author?.startsWith('@') ? comment.author : `@${comment.author}`}</span>
              <span className="text-[12px] text-gray-500">{comment.publishedText ?? ''}</span>
            </div>
            <button
              type="button"
              className="p-1 hover:bg-gray-100 rounded-full shrink-0"
              aria-label="More options"
            >
              <SvgMore />
            </button>
          </div>
          <div
            className="text-[14px] mt-0.5 mb-1 leading-snug [&_a]:text-blue-600 [&_a:hover]:underline"
            dangerouslySetInnerHTML={{ __html: comment.contentHtml || '' }}
          />
          <div className="flex items-center gap-1 ml-[-8px]">
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 py-2 rounded-[18px] hover:bg-gray-100 transition-colors text-[12px]"
            >
              <SvgThumbsUp />
              <span className="text-gray-600">{comment.likeCount ?? 0}</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 py-2 rounded-[18px] hover:bg-gray-100 transition-colors"
            >
              <SvgThumbsDown />
            </button>
            <button
              type="button"
              className="px-3 py-2 text-[12px] font-medium rounded-full hover:bg-gray-100"
            >
              Reply
            </button>
          </div>
          {comment.replies && comment.replies.replyCount > 0 && (
            <button
              type="button"
              onClick={onLoadReplies}
              className="flex items-center gap-2 mt-1 px-3 py-2 text-[14px] font-medium text-blue-600 hover:bg-blue-50 rounded-[18px] transition-colors"
            >
              <SvgReplies />
              {comment.replies.replyCount} {comment.replies.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface CommentsSectionProps {
  videoId: string;
}

export function CommentsSection({ videoId }: CommentsSectionProps) {
  const [data, setData] = useState<CommentsJsonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadComments = (continuation?: string) => {
    const isMore = !!continuation;
    if (isMore) setLoadingMore(true);
    else setLoading(true);

    api
      .getCommentsJson(videoId, { continuation })
      .then((res) => {
        setData((prev) => {
          if (!prev) return res;
          if (!isMore) return res;
          return {
            ...prev,
            comments: [...prev.comments, ...res.comments],
            continuation: res.continuation,
          };
        });
      })
      .catch(() => setData({ comments: [], commentCount: 0 }))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    if (!videoId) return;
    setData(null);
    loadComments();
  }, [videoId]);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">Loading comments...</div>
    );
  }

  const comments = data?.comments ?? [];
  const commentCount = data?.commentCount ?? 0;
  const hasMore = !!data?.continuation;

  return (
    <div className="max-w-[850px]">
      <div className="flex items-center gap-8 mb-6">
        <h2 className="text-xl font-bold">
          {commentCount > 0 ? `${commentCount.toLocaleString()} Comments` : 'Comments'}
        </h2>
        <button
          type="button"
          className="flex items-center gap-2 font-medium text-sm text-gray-600 hover:text-gray-900"
        >
          <SvgSort />
          Sort by
        </button>
      </div>

      <div className="flex gap-4 mb-10">
        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-slate-200 overflow-hidden" />
        <div className="flex-1">
          <input
            type="text"
            placeholder="Add a comment..."
            className="w-full border-b border-gray-200 bg-transparent outline-none pb-2 focus:border-black transition-colors placeholder:text-gray-500 placeholder:text-sm"
          />
        </div>
      </div>

      <div className="space-y-8">
        {comments.map((c) => (
          <CommentItem
            key={c.commentId}
            comment={c}
            hasReplies={!!(c.replies && c.replies.replyCount > 0)}
            onLoadReplies={() => {
              /* TODO: load replies when API supports it */
            }}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => loadComments(data?.continuation)}
            disabled={loadingMore}
            className="text-blue-600 font-medium hover:underline disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {comments.length === 0 && !loading && (
        <p className="text-gray-500 py-4">No comments available.</p>
      )}
    </div>
  );
}
