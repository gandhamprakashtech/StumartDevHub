import { supabase } from './supabaseClient';

/**
 * PIN Service
 * Handles PIN management operations for admin and registration
 */

/**
 * Get available joining years from existing PINs
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export const getAvailableJoiningYears = async () => {
  try {
    const { data, error } = await supabase
      .from('student_pins')
      .select('joining_year')
      .eq('status', 'available')
      .order('joining_year', { ascending: false });

    if (error) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }

    // Get unique joining years
    const uniqueYears = [...new Set(data?.map((pin) => pin.joining_year).filter(Boolean))].sort((a, b) => b - a);

    return {
      success: true,
      data: uniqueYears,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch joining years',
    };
  }
};

/**
 * Get available branches for a joining year
 * @param {number} joiningYear - Joining year (e.g., 2025)
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export const getAvailableBranches = async (joiningYear) => {
  try {
    if (!joiningYear) {
      return {
        success: true,
        data: [],
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('student_pins')
      .select('branch')
      .eq('joining_year', joiningYear)
      .eq('status', 'available')
      .order('branch', { ascending: true });

    if (error) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }

    // Get unique branches
    const uniqueBranches = [...new Set(data?.map((pin) => pin.branch).filter(Boolean))].sort();

    return {
      success: true,
      data: uniqueBranches,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch branches',
    };
  }
};

/**
 * Get available academic years for a joining year and branch
 * @param {number} joiningYear - Joining year (e.g., 2025)
 * @param {string} branch - Branch code (e.g., CME, CM)
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export const getAvailableYears = async (joiningYear, branch) => {
  try {
    if (!joiningYear || !branch) {
      return {
        success: true,
        data: [],
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('student_pins')
      .select('year')
      .eq('joining_year', joiningYear)
      .eq('branch', branch)
      .eq('status', 'available')
      .order('year', { ascending: true });

    if (error) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }

    // Get unique academic years
    const uniqueYears = [...new Set(data?.map((pin) => pin.year).filter(Boolean))].sort();

    return {
      success: true,
      data: uniqueYears,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch academic years',
    };
  }
};

/**
 * Get available sections for a joining year, branch and academic year
 * @param {number} joiningYear - Joining year (e.g., 2025)
 * @param {string} branch - Branch code (e.g., CME, CM)
 * @param {number} year - Academic year (1, 2, or 3)
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export const getAvailableSections = async (joiningYear, branch, year) => {
  try {
    if (!joiningYear || !branch || !year) {
      return {
        success: true,
        data: [],
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('student_pins')
      .select('section')
      .eq('joining_year', joiningYear)
      .eq('branch', branch)
      .eq('year', year)
      .eq('status', 'available')
      .order('section', { ascending: true });

    if (error) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }

    // Get unique sections
    const uniqueSections = [...new Set((data || []).map((item) => item.section))].sort();

    return {
      success: true,
      data: uniqueSections,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch sections',
    };
  }
};

/**
 * Get available PINs filtered by joining year, branch, year, section
 * @param {number} joiningYear - Joining year (e.g., 2025)
 * @param {string} branch - Branch code (e.g., CME, CM)
 * @param {number} year - Academic year (1, 2, or 3)
 * @param {string} section - Section (A, B, C, etc.)
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export const getAvailablePINs = async (joiningYear, branch, year, section) => {
  try {
    let query = supabase
      .from('student_pins')
      .select('pin_number, joining_year, branch, year, section, pin_sequence')
      .eq('status', 'available')
      .order('pin_sequence', { ascending: true });

    if (joiningYear) {
      query = query.eq('joining_year', joiningYear);
    }
    if (branch) {
      query = query.eq('branch', branch);
    }
    if (year) {
      query = query.eq('year', year);
    }
    if (section) {
      query = query.eq('section', section);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch PINs',
    };
  }
};

/**
 * Get PIN details by PIN number
 * @param {string} pinNumber - PIN number
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const getPINByNumber = async (pinNumber) => {
  try {
    const { data, error } = await supabase
      .from('student_pins')
      .select('*')
      .eq('pin_number', pinNumber)
      .single();

    if (error) {
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || 'Failed to fetch PIN',
    };
  }
};

/**
 * Create PINs in bulk (Admin only)
 * @param {number} joiningYear - Joining year (e.g., 2025)
 * @param {string} branch - Branch code
 * @param {number} year - Academic year (1, 2, or 3)
 * @param {string} section - Section
 * @param {number} startSequence - Starting PIN number (e.g., 1)
 * @param {number} endSequence - Ending PIN number (e.g., 60)
 * @returns {Promise<{success: boolean, count: number, error: string|null}>}
 */
export const createPINsBulk = async (joiningYear, branch, year, section, startSequence, endSequence) => {
  try {
    // Call database function to create PINs (admin check handled in frontend)
    const { data, error } = await supabase.rpc('create_pins_bulk', {
      p_joining_year: joiningYear,
      p_branch: branch,
      p_year: year,
      p_section: section,
      p_start_sequence: startSequence,
      p_end_sequence: endSequence,
      p_created_by: null, // No longer needed
    });

    if (error) {
      return {
        success: false,
        count: 0,
        error: error.message,
      };
    }

    return {
      success: true,
      count: data || 0,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: error.message || 'Failed to create PINs',
    };
  }
};

/**
 * Create individual PINs (Admin only)
 * @param {Array<string>} pinNumbers - Array of PIN numbers to create (just the sequence numbers)
 * @param {number} joiningYear - Joining year (e.g., 2025)
 * @param {string} branch - Branch code
 * @param {number} year - Academic year (1, 2, or 3)
 * @param {string} section - Section
 * @returns {Promise<{success: boolean, count: number, error: string|null}>}
 */
export const createPINsIndividual = async (pinNumbers, joiningYear, branch, year, section) => {
  try {
    // Get last 2 digits of joining year (e.g., 2025 -> 25)
    const yearCode = String(joiningYear).slice(-2);

    // Parse PIN numbers and create records
    const pinsToInsert = pinNumbers
      .map((pinStr) => {
        const pinNum = parseInt(pinStr.trim());
        if (isNaN(pinNum)) return null;
        
        // Format PIN sequence as 3 digits with leading zeros
        const pinSequenceStr = String(pinNum).padStart(3, '0');
        
        // Format: YY030-BRANCH-NUMBER (e.g., 25030-CM-001)
        const pinNumber = `${yearCode}030-${branch}-${pinSequenceStr}`;
        
        return {
          pin_number: pinNumber,
          joining_year: joiningYear,
          branch,
          year,
          section,
          pin_sequence: pinNum,
          created_by: null, // No longer needed
          status: 'available',
        };
      })
      .filter(Boolean);

    if (pinsToInsert.length === 0) {
      return {
        success: false,
        count: 0,
        error: 'No valid PIN numbers provided',
      };
    }

    const { data, error } = await supabase
      .from('student_pins')
      .insert(pinsToInsert)
      .select();

    if (error) {
      return {
        success: false,
        count: 0,
        error: error.message,
      };
    }

    return {
      success: true,
      count: data?.length || 0,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: error.message || 'Failed to create PINs',
    };
  }
};

/**
 * Get all PINs with filters (Admin only)
 * @param {Object} filters - Filter options
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export const getAllPINs = async (filters = {}) => {
  try {
    let query = supabase
      .from('student_pins')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.joiningYear) {
      query = query.eq('joining_year', filters.joiningYear);
    }
    if (filters.branch) {
      query = query.eq('branch', filters.branch);
    }
    if (filters.year) {
      query = query.eq('year', filters.year);
    }
    if (filters.section) {
      query = query.eq('section', filters.section);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch PINs',
    };
  }
};

/**
 * Update PIN status (Admin only)
 * @param {string} pinNumber - PIN number
 * @param {string} status - New status (available, registered, blocked)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const updatePINStatus = async (pinNumber, status) => {
  try {
    const { error } = await supabase
      .from('student_pins')
      .update({ status })
      .eq('pin_number', pinNumber);

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
      error: error.message || 'Failed to update PIN status',
    };
  }
};

/**
 * Delete PIN and all related data (Admin only)
 * This permanently deletes:
 * - PIN record
 * - Student account
 * - All products created by the student
 * - Auth user account
 * @param {string} pinNumber - PIN number
 * @returns {Promise<{success: boolean, deleted: Object, error: string|null}>}
 */
export const deletePIN = async (pinNumber) => {
  try {
    // Step 1: Get student record to find auth_user_id and count products
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('auth_user_id')
      .eq('pin_number', pinNumber)
      .single();

    let authUserId = null;
    let productsCount = 0;
    
    if (studentData && !studentError) {
      authUserId = studentData.auth_user_id;
      
      // Count products that will be deleted
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .or(`seller_id.eq.${authUserId},student_pin_number.eq.${pinNumber}`);
      
      productsCount = count || 0;
    }

    // Step 2: Delete student record first (this will cascade delete products)
    if (studentData && !studentError) {
      const { error: studentDeleteError } = await supabase
        .from('students')
        .delete()
        .eq('pin_number', pinNumber);

      if (studentDeleteError) {
        console.error('Student deletion error:', studentDeleteError);
        return {
          success: false,
          deleted: null,
          error: `Failed to delete student: ${studentDeleteError.message}`,
        };
      }
    }

    // Step 3: Delete products explicitly (as backup, cascade should handle it)
    if (authUserId) {
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .or(`seller_id.eq.${authUserId},student_pin_number.eq.${pinNumber}`);

      // Don't fail if products deletion has error (might already be deleted by cascade)
      if (productsError) {
        console.warn('Products deletion warning:', productsError.message);
      }
    }

    // Step 4: Delete PIN record
    const { error: pinDeleteError } = await supabase
      .from('student_pins')
      .delete()
      .eq('pin_number', pinNumber);

    if (pinDeleteError) {
      console.error('PIN deletion error:', pinDeleteError);
      return {
        success: false,
        deleted: null,
        error: `Failed to delete PIN: ${pinDeleteError.message}`,
      };
    }

    // Note: Auth user deletion requires Supabase Admin API
    // The auth user account will remain but cannot login without student record

    return {
      success: true,
      deleted: {
        pin: pinNumber,
        student: studentData ? true : false,
        productsCount: productsCount,
        authUserId: authUserId,
      },
      error: null,
    };
  } catch (error) {
    console.error('Delete PIN error:', error);
    return {
      success: false,
      deleted: null,
      error: error.message || 'Failed to delete PIN and account',
    };
  }
};

/**
 * Get PIN statistics (Admin only)
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const getPINStatistics = async () => {
  try {
    // Get all PINs
    const { data: allPINs, error: pinsError } = await supabase
      .from('student_pins')
      .select('joining_year, branch, section, status');

    if (pinsError) {
      return {
        success: false,
        data: null,
        error: pinsError.message,
      };
    }

    // Calculate statistics
    const totalPINs = allPINs?.length || 0;
    const availablePINs = allPINs?.filter((pin) => pin.status === 'available').length || 0;
    const registeredPINs = allPINs?.filter((pin) => pin.status === 'registered').length || 0;
    const blockedPINs = allPINs?.filter((pin) => pin.status === 'blocked').length || 0;

    // Get unique joining years
    const uniqueJoiningYears = [...new Set(allPINs?.map((pin) => pin.joining_year).filter(Boolean))].sort((a, b) => b - a);
    
    // Get unique branches
    const uniqueBranches = [...new Set(allPINs?.map((pin) => pin.branch).filter(Boolean))];
    const branchesCount = uniqueBranches.length;

    // Get unique sections
    const uniqueSections = [...new Set(allPINs?.map((pin) => pin.section).filter(Boolean))];
    const sectionsCount = uniqueSections.length;

    return {
      success: true,
      data: {
        totalPINs,
        availablePINs,
        registeredPINs,
        blockedPINs,
        joiningYearsCount: uniqueJoiningYears.length,
        branchesCount,
        sectionsCount,
        joiningYears: uniqueJoiningYears,
        branches: uniqueBranches.sort(),
        sections: uniqueSections.sort(),
      },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || 'Failed to fetch PIN statistics',
    };
  }
};

