import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Edge Function for Cloudflare Stream Integration
// Can be deployed using: supabase functions deploy cloudflare-stream
// Secrets needed: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const url = new URL(req.url)

  // 1. Creation Endpoint (POST /create-stream-input)
  if (url.pathname.endsWith('/create-stream-input')) {
    try {
      const { user_id, username } = await req.json()

      const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')
      const apiToken = Deno.env.get('CLOUDFLARE_API_TOKEN')

      // Call Cloudflare API
      const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            meta: { name: username },
            recording: { mode: "automatic" }
        })
      })

      const cfData = await cfRes.json()

      if (!cfData.success) {
          throw new Error('Cloudflare API Error: ' + JSON.stringify(cfData.errors))
      }

      const input = cfData.result;
      const rtmpUrl = `rtmp://live.cloudflare.com/live/`
      const streamKey = input.rtmp.streamKey
      const cfStreamId = input.uid
      const playbackUrl = `https://customer-${accountId?.substring(0, 10)}.cloudflarestream.com/${cfStreamId}/manifest.m3u8` // Approximate format

      // Update Supabase profile
      await supabase.from('profiles').update({
          stream_key: streamKey,
          rtmp_url: rtmpUrl,
          cloudflare_stream_id: cfStreamId,
          cloudflare_playback_url: playbackUrl
      }).eq('id', user_id)

      return new Response(JSON.stringify({ success: true, playbackUrl }), { headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } })

    } catch (err) {
      return new Response(String(err), { status: 500 })
    }
  }

  // 2. Webhook Endpoint to capture stream state events
  if (url.pathname.endsWith('/webhook')) {
      try {
          const bodyText = await req.text()
          const event = JSON.parse(bodyText)

          if (event.event === 'live_input.connected') {
              // Mark profile as live
              await supabase.from('profiles')
                .update({ is_live: true })
                .eq('cloudflare_stream_id', event.uid)
          } else if (event.event === 'live_input.disconnected') {
              // Mark profile as offline
              const { data: profile } = await supabase.from('profiles')
                .update({ is_live: false })
                .eq('cloudflare_stream_id', event.uid)
                .select('id').single()

              // End latest stream
              if (profile) {
                 await supabase.from('streams')
                    .update({ ended_at: new Date().toISOString() })
                    .eq('streamer_id', profile.id)
                    .is('ended_at', null)
              }
          }
          return new Response('OK', { status: 200 })
      } catch (err) {
          return new Response(String(err), { status: 500 })
      }
  }

  return new Response('Not found', { status: 404 })
})
