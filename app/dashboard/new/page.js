'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QRForm from '@/components/QRForm'
import styles from './new.module.css'

export default function NewQRPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Create New QR Code</h1>
        <p>Generate a QR code for your URL or text content</p>
      </div>

      <QRForm onSuccess={handleSuccess} />
    </div>
  )
}