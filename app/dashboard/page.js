'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth'
import QRTable from '@/components/QRTable'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function loadUserAndQRCodes() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (currentUser) {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('qrcodes')
            .select(`
              *,
              scan_count:scan_logs(count)
            `)
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })

          if (error) throw error

          const qrCodesWithCounts = data.map(qr => ({
            ...qr,
            scan_count: qr.scan_count?.[0]?.count || 0
          }))

          setQrCodes(qrCodesWithCounts)
        }
      } catch (error) {
        console.error('Error loading QR codes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserAndQRCodes()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('qrcodes')
        .delete()
        .eq('id', id)

      if (error) throw error

      setQrCodes(qrCodes.filter(qr => qr.id !== id))
    } catch (error) {
      console.error('Error deleting QR code:', error)
      alert('Failed to delete QR code')
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My QR Codes</h1>
        <Link href="/dashboard/new" className={styles.createBtn}>
          Create New QR Code
        </Link>
      </div>

      {qrCodes.length === 0 ? (
        <div className={styles.empty}>
          <h2>No QR codes yet</h2>
          <p>Create your first QR code to get started!</p>
          <Link href="/dashboard/new" className={styles.createBtn}>
            Create QR Code
          </Link>
        </div>
      ) : (
        <QRTable qrCodes={qrCodes} onDelete={handleDelete} />
      )}
    </div>
  )
}