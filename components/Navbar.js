'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import styles from './Navbar.module.css'

export default function Navbar() {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.logo}>
          QRMatic
        </Link>

        <div className={styles.nav}>
          <Link href="/dashboard" className={styles.link}>
            Dashboard
          </Link>
          <Link href="/dashboard/new" className={styles.link}>
            Create QR
          </Link>
          <button onClick={handleSignOut} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}