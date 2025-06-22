import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const VITE_SUPABASE_URL =
  typeof document === "undefined"
    ? process.env.VITE_SUPABASE_URL!
    : import.meta.env.VITE_SUPABASE_URL!;
const VITE_SUPABASE_ANON_KEY =
  typeof document === "undefined"
    ? process.env.VITE_SUPABASE_ANON_KEY!
    : import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSupabaseServerClient(request: Request) {
  const cookies = request.headers.get("Cookie") ?? "";
  const responseHeaders = new Headers();

  const supabase = createServerClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => {
        const match = cookies.match(new RegExp(`(^| )${key}=([^;]+)`));
        return match ? match[2] : null;
      },
      set: (key, value, options) => {
        responseHeaders.append(
          "Set-Cookie",
          `${key}=${value}; ${Object.entries(options)
            .map(([k, v]) => `${k}=${v}`)
            .join("; ")}`,
        );
      },
      remove: (key, options) => {
        responseHeaders.append(
          "Set-Cookie",
          `${key}=; ${Object.entries(options)
            .map(([k, v]) => `${k}=${v}`)
            .join("; ")}`,
        );
      },
    },
  });

  return { supabase, responseHeaders };
} 