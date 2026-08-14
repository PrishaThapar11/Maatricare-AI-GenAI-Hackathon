// Central place for the backend URL.
// Locally it falls back to your Express server on :5000.
// In production, set VITE_API_URL in Vercel's project env vars
// to your deployed backend URL (e.g. https://maatricare-backend.onrender.com)
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
