import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const developerId = formData.get('developerId') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, message: 'No file provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!developerId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Developer ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid file type. Only JPG, PNG, and WebP files are allowed.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'File size exceeds 5MB limit.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: developer, error: fetchError } = await supabase
      .from('developers')
      .select('id, profile_picture')
      .eq('id', developerId)
      .maybeSingle();

    if (fetchError || !developer) {
      return new Response(
        JSON.stringify({ success: false, message: 'Developer not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `developer-${developerId}.${fileExt}`;

    if (developer.profile_picture) {
      const urlParts = developer.profile_picture.split('/');
      const oldFileName = urlParts[urlParts.length - 1];

      if (oldFileName && oldFileName.startsWith('developer-')) {
        await supabase.storage
          .from('developer_profiles')
          .remove([oldFileName]);
      }
    }

    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from('developer_profiles')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ success: false, message: `Upload failed: ${uploadError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('developer_profiles')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('developers')
      .update({
        profile_picture: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', developerId);

    if (updateError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Failed to update developer profile: ${updateError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        message: 'Profile picture uploaded successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during upload',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
