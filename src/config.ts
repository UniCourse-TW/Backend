import { config } from "dotenv";

config();

export const BACKEND_PORT = Number(process.env.BACKEND_PORT) || 3000;
export const UNICORSE_ROOT_USER = process.env.UNICORSE_ROOT_USER || "unicorse";
export const UNICORSE_ROOT_PASSWORD = process.env.UNICORSE_ROOT_PASSWORD || "unicorse";
export const IGNORE_INVITATION = !!process.env.IGNORE_INVITATION;
