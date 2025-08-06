import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to construct full image/file URL from relative path
export const getFileUrl = (filePath: string): string => {
  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // If it's a placeholder or default image, return as is
  if (filePath.startsWith('/') || filePath === '/avatar.png') {
    return filePath;
  }
  
  // Construct full URL using the CDN domain
  return `https://cdn.ormi.com/${filePath}`;
};
