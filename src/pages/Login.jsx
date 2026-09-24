import { useState } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../firebase'
import { saveUserProfile } from '../lib/chatApi'

export default function Login({ onLoggedIn }) {
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function setupRecaptcha() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      })
    }
    return window.recaptchaVerifier
  }

  async function handleSendOtp(e) {
    e.preventDefault()
    setError('')
    if (!/^\+\d{8,15}$/.test(phone)) {
      setError('ফোন নম্বর অবশ্যই দেশের কোড সহ দিন, যেমন +8801XXXXXXXXX')
      return
    }
    setLoading(true)
    try {
      const verifier = setupRecaptcha()
      const result = await signInWithPhoneNumber(auth, phone, verifier)
      setConfirmation(result)
      setStep('otp')
    } catch (err) {
      console.error(err)
      setError('ERR: ' + (err.code || err.message || 'unknown'))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await confirmation.confirm(otp)
      await saveUserProfile(cred.user.uid, { phone, name })
      onLoggedIn(cred.user)
    } catch (err) {
      console.error(err)
      setError('OTP সঠিক নয়। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>MUGDHOTA</h1>
        <p className="muted">ফোন নম্বর দিয়ে সাইন ইন করুন</p>

        {step === 'phone' && (
          <form onSubmit={handleSendOtp}>
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
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'পাঠানো হচ্ছে...' : 'OTP পাঠান'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <label>৬ সংখ্যার OTP কোড দিন</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'যাচাই করা হচ্ছে...' : 'যাচাই করুন'}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => setStep('phone')}
            >
              নম্বর পরিবর্তন করুন
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
