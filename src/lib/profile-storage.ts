export interface UserProfile {
  knownAllergies: string[];
}

const USER_PROFILE_STORAGE_KEY = 'allergyEyeUserProfile';

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return { knownAllergies: [] };
  }
  try {
    const storedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile) as UserProfile;
      // Basic validation
      if (parsedProfile && Array.isArray(parsedProfile.knownAllergies)) {
        return parsedProfile;
      }
    }
  } catch (error) {
    console.error("Failed to load user profile from local storage:", error);
  }
  return { knownAllergies: [] }; // Default profile
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    // Basic validation before saving
    if (profile && Array.isArray(profile.knownAllergies)) {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } else {
      console.warn("Attempted to save invalid profile:", profile);
    }
  } catch (error) {
    console.error("Failed to save user profile to local storage:", error);
  }
} 