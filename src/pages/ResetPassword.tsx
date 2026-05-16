import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useForgotPassword, useResetPassword } from "@/hooks/useAuth";
import SEO from "@/components/SEO";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || searchParams.get("oobCode") || "";

  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();

  // Forgot-password mode state
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Reset-password mode state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Reset state when token presence changes
    setEmailSent(false);
  }, [token]);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      await forgotPassword.mutateAsync(email);
      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send reset email.");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    // Sprint 7 / BUG-F-056: match the customer signup policy (≥8) and the
    // backend validation (also ≥8). Was 6 here, which gave a false-pass that
    // then 400'd from the backend.
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    try {
      await resetPassword.mutateAsync({ token, newPassword });
      toast.success("Password reset successfully! You can now sign in.");
      navigate("/auth?login=true");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password. The link may have expired.");
    }
  };

  // ─── Forgot Password mode (no token) ───────────────────────────
  if (!token) {
    if (emailSent) {
      return (
        <>
        <SEO title="Reset password" description="Reset your Urban Drape password." noindex />
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-emerald-100 rounded-full p-6">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Check Your Inbox</h1>
              <p className="text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Don't see it? Check your spam folder.
              </p>
            </div>
            <Link to="/auth">
              <Button variant="outline" className="w-full">Back to Sign In</Button>
            </Link>
          </div>
        </div>
        </>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-primary/10 rounded-full p-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
              <CardDescription>Enter your email and we'll send you a reset link.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={forgotPassword.isPending}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
                  {forgotPassword.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                  ) : "Send Reset Link"}
                </Button>
                <Link to="/auth" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                  Back to Sign In
                </Link>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Reset Password mode (with token) ───────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-primary/10 rounded-full p-4">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
            <CardDescription>Enter and confirm your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                {/* Bug #89: align placeholder copy with label */}
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password (min. 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={resetPassword.isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={resetPassword.isPending}
                />
              </div>

              <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
                {resetPassword.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</>
                ) : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
