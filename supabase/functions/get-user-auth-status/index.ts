import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get all users from auth.users first
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;

    // Get all users from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Combine auth users with profile data
    const usersWithAuthStatus = (authUsers.users || []).map((authUser:any) => {
      const profile = profiles?.find(p => p.user_id === authUser.id);
      
      return {
        id: authUser.id,
        email: authUser.email || profile?.email || 'No email',
        full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'No name',
        role: profile?.role || authUser.user_metadata?.role || 'customer',
        created_at: profile?.created_at || authUser.created_at,
        email_confirmed_at: authUser.email_confirmed_at || null
      };
    });

    console.log(`Fetched auth status for ${usersWithAuthStatus.length} users`);

    return new Response(JSON.stringify({
      success: true,
      data: usersWithAuthStatus
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in get-user-auth-status function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to fetch user auth status"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);