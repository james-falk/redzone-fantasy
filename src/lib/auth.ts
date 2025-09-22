/**
 * Authentication utilities for Redzone Fantasy
 * 
 * This file prepares the structure for future Clerk integration.
 * Currently returns mock data for development purposes.
 */

// User type definition
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  favorites: string[]; // Array of content IDs
}

// Mock user data for development
const mockUser: User = {
  id: 'mock-user-1',
  email: 'demo@redzonfantasy.com',
  name: 'Demo User',
  createdAt: new Date(),
  favorites: [],
};

/**
 * Get current user
 * In the future, this will integrate with Clerk
 */
export async function getCurrentUser(): Promise<User | null> {
  // TODO: Replace with Clerk integration
  // For now, return mock user in development
  if (process.env.NODE_ENV === 'development') {
    return mockUser;
  }
  
  return null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Get user favorites
 */
export async function getUserFavorites(userId: string): Promise<string[]> {
  // TODO: Implement with database and Clerk
  return mockUser.favorites;
}

/**
 * Add content to user favorites
 */
export async function addToFavorites(userId: string, contentId: string): Promise<boolean> {
  // TODO: Implement with database and Clerk
  console.log(`Adding content ${contentId} to favorites for user ${userId}`);
  return true;
}

/**
 * Remove content from user favorites
 */
export async function removeFromFavorites(userId: string, contentId: string): Promise<boolean> {
  // TODO: Implement with database and Clerk
  console.log(`Removing content ${contentId} from favorites for user ${userId}`);
  return true;
}

/**
 * Clerk configuration (for future use)
 */
export const clerkConfig = {
  // These will be set when Clerk is integrated
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  signInUrl: '/auth/sign-in',
  signUpUrl: '/auth/sign-up',
  afterSignInUrl: '/',
  afterSignUpUrl: '/',
};
