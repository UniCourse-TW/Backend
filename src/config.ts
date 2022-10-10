import { config } from "dotenv";

config();

export const BACKEND_PORT = Number(process.env.BACKEND_PORT) || 3000;
