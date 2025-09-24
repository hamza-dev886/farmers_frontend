import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId }: ConfirmationEmailRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User not found');
    }

    // Generate a confirmation token (in a real app, you'd generate a secure token)
    const confirmationToken = crypto.randomUUID();
    const confirmationUrl = `${Deno.env.get('SITE_URL')}/confirm-email?token=${confirmationToken}`;

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "Farmers Stall <onboarding@resend.dev>",
      to: [profile.email],
      subject: "Please confirm your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Farmers Stall!</h1>
          <p>Hello ${profile.full_name || 'there'},</p>
          <p>Thank you for joining Farmers Stall! Please confirm your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Confirm Email Address
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${confirmationUrl}</p>
          
          <p>If you didn't create an account with Farmers Stall, you can safely ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The Farmers Stall Team
          </p>
        </div>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: "Confirmation email sent successfully",
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to send confirmation email"
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