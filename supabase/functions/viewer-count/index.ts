import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Edge Function for Viewer Count tracking
// Can be deployed using: supabase functions deploy viewer-count
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to bypass RLS for incrementing

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, username } = await req.json()

    if (!username || !['join', 'leave'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 })
    }

    // Step 1: get current profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, viewer_count')
      .eq('username', username)
      .single()
    
    if (error || !profile) {
       return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 })
    }

    let newCount = profile.viewer_count;

    if (action === 'join') {
        newCount += 1;
    } else if (action === 'leave') {
        newCount = Math.max(0, newCount - 1);
    }

    // Step 2: Update count
    await supabase.from('profiles').update({ viewer_count: newCount }).eq('id', profile.id)

    return new Response(
      JSON.stringify({ success: true, count: newCount }),
      { headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } },
    )
  } catch (err) {
    return new Response(String(err), { status: 500 })
  }
})
