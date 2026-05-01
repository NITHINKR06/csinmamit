import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CORE_MEMBERS } from '../constants/coreMembers';

const CORE_MEMBERS_CACHE_KEY = 'csi_core_members_cache';

const getCached = () => {
  try {
    const cached = localStorage.getItem(CORE_MEMBERS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const setCached = (data) => {
  try {
    localStorage.setItem(CORE_MEMBERS_CACHE_KEY, JSON.stringify(data));
  } catch {
  }
};

export const fetchCoreMembersFromFirestore = async () => {
  try {
    if (!db) return null;
    const snapshot = await getDocs(collection(db, 'coreMembers'));
    if (snapshot.empty) return null;
    const members = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      members[data.email?.toLowerCase()] = {
        name: data.name,
        role: data.role,
        permissions: data.permissions || [],
        level: data.level || 99
      };
    });
    if (Object.keys(members).length > 0) {
      setCached(members);
      return members;
    }
    return null;
  } catch {
    const cached = getCached();
    return cached;
  }
};

let firestoreMembers = null;
let fetchPromise = null;

export const getCoreMembers = async () => {
  if (firestoreMembers) return firestoreMembers;
  if (!fetchPromise) {
    fetchPromise = fetchCoreMembersFromFirestore().then((members) => {
      firestoreMembers = members;
      return members;
    });
  }
  return fetchPromise;
};

export const isCoreMember = async (email) => {
  if (!email) return false;
  const members = await getCoreMembers();
  if (members && members[email.toLowerCase()]) return true;
  return !!CORE_MEMBERS[email.toLowerCase()];
};

export const getRoleByEmail = async (email) => {
  if (!email) return null;
  const members = await getCoreMembers();
  if (members && members[email.toLowerCase()]) return members[email.toLowerCase()];
  return CORE_MEMBERS[email.toLowerCase()] || null;
};

export const hasPermission = (userRole, permission) => {
  if (!firestoreMembers) {
    const roleData = Object.values(CORE_MEMBERS).find(r => r.role === userRole);
    if (!roleData) return false;
    return roleData.permissions.includes('all') || roleData.permissions.includes(permission);
  }
  const roleData = Object.values(firestoreMembers).find(r => r.role === userRole);
  if (!roleData) return false;
  return roleData.permissions?.includes('all') || roleData.permissions?.includes(permission);
};

export { CORE_MEMBERS };
