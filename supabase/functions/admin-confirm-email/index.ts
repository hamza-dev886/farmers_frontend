import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminEmailRequest {
  userId: string;
  action: 'confirm' | 'resend';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, action }: AdminEmailRequest = await req.json();

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    if (action === 'confirm') {
      // Confirm user email using admin API
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true
      });

      if (error) {
        console.error('Error confirming email:', error);
        throw error;
      }

      console.log('Email confirmed successfully for user:', userId);

      return new Response(JSON.stringify({
        success: true,
        message: "Email confirmed successfully",
        data
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });

    } else if (action === 'resend') {
      // Get user information to resend confirmation email
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !user) {
        throw new Error('User not found');
      }

      // For resending, we'll use the send-confirmation-email function instead
      // Call the existing send-confirmation-email function
      const { error: resendError } = await supabase.functions.invoke('send-confirmation-email', {
        body: { userId }
      });

      if (resendError) {
        console.error('Error sending confirmation email:', resendError);
        throw resendError;
      }

      console.log('Confirmation email resent successfully for user:', userId);

      return new Response(JSON.stringify({
        success: true,
        message: "Confirmation email resent successfully"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      throw new Error('Invalid action. Must be "confirm" or "resend"');
    }

  } catch (error: any) {
    console.error("Error in admin-confirm-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to process email action"
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