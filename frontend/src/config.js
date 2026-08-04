/**
 * Global API Base Configuration
 * Automatically uses environment variable VITE_API_BASE_URL (or VITE_API_URL / REACT_APP_API_URL)
 * when deployed (e.g. on Render) and falls back to http://localhost:5000 during local development.
 */
const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL;
const rawBase = envUrl || 'http://localhost:5000';

export const API_BASE = rawBase.replace(/\/$/, '').replace(/\/api$/, '');
export const API_BASE_URL = `${API_BASE}/api`;
