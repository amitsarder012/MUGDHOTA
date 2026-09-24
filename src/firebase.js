import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDx9MFEhrDP9XZpzhZyiDN4gMC4FMFRj4M',
  authDomain: 'my-chat-app-38355.firebaseapp.com',
  projectId: 'my-chat-app-38355',
  storageBucket: 'my-chat-app-38355.firebasestorage.app',
  messagingSenderId: '216265935721',
  appId: '1:216265935721:web:3cdf98602827c9b0d4cbf8',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
