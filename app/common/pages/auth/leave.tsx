import {
  type ActionFunctionArgs,
  type MetaFunction,
  Form,
  useNavigate,
  redirect,
} from "react-router";
import { Button } from "~/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/common/components/ui/card";
import { createSupabaseServerClient } from "~/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import type { ComponentProps } from "react";

export const meta: MetaFunction = () => {
  return [{ title: "Leave" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, responseHeaders } = createSupabaseServerClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const adminSupabase = createServerClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_SERVICE_KEY!,
      {
        cookies: {
          get: () => "",
          set: () => {},
          remove: () => {},
        },
      },
    );

    const { error } = await adminSupabase.auth.admin.deleteUser(
      session.user.id,
    );

    if (error) {
      console.error("Error deleting user:", error);
      return { error: "Could not delete user." };
    }
  }

  // Also sign out to clear the session cookie
  await supabase.auth.signOut();

  return redirect("/", {
    headers: responseHeaders,
  });
}

export function loader() {
  return {};
}

export default function Leave(props: ComponentProps<any>) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <Form method="post">
          <CardHeader className="text-center">
            <CardTitle>Leave the Service</CardTitle>
            <CardDescription>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </CardDescription>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Delete My Account
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
} 