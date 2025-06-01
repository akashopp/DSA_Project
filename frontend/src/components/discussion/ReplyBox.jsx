import { useRef, useState } from 'react';
import { MentionsInput, Mention } from 'react-mentions';

const mentionStyles = {
  control: {
    backgroundColor: '#1e293b',
    fontSize: 14,
    color: 'white',
    padding: 0,
    borderRadius: '0.5rem',
    border: '1px solid #334155',
    minHeight: 100,
  },
  highlighter: {
    padding: 12,
    overflow: 'hidden',
  },
  input: {
    padding: 12,
    margin: 0,
    color: 'white',
    minHeight: 100,
    outline: 'none',
  },
  suggestions: {
    list: {
      backgroundColor: '#1f2937',
      border: '1px solid #4b5563',
      borderRadius: 8,
      maxHeight: 200,
      overflowY: 'auto',
      zIndex: 50,
    },
    item: {
      padding: '8px 12px',
      color: 'white',
      cursor: 'pointer',
    },
    itemFocused: {
      backgroundColor: '#2563eb',
    },
  },
};

const mentionMarkup = "@[__display__](__id__)";

function ReplyBox({ onSubmitReply, parentReplyId }) {
  const [replyText, setReplyText] = useState('');
  const [mentions, setMentions] = useState([]);
  const debounceTimerRef = useRef(null);

  const debouncedFetchSuggestions = (query, callback) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/discuss/mention-suggestions?query=${query}`);
        const data = await res.json();
        const formatted = data.map((user) => ({
          id: user._id,
          display: user.userId,
        }));
        callback(formatted);
      } catch (err) {
        console.error(err);
        callback([]);
      }
    }, 300);
  };

  const extractMentionIds = (text) => {
    const mentionRegex = /@\[[^\]]+\]\(([^)]+)\)/g;
    const ids = new Set();
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      ids.add(match[1]); // match[1] contains the ID
    }
    return Array.from(ids);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setReplyText(value);
    const currentMentions = extractMentionIds(value);
    setMentions(currentMentions);
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onSubmitReply({
      parentReplyId: parentReplyId ?? null,
      body: replyText,
      mentions: mentions, // send along if needed
    });
    setReplyText('');
    setMentions([]);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl relative">
      <MentionsInput
        value={replyText}
        onChange={handleChange}
        placeholder="Write your reply..."
        className="w-full"
        style={mentionStyles}
        markup={mentionMarkup}
      >
        <Mention
          trigger="@"
          data={debouncedFetchSuggestions}
          displayTransform={(id, display) => `@${display}`}
          appendSpaceOnAdd={true}
        />
      </MentionsInput>
      <button
        onClick={handleReplySubmit}
        className="mt-4 bg-blue-600 text-gray-200 px-6 py-2 rounded-lg hover:text-white hover:bg-blue-700 active:scale-95 transition-all"
      >
        Reply
      </button>
    </div>
  );
}

export default ReplyBox;