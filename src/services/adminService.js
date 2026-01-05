import { supabase } from './supabaseClient';

/**
 * Admin Authentication Service
 * Handles admin login and authentication
 */

/**
 * Admin login
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, error: string|null, data: Object|null}>}
 */
export const adminSignIn = async (email, password) => {
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

    // Note: Admin login does NOT require email verification
    // This allows admin to login immediately without email confirmation

    // Step 2: Check if user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (adminError || !adminData) {
      // Not an admin, sign out
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Access denied. Admin privileges required.',
        data: null,
      };
    }

    // Step 3: Return success with admin data
    return {
      success: true,
      error: null,
      data: {
        user: authData.user,
        admin: adminData,
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
 * Get the current authenticated admin
 * @returns {Promise<{user: Object|null, admin: Object|null, error: string|null}>}
 */
export const getCurrentAdmin = async () => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        user: null,
        admin: null,
        error: null,
      };
    }

    const user = session.user;

    // Get admin record
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (adminError || !adminData) {
      return {
        user: null,
        admin: null,
        error: 'Admin record not found',
      };
    }

    return {
      user,
      admin: adminData,
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
 * Get student statistics for admin dashboard
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const getStudentStatistics = async () => {
  try {
    // Verify admin is authenticated
    const { user, admin, error: adminError } = await getCurrentAdmin();
    if (adminError || !user || !admin) {
      return {
        success: false,
        error: 'Admin authentication required',
        data: null,
      };
    }

    // Get total students count
    const { count: totalStudents, error: totalError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    // Get pending students count (status = 'pending')
    const { count: pendingStudents, error: pendingError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get active students count (status = 'active')
    const { count: activeStudents, error: activeError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (totalError || pendingError || activeError) {
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
        total: totalStudents || 0,
        pending: pendingStudents || 0,
        active: activeStudents || 0,
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

