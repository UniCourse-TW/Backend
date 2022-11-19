import { config } from "dotenv";

config();

export const BACKEND_PORT = Number(process.env.BACKEND_PORT) || 3000;
export const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || `http://localhost:${BACKEND_PORT}`;
export const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
export const UNICORSE_ROOT_USER = process.env.UNICORSE_ROOT_USER || "unicorse";
export const UNICORSE_ROOT_PASSWORD = process.env.UNICORSE_ROOT_PASSWORD || "unicorse";
