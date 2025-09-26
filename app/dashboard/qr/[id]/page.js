'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { getCurrentUser } from '@/lib/auth'
import AnalyticsChart from '@/components/AnalyticsChart'
import styles from './analytics.module.css'

export default function QRAnalyticsPage() {
  const params = useParams()
  const [qrCode, setQrCode] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadQRAnalytics() {
      try {
        const user = await getCurrentUser()
        if (!user) throw new Error('User not authenticated')

        const supabase = createClient()
        const { data: qrData, error: qrError } = await supabase
          .from('qrcodes')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single()

        if (qrError) throw qrError
        setQrCode(qrData)

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: scanLogs, error: logsError } = await supabase
          .from('scan_logs')
          .select('*')
          .eq('qrcode_id', params.id)
          .gte('scanned_at', thirtyDaysAgo.toISOString())
          .order('scanned_at', { ascending: true })

        if (logsError) throw logsError

        const totalScans = scanLogs.length
        const scansPerDay = processScansPerDay(scanLogs)
        const deviceBreakdown = processDeviceBreakdown(scanLogs)

        setAnalytics({
          totalScans,
          scansPerDay,
          deviceBreakdown,
          recentScans: scanLogs.slice(-10).reverse()
        })

      } catch (error) {
        console.error('Error loading analytics:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadQRAnalytics()
    }
  }, [params.id])

  const processScansPerDay = (scanLogs) => {
    const scansMap = {}

    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      scansMap[dateStr] = 0
    }

    scanLogs.forEach(log => {
      const dateStr = log.scanned_at.split('T')[0]
      if (scansMap.hasOwnProperty(dateStr)) {
        scansMap[dateStr]++
      }
    })

    return Object.entries(scansMap).map(([date, count]) => ({
      date,
      count
    }))
  }

  const processDeviceBreakdown = (scanLogs) => {
    const devices = { Mobile: 0, Desktop: 0, Tablet: 0, Other: 0 }

    scanLogs.forEach(log => {
      const ua = log.user_agent.toLowerCase()
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        devices.Mobile++
      } else if (ua.includes('tablet') || ua.includes('ipad')) {
        devices.Tablet++
      } else if (ua.includes('windows') || ua.includes('mac') || ua.includes('linux')) {
        devices.Desktop++
      } else {
        devices.Other++
      }
    })

    return Object.entries(devices)
      .map(([device, count]) => ({ device, count }))
      .filter(item => item.count > 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    )
  }

  if (!qrCode) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>QR Code not found</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>QR Code Analytics</h1>
        <div className={styles.qrInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Short Code:</span>
            <code>{qrCode.short_code}</code>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>QR Code URL:</span>
            <code>
              {qrCode.type === 'static'
                ? qrCode.target_url
                : `${window.location.origin}/r/${qrCode.short_code}`
              }
            </code>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Target URL:</span>
            <a href={qrCode.target_url} target="_blank" rel="noopener noreferrer">
              {qrCode.target_url}
            </a>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Type:</span>
            <span className={`${styles.badge} ${styles[qrCode.type]}`}>
              {qrCode.type}
            </span>
          </div>
        </div>
      </div>

      {qrCode.type === 'static' && analytics.totalScans === 0 && (
        <div className={styles.staticInfo}>
          <h3>📱 Static QR Code</h3>
          <p>
            This QR code points directly to <strong>{qrCode.target_url}</strong> and doesn't track scans.
            Only dynamic QR codes (which redirect through our system) can provide detailed analytics.
          </p>
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Scans</h3>
          <div className={styles.statValue}>{analytics.totalScans}</div>
          {qrCode.type === 'static' && (
            <small>Only tracked if scanned before switching to direct linking</small>
          )}
        </div>
        <div className={styles.statCard}>
          <h3>Last 7 Days</h3>
          <div className={styles.statValue}>
            {analytics.scansPerDay.slice(-7).reduce((sum, day) => sum + day.count, 0)}
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>Today</h3>
          <div className={styles.statValue}>
            {analytics.scansPerDay[analytics.scansPerDay.length - 1]?.count || 0}
          </div>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chartCard}>
          <h3>Scans per Day (Last 30 Days)</h3>
          <AnalyticsChart data={analytics.scansPerDay} type="line" />
        </div>

        {analytics.deviceBreakdown.length > 0 && (
          <div className={styles.chartCard}>
            <h3>Device Breakdown</h3>
            <AnalyticsChart data={analytics.deviceBreakdown} type="doughnut" />
          </div>
        )}
      </div>

      {analytics.recentScans.length > 0 && (
        <div className={styles.recentScans}>
          <h3>Recent Scans</h3>
          <div className={styles.scansList}>
            {analytics.recentScans.map((scan, index) => (
              <div key={index} className={styles.scanItem}>
                <span className={styles.scanTime}>
                  {formatDate(scan.scanned_at)}
                </span>
                <span className={styles.scanInfo}>
                  IP: {scan.ip_address}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}