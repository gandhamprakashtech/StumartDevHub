import { useEffect } from "react";
import { Outlet } from "react-router";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { supabase } from "../services/supabaseClient";

export default function Layout() {
  useEffect(() => {
    // Optimize: Only listen for specific events, not all auth state changes
    // This reduces unnecessary database queries
    let confirmationTimeout = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only process email confirmation events
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user?.email_confirmed_at) {
        // Debounce: Wait 500ms before checking to avoid multiple rapid calls
        if (confirmationTimeout) {
          clearTimeout(confirmationTimeout);
        }

        confirmationTimeout = setTimeout(async () => {
          try {
            // Check if email is already confirmed in database (optimize: only select needed field)
            const { data: student } = await supabase
              .from('students')
              .select('email_confirmed')
              .eq('auth_user_id', session.user.id)
              .single();

            // If email confirmed in Auth but not in database, call confirm_student_email()
            if (student && !student.email_confirmed) {
              const { error: confirmError } = await supabase.rpc('confirm_student_email', {
                p_auth_user_id: session.user.id
              });

              if (confirmError) {
                console.error('Error confirming email in database:', confirmError);
              }
            }
          } catch (error) {
            console.error('Error handling email confirmation:', error);
          }
        }, 500);
      }
    });

    // Cleanup subscription and timeout on unmount
    return () => {
      if (confirmationTimeout) {
        clearTimeout(confirmationTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
