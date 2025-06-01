import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ReplyBox from './ReplyBox';

// 👇 Mention parsing logic
const renderWithMentions = (text, mentions) => {
  const parts = [];
  let lastIndex = 0;

  const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, display, id] = match;

    // Check if mention exists in the mentions list by id or userId
    const isMentionValid = mentions.some(mention => mention.userId === id || mention._id === id);

    // Push text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Push styled mention if it's valid
    if (isMentionValid) {
      parts.push(
        <span key={match.index} className="text-blue-400 font-semibold">@{display}</span>
      );
    } else {
      parts.push(`@${display}`); // Plain mention text if not valid
    }

    lastIndex = regex.lastIndex;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

function ReplyCard({ reply, onReply, handleMarkAsAnswer }) {
  const [showReplyBox, setShowReplyBox] = useState(false);

  const handleReply = (replyBody) => {
    setShowReplyBox(false);
    onReply(replyBody);
  };

  const markAsAnswer = (reply) => {
    console.log('marking : ', reply, ' as answer');
    handleMarkAsAnswer(reply);
  }

  return (
    <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-4 text-gray-200 relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-blue-400">@{reply.authorId.userId}</span>
        <div>
          <span className="text-xs text-gray-400 p-2">
            {formatDistanceToNow(new Date(reply.createdAt))} ago
          </span>
          <button title="Mark as answer" onClick={() => markAsAnswer(reply)}>A</button>
        </div>
      </div>

      <p className="whitespace-pre-wrap">
        {renderWithMentions(reply.body, reply.mentions)}
      </p>

      {reply.isAnswer && (
        <div className="text-green-500 text-sm font-medium mt-2">✔ Marked as answer</div>
      )}

      <button
        className="text-sm text-blue-300 hover:underline mt-2"
        onClick={() => setShowReplyBox(!showReplyBox)}
      >
        {showReplyBox ? 'Cancel' : 'Reply'}
      </button>

      {showReplyBox && (
        <ReplyBox onSubmitReply={handleReply} parentReplyId={reply._id} />
      )}
    </div>
  );
}

export default ReplyCard;