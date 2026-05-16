import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useResendVerification, useVerifyEmail } from "@/hooks/useAuth";
import SEO from "@/components/SEO";

export default function EmailVerificationPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  // Sprint 7 / BUG-F-055: don't read localStorage during render — move to a
  // memoized initializer so React doesn't re-read on every re-render and so
  // the access path is consistent under StrictMode.
  const [email] = useState<string>(() => {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      if (userInfoStr) {
        const u = JSON.parse(userInfoStr);
        if (u?.email) return String(u.email);
      }
    } catch {
      /* ignore */
    }
    return "your email";
  });

  useEffect(() => {
    if (!token) return;
    setVerifying(true);
    verifyEmail.mutate(token, {
      onSuccess: () => {
        setVerified(true);
        setVerifying(false);
        toast.success("Email verified successfully!");
      },
      onError: (err: any) => {
        setVerifying(false);
        toast.error(err?.response?.data?.message || "Verification failed. The link may be invalid or expired.");
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async () => {
    if (!email || email === "your email") {
      toast.error("No email available. Please sign in first.");
      return;
    }
    try {
      await resendVerification.mutateAsync(email);
      toast.success("Verification email resent! Check your inbox.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not resend. Please try again.");
    }
  };

  if (verifying) {
    return (
      <>
        <SEO title="Verify email" description="Verify your Urban Drape email." noindex />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-emerald-100 rounded-full p-6">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Email Verified!</h1>
            <p className="text-muted-foreground">Your account is now active.</p>
          </div>
          <Button onClick={() => navigate("/")} className="w-full">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-full p-6">
            <Mail className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Check Your Inbox</h1>
          <p className="text-muted-foreground">
            We've sent a verification link to:
          </p>
          <p className="font-semibold text-primary text-lg">{email}</p>
        </div>

        <div className="bg-muted/50 rounded-xl p-5 text-sm text-muted-foreground space-y-2 text-left">
          <p>Click the link in the email to verify your account.</p>
          <p>Don't see it? Check your <strong>Spam</strong> or <strong>Promotions</strong> folder.</p>
          <p>The link expires in 24 hours.</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleResend}
            variant="outline"
            disabled={resendVerification.isPending}
            className="w-full gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${resendVerification.isPending ? "animate-spin" : ""}`} />
            {resendVerification.isPending ? "Sending..." : "Resend Verification Email"}
          </Button>

          <Link to="/auth">
            <Button variant="ghost" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Once verified, return here and sign in to access your account.
        </p>
      </div>
    </div>
  );
}
