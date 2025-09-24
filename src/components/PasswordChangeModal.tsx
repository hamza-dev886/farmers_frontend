import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const passwordSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

interface PasswordChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordChanged: () => void;
}

export const PasswordChangeModal = ({ open, onOpenChange, onPasswordChanged }: PasswordChangeModalProps) => {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PasswordForm>>({});
  const { toast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = passwordSchema.safeParse(passwordForm);
      if (!result.success) {
        const fieldErrors: Partial<PasswordForm> = {};
        result.error.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof PasswordForm] = error.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      // Update password_expired flag in profiles
      await supabase
        .from('profiles')
        .update({ password_expired: false, temp_password: null })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      toast({
        title: "Password updated successfully",
        description: "Your password has been changed and you can now access all features.",
      });

      onPasswordChanged();
      onOpenChange(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Your Password</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Your temporary password has expired. Please set a new password to continue.
              </p>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  disabled={loading}
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword}</p>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>At least 8 characters long</li>
                    <li>At least one uppercase letter</li>
                    <li>At least one lowercase letter</li>
                    <li>At least one number</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};