import Link from 'next/link'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>QR Code Not Found</h1>
        <p>The QR code you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <p>This could happen if:</p>
        <ul>
          <li>The QR code has been deleted</li>
          <li>The short code is incorrect</li>
          <li>This is a static QR code (which doesn&apos;t use redirects)</li>
        </ul>
        <Link href="/" className={styles.homeLink}>
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}