import { supabase } from './supabaseClient';

/**
 * Admin Authentication Service
 * Handles admin login and authentication
 */

/**
 * Admin login - Authenticates using Supabase Auth and checks admin_users table
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, error: string|null, data: Object|null}>}
 */
export const adminSignIn = async (email, password) => {
  try {
    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message || 'Invalid login credentials',
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

    // Step 2: Check if user is an admin in admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (adminError || !adminData) {
      // Sign out the user if they're not an admin
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Access denied. You are not authorized as an admin.',
        data: null,
      };
    }

    // Step 3: Store admin session
    sessionStorage.setItem('admin_logged_in', 'true');
    sessionStorage.setItem('admin_user_id', authData.user.id);

    // Return success with admin data
    return {
      success: true,
      error: null,
      data: {
        admin: {
          id: adminData.id,
          auth_user_id: adminData.auth_user_id,
          name: adminData.name,
          email: adminData.email,
          role: adminData.role,
        },
        user: authData.user,
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
 * Get the current authenticated admin
 * @returns {Promise<{user: Object|null, admin: Object|null, error: string|null}>}
 */
export const getCurrentAdmin = async () => {
  try {
    // Check if admin is logged in (stored in sessionStorage)
    const adminSession = sessionStorage.getItem('admin_logged_in');
    
    if (adminSession !== 'true') {
      return {
        user: null,
        admin: null,
        error: null,
      };
    }

    // Get current Supabase auth user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      // Clear session if user is not authenticated
      sessionStorage.removeItem('admin_logged_in');
      sessionStorage.removeItem('admin_user_id');
      return {
        user: null,
        admin: null,
        error: 'User not authenticated',
      };
    }

    // Get admin data from admin_users table (optimize: only select needed fields)
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id, auth_user_id, name, email, role')
      .eq('auth_user_id', user.id)
      .single();

    if (adminError || !adminData) {
      // Clear session if user is not an admin
      sessionStorage.removeItem('admin_logged_in');
      sessionStorage.removeItem('admin_user_id');
      return {
        user: null,
        admin: null,
        error: 'Admin record not found',
      };
    }

    return {
      user: user,
      admin: {
        id: adminData.id,
        auth_user_id: adminData.auth_user_id,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      admin: null,
      error: error.message || 'Failed to get current admin',
    };
  }
};

/**
 * Admin sign out
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const adminSignOut = async () => {
  try {
    // Sign out from Supabase Auth
    const { error: signOutError } = await supabase.auth.signOut();
    
    // Remove admin session
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_user_id');
    
    if (signOutError) {
      return {
        success: false,
        error: signOutError.message || 'Failed to sign out',
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
 * Get student statistics for admin dashboard
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const getStudentStatistics = async () => {
  try {
    // Verify admin is authenticated
    const { admin, error: adminError } = await getCurrentAdmin();
    if (adminError || !admin) {
      return {
        success: false,
        error: 'Admin authentication required',
        data: null,
      };
    }

    // Optimize: Run all count queries in parallel instead of sequentially
    // This is much faster (3x speed improvement)
    const [totalResult, pendingResult, activeResult] = await Promise.all([
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
    ]);

    if (totalResult.error || pendingResult.error || activeResult.error) {
      return {
        success: false,
        error: 'Failed to fetch student statistics',
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: {
        total: totalResult.count || 0,
        pending: pendingResult.count || 0,
        active: activeResult.count || 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to get student statistics',
      data: null,
    };
  }
};

