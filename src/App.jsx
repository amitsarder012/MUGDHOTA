import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { listenToMyChats, getUserProfile } from './lib/chatApi'
import Login from './pages/Login'
import ChatList from './components/ChatList'
import ChatWindow from './components/ChatWindow'
import NewChatModal from './components/NewChatModal'

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [userCache, setUserCache] = useState({})

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return
    const unsub = listenToMyChats(user.uid, setChats)
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!user) return
    const allUids = new Set()
    chats.forEach((c) => c.members.forEach((m) => allUids.add(m)))
    allUids.forEach(async (uid) => {
      if (!userCache[uid]) {
        const profile = await getUserProfile(uid)
        if (profile) setUserCache((prev) => ({ ...prev, [uid]: profile }))
      }
    })
  }, [chats, user])

  if (authLoading) {
    return <div className="loading-screen">লোড হচ্ছে...</div>
  }

  if (!user) {
    return <Login onLoggedIn={setUser} />
  }

  const activeChat = chats.find((c) => c.id === activeChatId) || null

  return (
    <div className="app-shell">
      <div className="sidebar">
        <div className="sidebar-header">
          <span>MUGDHOTA</span>
          <div>
            <button className="icon-btn" onClick={() => setShowModal(true)} title="নতুন চ্যাট">
              +
            </button>
            <button className="icon-btn" onClick={() => signOut(auth)} title="লগ আউট">
              ⎋
            </button>
          </div>
        </div>
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          myUid={user.uid}
          userCache={userCache}
        />
      </div>
      <ChatWindow chat={activeChat} myUid={user.uid} userCache={userCache} />

      {showModal && (
        <NewChatModal
          myUid={user.uid}
          onClose={() => setShowModal(false)}
          onChatCreated={(chatId) => {
            setActiveChatId(chatId)
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}
