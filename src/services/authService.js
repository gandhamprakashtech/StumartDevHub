import { supabase } from './supabaseClient';

/**
 * Authentication Service
 * Handles all authentication-related operations including signup, login, logout,
 * and email verification checks.
 */

/**
 * Sign up a new student
 * @param {Object} studentData - Student registration data
 * @param {string} studentData.pinNumber - Unique PIN number (primary key)
 * @param {string} studentData.name - Student name
 * @param {string} studentData.email - Student email
 * @param {string} studentData.password - Student password
 * @returns {Promise<{success: boolean, error: string|null, data: Object|null}>}
 */
export const signUp = async ({ pinNumber, name, email, password }) => {
  try {
    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
        data: null,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account',
        data: null,
      };
    }

    // Step 2: Insert student details into students table
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .insert({
        pin_number: pinNumber,
        name: name,
        email: email,
        auth_user_id: authData.user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (studentError) {
      // If student insertion fails, we have an orphaned auth user
      // Note: Client-side cannot delete auth users (requires admin API)
      // The user will need to verify email to login, but won't have a student record
      // This is a known limitation - in production, use a server-side function to handle cleanup
      console.error('Failed to create student record:', studentError);

      // Sign out the user to prevent any session issues
      await supabase.auth.signOut();

      return {
        success: false,
        error: studentError.code === '23505' 
          ? 'PIN number already exists. Please use a different PIN.'
          : studentError.message || 'Failed to create student record',
        data: null,
      };
    }

    // Step 3: Return success (user is created but email not verified yet)
    return {
      success: true,
      error: null,
      data: {
        user: authData.user,
        student: studentData,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during signup',
      data: null,
    };
  }
};

/**
 * Sign in an existing student
 * @param {string} email - Student email
 * @param {string} password - Student password
 * @returns {Promise<{success: boolean, error: string|null, data: Object|null}>}
 */
export const signIn = async (email, password) => {
  try {
    // Step 1: Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
        data: null,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Authentication failed',
        data: null,
      };
    }

    // Step 2: Check if email is verified
    if (!authData.user.email_confirmed_at) {
      // Sign out the user immediately if email is not verified
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        data: null,
      };
    }

    // Step 3: Verify student record exists in students table
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (studentError || !studentData) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Student record not found. Please contact support.',
        data: null,
      };
    }

    // Step 4: Update status to 'active' if it's still 'pending' (email is now verified)
    if (studentData.status === 'pending') {
      const { data: updatedStudent, error: updateError } = await supabase
        .from('students')
        .update({ status: 'active' })
        .eq('auth_user_id', authData.user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update student status:', updateError);
        // Continue anyway - status update is not critical
      } else {
        // Use the updated student data
        studentData.status = 'active';
      }
    }

    // Step 5: Return success with user and student data
    return {
      success: true,
      error: null,
      data: {
        user: authData.user,
        student: studentData,
        session: authData.session,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during login',
      data: null,
    };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during logout',
    };
  }
};

/**
 * Get the current authenticated user and their student record
 * @returns {Promise<{user: Object|null, student: Object|null, error: string|null}>}
 */
export const getCurrentUser = async () => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        user: null,
        student: null,
        error: null,
      };
    }

    const user = session.user;

    // Check if email is verified
    if (!user.email_confirmed_at) {
      return {
        user: null,
        student: null,
        error: 'Email not verified',
      };
    }

    // Get student record
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (studentError || !studentData) {
      return {
        user: null,
        student: null,
        error: 'Student record not found',
      };
    }

    // Update status to 'active' if it's still 'pending' (email is verified)
    if (studentData.status === 'pending') {
      const { data: updatedStudent, error: updateError } = await supabase
        .from('students')
        .update({ status: 'active' })
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (!updateError && updatedStudent) {
        // Return updated student data
        return {
          user,
          student: updatedStudent,
          error: null,
        };
      }
    }

    return {
      user,
      student: studentData,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      student: null,
      error: error.message || 'Failed to get current user',
    };
  }
};

/**
 * Resend verification email
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const resendVerificationEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to resend verification email',
    };
  }
};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  
  // Return unsubscribe function
  return () => {
    if (subscription) {
      subscription.unsubscribe();
    }
  };
};

