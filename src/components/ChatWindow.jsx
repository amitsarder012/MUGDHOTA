import { useEffect, useRef, useState } from 'react'
import { listenToMessages, sendMessage } from '../lib/chatApi'

export default function ChatWindow({ chat, myUid, userCache }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!chat) return
    const unsub = listenToMessages(chat.id, setMessages)
    return () => unsub()
  }, [chat?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim()) return
    await sendMessage(chat.id, myUid, text.trim())
    setText('')
  }

  if (!chat) {
    return <div className="chat-window empty">একটি চ্যাট বেছে নিন</div>
  }

  const title =
    chat.type === 'group'
      ? chat.name
      : userCache[chat.members.find((m) => m !== myUid)]?.name || 'ইউজার'

  return (
    <div className="chat-window">
      <div className="chat-header">{title}</div>
      <div className="messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={'bubble ' + (m.senderId === myUid ? 'mine' : 'theirs')}
          >
            {chat.type === 'group' && m.senderId !== myUid && (
              <div className="sender-name">{userCache[m.senderId]?.name || ''}</div>
            )}
            <div>{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="message-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="মেসেজ লিখুন..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">পাঠান</button>
      </form>
    </div>
  )
}
