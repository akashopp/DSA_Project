import React from 'react';
import ReplyCard from './ReplyCard';

function ReplyManager({ replies, onSubmitReply, handleMarkAsAnswer }) {

  const buildReplyTree = () => {
    const map = {};
    const roots = [];

    replies.forEach(r => {
      r.children = [];
      map[r._id] = r;
    });

    replies.forEach(r => {
      if (r.parentReplyId && map[r.parentReplyId]) {
        map[r.parentReplyId].children.push(r);
      } else {
        roots.push(r);
      }
    });

    return roots;
  };

  const renderReplies = (list, depth = 0) => {
    return list.map(reply => (
      <div key={reply._id} className="relative">
        <div className={`pl-4 border-l-2 border-gray-700 ml-${depth > 0 ? 2 : 0}`}>
          <ReplyCard reply={reply} onReply={onSubmitReply} handleMarkAsAnswer={ handleMarkAsAnswer } />
          {reply.children.length > 0 && (
            <div className="mt-3">
              {renderReplies(reply.children, depth + 1)}
            </div>
          )}
        </div>
      </div>
    ));
  };

  const tree = buildReplyTree();

  return (
    <div className="mt-6 space-y-4">
      {tree.length ? renderReplies(tree) : <p className="text-gray-500 italic">No replies yet.</p>}
    </div>
  );
}

export default ReplyManager;