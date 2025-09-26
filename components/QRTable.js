'use client'

import Link from 'next/link'
import QRCode from 'qrcode'
import styles from './QRTable.module.css'

export default function QRTable({ qrCodes, onDelete }) {
  const downloadQR = async (shortCode, targetUrl, type) => {
    try {
      // For static QR codes, use the target URL directly
      // For dynamic QR codes, use the redirect URL
      const qrUrl = type === 'static'
        ? targetUrl
        : `${window.location.origin}/r/${shortCode}`

      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 256,
        margin: 2,
      })

      const link = document.createElement('a')
      link.download = `qr-${shortCode}.png`
      link.href = qrDataUrl
      link.click()
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Short Code</th>
            <th>Target URL</th>
            <th>Type</th>
            <th>Scans</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {qrCodes.map((qr) => (
            <tr key={qr.id}>
              <td>
                <code className={styles.shortCode}>{qr.short_code}</code>
              </td>
              <td>
                <div className={styles.urlContainer}>
                  <a
                    href={qr.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.url}
                  >
                    {qr.target_url.length > 50
                      ? `${qr.target_url.substring(0, 50)}...`
                      : qr.target_url
                    }
                  </a>
                  {qr.type === 'static' && (
                    <span className={styles.directIcon} title="QR code points directly to this URL">
                      🔗
                    </span>
                  )}
                </div>
              </td>
              <td>
                <span className={`${styles.badge} ${styles[qr.type]}`}>
                  {qr.type}
                </span>
              </td>
              <td>{qr.scan_count}</td>
              <td>{formatDate(qr.created_at)}</td>
              <td>
                <div className={styles.actions}>
                  <Link
                    href={`/dashboard/qr/${qr.id}`}
                    className={styles.actionBtn}
                  >
                    View
                  </Link>
                  {qr.type === 'dynamic' && (
                    <Link
                      href={`/dashboard/edit/${qr.id}`}
                      className={styles.actionBtn}
                    >
                      Edit
                    </Link>
                  )}
                  <button
                    onClick={() => downloadQR(qr.short_code, qr.target_url, qr.type)}
                    className={styles.actionBtn}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => onDelete(qr.id)}
                    className={`${styles.actionBtn} ${styles.delete}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}