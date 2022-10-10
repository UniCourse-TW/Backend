import express from "express";
import { BACKEND_PORT } from "@/config";
import health from "@/api/health";
import course from "@/api/course";

const server = express().use(express.json());

server.use("/health", health);
server.use("/course", course);

server.use("*", (req, res) => {
    res.status(404).json({ error: "我們在這找不到任何東西 QQ" });
});

server.listen(BACKEND_PORT, () => {
    console.log(`Server is running on port ${BACKEND_PORT}`);
});
