import { useState } from "react";
import { Link } from "react-router";
import { supabase } from "~/lib/supabase";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Loader2 } from "lucide-react";

export function loader() {
  return {};
}

export function action() {
  return {};
}

export function meta() {
  return [
    { title: "Sign Up - FarmAI" },
    { name: "description", content: "Create your FarmAI account" },
  ];
}

export default function Join() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Use signInWithOtp to send a magic link for email verification
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // This must be enabled in your Supabase project settings.
          shouldCreateUser: true,
          // The URL to which the user will be redirected after clicking the link.
          emailRedirectTo: `${window.location.origin}/auth/confirm-signup`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Success! Please check your email for a confirmation link to complete your registration.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <p className="text-center text-muted-foreground">
            Enter your email to get started.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {success}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !!success}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                "Send Confirmation Link"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 