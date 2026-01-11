import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://YOUR_PROJECT_ID.supabase.co",
  "YOUR_PUBLIC_ANON_KEY"
);

supabase.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") {
    if (!window.location.pathname.includes("reset-password")) {
      window.location.href = "/reset-password.html";
    }
  }
});
