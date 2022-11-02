/**
 * This client-side password hashing algorithm.
 * This algorithm supports both Node.js and browsers.
 * @param password The password to hash.
 */
export async function hash(password: string): Promise<string> {
    if (typeof window !== "undefined") {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest("SHA-512", data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
    } else {
        const crypto = await import("crypto");
        return crypto.createHash("sha512").update(password).digest("hex");
    }
}
