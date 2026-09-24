import { useState } from 'react'
import { findUserByPhone, getOrCreateDirectChat, createGroupChat } from '../lib/chatApi'

export default function NewChatModal({ myUid, onClose, onChatCreated }) {
  const [mode, setMode] = useState('direct')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [groupName, setGroupName] = useState('')
  const [groupMembers, setGroupMembers] = useState([])
  const [memberPhone, setMemberPhone] = useState('')

  async function handleStartDirect(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await findUserByPhone(phone.trim())
      if (!user) {
        setError('এই নম্বরে কোনো ইউজার পাওয়া যায়নি। তাকে আগে অ্যাপে সাইন আপ করতে বলুন।')
        return
      }
      if (user.id === myUid) {
        setError('নিজের নম্বর দিয়ে চ্যাট শুরু করা যাবে না।')
        return
      }
      const chatId = await getOrCreateDirectChat(myUid, user.id)
      onChatCreated(chatId)
    } catch (err) {
      console.error(err)
      setError('কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddMember() {
    setError('')
    const user = await findUserByPhone(memberPhone.trim())
    if (!user) {
      setError('এই নম্বরে কোনো ইউজার পাওয়া যায়নি।')
      return
    }
    if (user.id === myUid || groupMembers.some((m) => m.uid === user.id)) {
      setError('এই সদস্য ইতিমধ্যে তালিকায় আছেন।')
      return
    }
    setGroupMembers([...groupMembers, { uid: user.id, name: user.name, phone: user.phone }])
    setMemberPhone('')
  }

  async function handleCreateGroup(e) {
    e.preventDefault()
    setError('')
    if (!groupName.trim()) {
      setError('গ্রুপের নাম দিন।')
      return
    }
    if (groupMembers.length < 1) {
      setError('অন্তত একজন সদস্য যোগ করুন।')
      return
    }
    setLoading(true)
    try {
      const chatId = await createGroupChat(
        myUid,
        groupMembers.map((m) => m.uid),
        groupName.trim()
      )
      onChatCreated(chatId)
    } catch (err) {
      console.error(err)
      setError('গ্রুপ তৈরি করতে সমস্যা হয়েছে।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-tabs">
          <button
            className={mode === 'direct' ? 'active' : ''}
            onClick={() => setMode('direct')}
          >
            নতুন চ্যাট
          </button>
          <button
            className={mode === 'group' ? 'active' : ''}
            onClick={() => setMode('group')}
          >
            নতুন গ্রুপ
          </button>
        </div>

        {mode === 'direct' && (
          <form onSubmit={handleStartDirect}>
            <label>যে নম্বরে চ্যাট শুরু করতে চান</label>
            <input
              type="tel"
              placeholder="+8801XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'খোঁজা হচ্ছে...' : 'চ্যাট শুরু করুন'}
            </button>
          </form>
        )}

        {mode === 'group' && (
          <form onSubmit={handleCreateGroup}>
            <label>গ্রুপের নাম</label>
            <input
              type="text"
              placeholder="যেমন: পরিবার"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <label>সদস্যের ফোন নম্বর</label>
            <div className="inline-row">
              <input
                type="tel"
                placeholder="+8801XXXXXXXXX"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
              />
              <button type="button" onClick={handleAddMember}>
                যোগ করুন
              </button>
            </div>
            {groupMembers.length > 0 && (
              <ul className="member-list">
                {groupMembers.map((m) => (
                  <li key={m.uid}>{m.name} ({m.phone})</li>
                ))}
              </ul>
            )}
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'তৈরি হচ্ছে...' : 'গ্রুপ তৈরি করুন'}
            </button>
          </form>
        )}

        <button className="link-btn" onClick={onClose}>
          বন্ধ করুন
        </button>
      </div>
    </div>
  )
}
