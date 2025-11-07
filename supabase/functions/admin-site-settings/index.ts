import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Admin-Token',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const adminToken = req.headers.get('X-Admin-Token');
    if (!adminToken) {
      return new Response(
        JSON.stringify({ success: false, message: 'Admin token required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let adminId: string;
    try {
      const decoded = JSON.parse(atob(adminToken));
      adminId = decoded.id;
      
      if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
        return new Response(
          JSON.stringify({ success: false, message: 'Admin token expired' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid admin token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('id', adminId)
      .maybeSingle();

    if (adminError || !admin) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    if (action === 'update') {
      const body = await req.json();
      const updates = Object.entries(body).map(([key, value]) => ({
        key,
        value: JSON.stringify(value)
      }));

      const { error: updateError } = await supabaseAdmin
        .from('site_settings')
        .upsert(updates, { onConflict: 'key' });

      if (updateError) {
        console.error('Update error:', updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Failed to update settings: ${updateError.message}` 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      await supabaseAdmin
        .from('audit_logs')
        .insert({
          action: 'UPDATE_SITE_SETTINGS',
          table_name: 'site_settings',
          admin_id: adminId,
          new_values: body
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Settings updated successfully'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'reset') {
      const defaultSettings = [
        { key: 'site_title', value: JSON.stringify('Muhammad Qasim & Azmat Mustafa - Web Developers') },
        { key: 'site_description', value: JSON.stringify('Professional web development services by Muhammad Qasim and Azmat Mustafa') },
        { key: 'hero_title', value: JSON.stringify('Hi, We are Muhammad Qasim & Azmat Mustafa') },
        { key: 'hero_subtitle', value: JSON.stringify('Crafting exceptional digital experiences with cutting-edge technology and innovative design solutions for clients worldwide.') },
        { key: 'contact_email', value: JSON.stringify('qasim.tanveer81755@gmail.com') },
        { key: 'contact_phone', value: JSON.stringify('+92 3440052943') },
        { key: 'contact_address', value: JSON.stringify('Available Worldwide') },
        { key: 'logo_url', value: JSON.stringify('/Globex Logo 2 Transparent (200 x 60 px) (Logo) copy.png') },
        { key: 'theme_primary_color', value: JSON.stringify('#3B82F6') },
        { key: 'theme_secondary_color', value: JSON.stringify('#8B5CF6') },
        { key: 'default_theme', value: JSON.stringify('dark') },
        { key: 'github_link', value: JSON.stringify('https://github.com/Qasimabbasi786') },
        { key: 'linkedin_link', value: JSON.stringify('https://www.linkedin.com/in/muhammad-qasim-418372347/') },
        { key: 'facebook_link', value: JSON.stringify('') },
        { key: 'instagram_link', value: JSON.stringify('') },
        { key: 'twitter_link', value: JSON.stringify('') },
        { key: 'youtube_link', value: JSON.stringify('') },
        { key: 'tagline', value: JSON.stringify('We Build Digital Experiences') },
        { key: 'about_text', value: JSON.stringify('Two passionate developers creating modern, scalable web solutions') },
        { key: 'footer_text', value: JSON.stringify('Built with React, TypeScript, and Tailwind CSS') }
      ];

      const { error: resetError } = await supabaseAdmin
        .from('site_settings')
        .upsert(defaultSettings, { onConflict: 'key' });

      if (resetError) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Failed to reset settings: ${resetError.message}` 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      await supabaseAdmin
        .from('audit_logs')
        .insert({
          action: 'RESET_SITE_SETTINGS',
          table_name: 'site_settings',
          admin_id: adminId,
          new_values: { reset_to_defaults: true }
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Settings reset successfully'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'An unexpected error occurred',
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});