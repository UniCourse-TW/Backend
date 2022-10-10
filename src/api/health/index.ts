import express from "express";
import { prisma } from "@/prisma";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        await prisma.$connect();

        res.json({
            server: "ok",
            database: "ok"
        });
    } catch {
        res.status(500).json({
            server: "ok",
            database: "error"
        });
    }
});

export default router;
