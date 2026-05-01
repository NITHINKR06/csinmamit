/**
 * Secure Core Members Utilities
 * Uses environment variables and encoding for security
 */

// Simple encryption/decryption utilities
const encodeData = (data) => {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    // console.error('Error encoding data:', error);
    return null;
  }
};

const decodeData = (encodedData) => {
  try {
    return JSON.parse(atob(encodedData));
  } catch (error) {
    // console.error('Error decoding data:', error);
    return {};
  }
};

// Get core members data from environment variables
const getCoreMembersData = () => {
  const encodedData = import.meta.env.VITE_CORE_MEMBERS_DATA;
  
  if (!encodedData) {
    // console.warn('Core members data not found in environment variables');
    return {};
  }
  
  return decodeData(encodedData);
};

// Security check with salt
const validateSecurity = () => {
  const salt = import.meta.env.VITE_SECURITY_SALT;
  const env = import.meta.env.VITE_APP_ENV;
  
  if (env === 'production' && !salt) {
    // console.error('Security salt not configured for production');
    return false;
  }
  
  return true;
};

/**
 * Securely check if email is a core member
 * @param {string} email - User email to check
 * @returns {boolean} True if core member
 */
export const isCoreMember = (email) => {
  if (!validateSecurity() || !email) return false;
  
  const coreMembersData = getCoreMembersData();
  return coreMembersData.hasOwnProperty(email.toLowerCase());
};

/**
 * Get role data by email
 * @param {string} email - User email
 * @returns {Object|null} Role data or null
 */
export const getRoleByEmail = (email) => {
  if (!validateSecurity() || !email) return null;
  
  const coreMembersData = getCoreMembersData();
  return coreMembersData[email.toLowerCase()] || null;
};

/**
 * Check if email is from NMAMIT domain
 * @param {string} email - Email to check
 * @returns {boolean} True if NMAMIT email
 */
export const isNMAMITEmail = (email) => {
  return email && email.toLowerCase().endsWith('@nmamit.in');
};

/**
 * Check if user has specific permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (userRole, permission) => {
  if (!validateSecurity()) return false;
  
  const coreMembersData = getCoreMembersData();
  const roleData = Object.values(coreMembersData).find(r => r.role === userRole);
  
  if (!roleData) return false;
  
  return roleData.permissions.includes('all') || roleData.permissions.includes(permission);
};

/**
 * Get role level for hierarchy
 * @param {string} role - Role to check
 * @returns {number} Role level (999 if not found)
 */
export const getRoleLevel = (role) => {
  if (!validateSecurity()) return 999;
  
  const coreMembersData = getCoreMembersData();
  const roleData = Object.values(coreMembersData).find(r => r.role === role);
  
  return roleData ? roleData.level : 999;
};

// Core member data now lives in Firestore `coreMembers` collection.
// See scripts/exportCoreMembers.mjs to generate import data for Firebase Console.
// Client-side constants are only used as fallback when Firestore is unavailable.
