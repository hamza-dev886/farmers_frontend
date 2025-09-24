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

    // Get all users from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Get auth status for each user
    const usersWithAuthStatus = await Promise.all(
      (profiles || []).map(async (profile) => {
        try {
          const { data: authUser, error } = await supabase.auth.admin.getUserById(profile.id);
          
          return {
            ...profile,
            email_confirmed_at: error ? null : authUser?.user?.email_confirmed_at || null
          };
        } catch (error) {
          console.error(`Error fetching auth status for user ${profile.id}:`, error);
          return {
            ...profile,
            email_confirmed_at: null
          };
        }
      })
    );

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