import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { headers } from 'next/headers'

export default async function RedirectPage({ params }) {
  const { short_code } = params
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

  try {
    const supabase = createClient()

    const { data: qrCode, error } = await supabase
      .from('qrcodes')
      .select('id, target_url')
      .eq('short_code', short_code)
      .single()

    if (error || !qrCode) {
      redirect('/404')
    }

    await supabase
      .from('scan_logs')
      .insert({
        qrcode_id: qrCode.id,
        scanned_at: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      })

    redirect(qrCode.target_url)
  } catch (error) {
    console.error('Redirect error:', error)
    redirect('/404')
  }
}