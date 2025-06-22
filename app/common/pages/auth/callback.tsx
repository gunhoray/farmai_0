import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
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
    { title: "Authenticating - FarmAI" },
    { name: "description", content: "Completing authentication" },
  ];
}

export default function AuthCallback() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError("Authentication failed. Please try again.");
          setTimeout(() => {
            navigate("/auth/login");
          }, 3000);
        } else if (data.session) {
          // Successfully authenticated, redirect to farms page
          navigate("/farms/myfarms");
        } else {
          // No session found, redirect to login
          navigate("/auth/login");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        setTimeout(() => {
          navigate("/auth/login");
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Authenticating...</CardTitle>
          <p className="text-center text-muted-foreground">
            Please wait while we complete your sign-in
          </p>
        </CardHeader>
        <CardContent className="text-center">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Completing authentication...</p>
            </div>
          ) : error ? (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
} 