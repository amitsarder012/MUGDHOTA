import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../firebase'
import { saveUserProfile } from '../lib/chatApi'

export default function Login({ onLoggedIn }) {
  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await saveUserProfile(cred.user.uid, { phone, name })
      onLoggedIn(cred.user)
    } catch (err) {
      console.error(err)
      setError('সাইন আপ করতে সমস্যা হয়েছে: ' + (err.code || err.message))
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      onLoggedIn(cred.user)
    } catch (err) {
      console.error(err)
      setError('লগইন করতে সমস্যা হয়েছে: ' + (err.code || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>MUGDHOTA</h1>
        <p className="muted">
          {mode === 'signup' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}
        </p>

        <form onSubmit={mode === 'signup' ? handleSignup : handleLogin}>
          {mode === 'signup' && (
            <>
              <label>আপনার নাম</label>
              <input
                type="text"
                placeholder="যেমন: রাহুল আহমেদ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label>ফোন নম্বর (দেশের কোড সহ)</label>
              <input
                type="tel"
                placeholder="+8801XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </>
          )}

          <label>ইমেইল</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>পাসওয়ার্ড</label>
          <input
            type="password"
            placeholder="কমপক্ষে ৬ সংখ্যা/অক্ষর"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? 'অপেক্ষা করুন...'
              : mode === 'signup'
              ? 'সাইন আপ করুন'
              : 'লগইন করুন'}
          </button>
        </form>

        <button
          type="button"
          className="link-btn"
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        >
          {mode === 'signup'
            ? 'আগে থেকে অ্যাকাউন্ট আছে? লগইন করুন'
            : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
        </button>
      </div>
    </div>
  )
}
