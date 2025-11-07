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
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

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
    
    if (req.method === 'POST' && action === 'create') {
      const body = await req.json();
      const { name, email, password, github_link, linkedin, title, skills, profile_picture, bio } = body;

      if (!name || !email || !password) {
        return new Response(
          JSON.stringify({ success: false, message: 'Name, email, and password are required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: existingDeveloper } = await supabaseAdmin
        .from('developers')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (existingDeveloper) {
        return new Response(
          JSON.stringify({ success: false, message: 'A developer with this email already exists' }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data, error } = await supabaseAdmin
        .from('developers')
        .insert({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: password,
          github_link: github_link?.trim(),
          linkedin: linkedin?.trim(),
          title: title?.trim(),
          skills: skills || [],
          profile_picture: profile_picture?.trim(),
          bio: bio?.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error('Create developer error:', error);
        return new Response(
          JSON.stringify({ success: false, message: error.message || 'Failed to create developer' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data, message: 'Developer created successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'PUT' && action === 'update') {
      const body = await req.json();
      const { id, ...updateData } = body;

      if (!id) {
        return new Response(
          JSON.stringify({ success: false, message: 'Developer ID is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const cleanUpdateData: any = {};
      if (updateData.name !== undefined) cleanUpdateData.name = updateData.name.trim();
      if (updateData.email !== undefined) cleanUpdateData.email = updateData.email?.toLowerCase().trim();
      if (updateData.password !== undefined && updateData.password.trim()) {
        cleanUpdateData.password = updateData.password.trim();
      }
      if (updateData.github_link !== undefined) cleanUpdateData.github_link = updateData.github_link?.trim();
      if (updateData.linkedin !== undefined) cleanUpdateData.linkedin = updateData.linkedin?.trim();
      if (updateData.title !== undefined) cleanUpdateData.title = updateData.title?.trim();
      if (updateData.skills !== undefined) cleanUpdateData.skills = updateData.skills;
      if (updateData.profile_picture !== undefined) cleanUpdateData.profile_picture = updateData.profile_picture?.trim();
      if (updateData.bio !== undefined) cleanUpdateData.bio = updateData.bio?.trim();

      const { data, error } = await supabaseAdmin
        .from('developers')
        .update(cleanUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update developer error:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to update developer' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data, message: 'Developer updated successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'DELETE' && action === 'delete') {
      const body = await req.json();
      const { id } = body;

      if (!id) {
        return new Response(
          JSON.stringify({ success: false, message: 'Developer ID is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { error } = await supabaseAdmin
        .from('developers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete developer error:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to delete developer' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Developer deleted successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action or method' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});