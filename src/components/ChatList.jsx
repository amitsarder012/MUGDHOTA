export default function ChatList({ chats, activeChatId, onSelect, myUid, userCache }) {
  function chatLabel(chat) {
    if (chat.type === 'group') return chat.name || 'গ্রুপ'
    const otherUid = chat.members.find((m) => m !== myUid)
    return userCache[otherUid]?.name || 'ইউজার'
  }

  if (chats.length === 0) {
    return <div className="empty-list">এখনো কোনো চ্যাট নেই। উপরের + বাটনে চাপ দিয়ে শুরু করুন।</div>
  }

  return (
    <ul className="chat-list">
      {chats.map((chat) => (
        <li
          key={chat.id}
          className={chat.id === activeChatId ? 'active' : ''}
          onClick={() => onSelect(chat.id)}
        >
          <div className="avatar">{chatLabel(chat).charAt(0)}</div>
          <div className="chat-list-info">
            <div className="chat-list-name">{chatLabel(chat)}</div>
            <div className="chat-list-last">{chat.lastMessage || 'কোনো মেসেজ নেই'}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}
