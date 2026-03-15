import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

const emailSchema = z.string().email("Please enter a valid email address");
// Bug #6: Enforce password strength (min 8 chars)
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export default function Auth() {
  const [activeTab, setActiveTab] = useState("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  // Bug #31: Phone field during registration
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  // Bug #24: Confirm password field
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>({});

  const { user, login } = useAuthContext();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const navigate = useNavigate();
  const location = useLocation();
  // Bug #218: Show message passed via navigation state (e.g. "Please sign in to view your account")
  const locationMessage = (location.state as any)?.message;

  // Bug #28: Preserve intended destination via returnUrl
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || '/';

  // Bug #25: Handle tab changes by clearing shared form fields to prevent state leakage
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setFirstName("");
    setLastName("");
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  useEffect(() => {
    if (user) {
      navigate(returnUrl);
    }
  }, [user, navigate, returnUrl]);

  const validateForm = (isSignUp = false) => {
    const newErrors: typeof errors = {};

    if (isSignUp) {
      if (!firstName.trim()) newErrors.firstName = "First name is required";
      if (!lastName.trim()) newErrors.lastName = "Last name is required";
      if (phone && !/^\+?[\d\s\-()]{7,15}$/.test(phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    // Bug #24: Confirm password validation
    if (isSignUp && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    try {
      const data = await loginMutation.mutateAsync({ email, password });
      login(data);
      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
      });
      // Bug #28: Navigate to returnUrl instead of always "/"
      navigate(returnUrl);
    } catch (error: any) {
      toast.error("Sign in failed", {
        description: error.response?.data?.message || "Invalid email or password. Please try again.",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    try {
      // Bug #31: Send phone field during registration
      const data = await registerMutation.mutateAsync({ firstName, lastName, email, password, phone });
      login(data);
      toast.success("Welcome!", {
        description: "Your account has been successfully created.",
      });
      navigate(returnUrl);
    } catch (error: any) {
      toast.error("Sign up failed", {
        description: error.response?.data?.message || "An error occurred during sign up.",
      });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Home
        </Link>
        <Card>
          <CardHeader className="text-center">
            {/* Bug #49: Consistent URBAN DRAPE branding */}
            <CardTitle className="text-2xl font-bold text-primary">URBAN DRAPE</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
            {/* Bug #218: Show redirect message if present */}
            {locationMessage && (
              <p className="text-sm text-primary font-medium mt-1">{locationMessage}</p>
            )}
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      autoComplete="email"
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      {/* Bug #183: Eye icon correctly toggles input type */}
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        autoComplete="current-password"
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  {/* Bug #295: Privacy/Terms links in auth subtext */}
                  <p className="text-xs text-center text-muted-foreground">
                    By signing in you agree to our{" "}
                    <Link to="/terms" className="underline hover:text-foreground">Terms</Link>
                    {" & "}
                    <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
                  </p>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstName">First Name</Label>
                      <Input
                        id="signup-firstName"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        autoComplete="given-name"
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setErrors((prev) => ({ ...prev, firstName: undefined }));
                        }}
                        disabled={isLoading}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastName">Last Name</Label>
                      <Input
                        id="signup-lastName"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        autoComplete="family-name"
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setErrors((prev) => ({ ...prev, lastName: undefined }));
                        }}
                        disabled={isLoading}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      autoComplete="email"
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  {/* Bug #31: Phone field on registration */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      autoComplete="tel"
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      disabled={isLoading}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        autoComplete="new-password"
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  {/* Bug #24: Confirm Password field */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        autoComplete="new-password"
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  {/* Bug #295: Privacy/Terms links */}
                  <p className="text-xs text-center text-muted-foreground">
                    By registering you agree to our{" "}
                    <Link to="/terms" className="underline hover:text-foreground">Terms</Link>
                    {" & "}
                    <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
