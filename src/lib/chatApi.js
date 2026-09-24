import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

export async function saveUserProfile(uid, { phone, name }) {
  await setDoc(
    doc(db, 'users', uid),
    { phone, name: name || phone, createdAt: serverTimestamp() },
    { merge: true }
  )
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function findUserByPhone(phone) {
  const q = query(collection(db, 'users'), where('phone', '==', phone))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export function listenToMyChats(uid, callback) {
  const q = query(
    collection(db, 'chats'),
    where('members', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function getOrCreateDirectChat(myUid, otherUid) {
  const q = query(
    collection(db, 'chats'),
    where('type', '==', 'direct'),
    where('members', 'array-contains', myUid)
  )
  const snap = await getDocs(q)
  const existing = snap.docs.find((d) => d.data().members.includes(otherUid))
  if (existing) return existing.id

  const ref = await addDoc(collection(db, 'chats'), {
    type: 'direct',
    members: [myUid, otherUid],
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function createGroupChat(myUid, memberUids, groupName) {
  const ref = await addDoc(collection(db, 'chats'), {
    type: 'group',
    name: groupName,
    members: [myUid, ...memberUids],
    admin: myUid,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export function listenToMessages(chatId, callback) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function sendMessage(chatId, senderId, text) {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  })
}
