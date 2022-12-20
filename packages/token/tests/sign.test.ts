import { decode, sign, verify } from "../src";

describe("sign", () => {
    test("accepted", () => {
        const token = {
            token: "cuid",
            user: "cuid-user",
            username: "username",
            expires: Math.floor(Date.now() / 1_000) + 60,
            traits: ["trait"]
        };

        const signed = sign(token);
        const decoded = decode(signed);

        expect(decoded).toEqual(token);
    });

    test("expired", () => {
        const token = {
            token: "cuid",
            user: "cuid-user",
            username: "username",
            expires: Math.floor(Date.now() / 1_000) - 1,
            traits: ["trait"]
        };

        expect(() => sign(token)).toThrow();
    });

    test("verify", () => {
        const token = {
            token: "cuid",
            user: "cuid-user",
            username: "username",
            expires: Math.floor(Date.now() / 1_000) + 60,
            traits: ["trait"]
        };

        const signed = sign(token);
        const decoded = verify(signed);
        expect(decoded).toEqual(token);
    });

    test("verify invalid", () => {
        const token = {
            token: "cuid",
            user: "cuid-user",
            username: "username",
            expires: Math.floor(Date.now() / 1_000) + 60,
            traits: ["trait"]
        };

        const signed = sign(token);

        const parts = signed.split(".");
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        payload.traits = ["invalid"];
        const modified = [
            parts[0], Buffer.from(JSON.stringify(payload)).toString("base64"), parts[2]
        ].join(".");

        expect(() => verify(modified)).toThrow();
    });
});
