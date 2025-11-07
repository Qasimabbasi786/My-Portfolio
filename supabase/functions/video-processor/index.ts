import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VideoProcessRequest {
  filePath: string
  projectId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { filePath, projectId }: VideoProcessRequest = await req.json()

    // Download the video file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('projects')
      .download(filePath)

    if (downloadError) {
      throw new Error(`Failed to download video: ${downloadError.message}`)
    }

    // Convert to ArrayBuffer for processing
    const arrayBuffer = await fileData.arrayBuffer()
    const videoBuffer = new Uint8Array(arrayBuffer)

    // For now, we'll create a simple thumbnail placeholder
    // In a real implementation, you would use FFmpeg WASM or similar
    const thumbnailData = await generateThumbnail(videoBuffer)

    // Upload thumbnail back to storage
    const thumbnailPath = `thumbnails/${projectId}-${Date.now()}.jpg`
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('projects')
      .upload(thumbnailPath, thumbnailData, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })

    if (uploadError) {
      throw new Error(`Failed to upload thumbnail: ${uploadError.message}`)
    }

    // Get public URL for thumbnail
    const { data: { publicUrl } } = supabaseClient.storage
      .from('projects')
      .getPublicUrl(thumbnailPath)

    // Update project_images table with thumbnail
    const { error: dbError } = await supabaseClient
      .from('project_images')
      .insert({
        project_id: projectId,
        image_path: thumbnailPath,
        image_url: publicUrl,
        file_type: 'thumbnail',
        is_primary: false
      })

    if (dbError) {
      console.error('Failed to save thumbnail to database:', dbError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        thumbnailUrl: publicUrl,
        thumbnailPath: thumbnailPath
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Video processing error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Placeholder thumbnail generation
// In production, use FFmpeg WASM or similar video processing library
async function generateThumbnail(videoBuffer: Uint8Array): Promise<Uint8Array> {
  // This is a placeholder - in real implementation you would:
  // 1. Use FFmpeg WASM to extract frame from video
  // 2. Convert frame to JPEG
  // 3. Return the thumbnail data
  
  // For now, return a simple 1x1 pixel JPEG as placeholder
  const placeholderJpeg = new Uint8Array([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
    0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
    0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x00, 0xFF, 0xD9
  ])
  
  return placeholderJpeg
}