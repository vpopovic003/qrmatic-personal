'use client'

import { useState, useEffect } from 'react'
import { updateQRCode } from '@/lib/auth'
import styles from './QREditForm.module.css'

export default function QREditForm({ qrCode, onSuccess, onCancel }) {
  const [targetUrl, setTargetUrl] = useState(qrCode?.target_url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (qrCode) {
      setTargetUrl(qrCode.target_url)
    }
  }, [qrCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: updateError } = await updateQRCode(qrCode.id, {
        target_url: targetUrl,
      })

      if (updateError) throw updateError

      onSuccess()
    } catch (error) {
      console.error('Error updating QR code:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!qrCode) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.qrInfo}>
          <h3>Edit Dynamic QR Code</h3>
          <div className={styles.infoItem}>
            <span className={styles.label}>Short Code:</span>
            <code>{qrCode.short_code}</code>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Short URL:</span>
            <code>{window.location.origin}/r/{qrCode.short_code}</code>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Created:</span>
            <span>{new Date(qrCode.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="targetUrl">Target URL</label>
          <input
            id="targetUrl"
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com"
            required
            disabled={loading}
          />
          <small>Update the URL that this QR code redirects to</small>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            type="submit"
            disabled={loading || !targetUrl || targetUrl === qrCode.target_url}
            className={styles.button}
          >
            {loading ? 'Updating...' : 'Update QR Code'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`${styles.button} ${styles.secondary}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}