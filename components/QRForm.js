'use client'

import { useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUser, generateShortCode } from '@/lib/auth'
import styles from './QRForm.module.css'

export default function QRForm({ onSuccess }) {
  const [targetUrl, setTargetUrl] = useState('')
  const [type, setType] = useState('static')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [createdQR, setCreatedQR] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const shortCode = generateShortCode()
      const qrUrl = `${window.location.origin}/r/${shortCode}`

      const { data, error: dbError } = await supabase
        .from('qrcodes')
        .insert({
          user_id: user.id,
          type,
          short_code: shortCode,
          target_url: targetUrl,
        })
        .select()
        .single()

      if (dbError) throw dbError

      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      setQrDataUrl(qrDataUrl)
      setCreatedQR(data)
    } catch (error) {
      console.error('Error creating QR code:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.download = `qr-${createdQR.short_code}.png`
    link.href = qrDataUrl
    link.click()
  }

  const createAnother = () => {
    setTargetUrl('')
    setType('static')
    setQrDataUrl('')
    setCreatedQR(null)
    setError('')
  }

  if (createdQR && qrDataUrl) {
    return (
      <div className={styles.success}>
        <h2>QR Code Created Successfully!</h2>

        <div className={styles.qrDisplay}>
          <img src={qrDataUrl} alt="Generated QR Code" className={styles.qrImage} />

          <div className={styles.qrInfo}>
            <div className={styles.infoItem}>
              <label>Short Code:</label>
              <code>{createdQR.short_code}</code>
            </div>

            <div className={styles.infoItem}>
              <label>Short URL:</label>
              <code>{window.location.origin}/r/{createdQR.short_code}</code>
            </div>

            <div className={styles.infoItem}>
              <label>Target URL:</label>
              <span>{createdQR.target_url}</span>
            </div>

            <div className={styles.infoItem}>
              <label>Type:</label>
              <span className={`${styles.badge} ${styles[createdQR.type]}`}>
                {createdQR.type}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={downloadQR} className={styles.button}>
            Download PNG
          </button>
          <button onClick={createAnother} className={`${styles.button} ${styles.secondary}`}>
            Create Another
          </button>
          <button onClick={onSuccess} className={`${styles.button} ${styles.secondary}`}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="targetUrl">Target URL or Text</label>
          <input
            id="targetUrl"
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com"
            required
            disabled={loading}
          />
          <small>Enter the URL or text you want the QR code to link to</small>
        </div>

        <div className={styles.field}>
          <label htmlFor="type">QR Code Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={loading}
          >
            <option value="static">Static - URL cannot be changed later</option>
            <option value="dynamic">Dynamic - URL can be updated later</option>
          </select>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          disabled={loading || !targetUrl}
          className={styles.button}
        >
          {loading ? 'Creating QR Code...' : 'Generate QR Code'}
        </button>
      </form>
    </div>
  )
}