import { createHash } from "node:crypto";
import { email, password, username } from "../src/auth";
import { CONFIG } from "../src/config";

describe("auth", () => {
    describe("username", () => {
        test("strange inout", () => {
            expect(() => username.parse([])).toThrow();
        });

        test("only lower cases", () => {
            const result = username.parse("test");
            expect(result).toEqual("test");
        });

        test("lower cases + upper cases", () => {
            const result = username.parse("Test");
            expect(result).toEqual("test");
        });

        test("lower cases + upper cases + numbers", () => {
            const result = username.parse("Test1234");
            expect(result).toEqual("test1234");
        });

        test("lower cases + upper cases + numbers + others", () => {
            const result = username.parse("Test.1234@test");
            expect(result).toEqual("test1234test");
        });

        test("lower cases + upper cases + numbers + others (unicode)", () => {
            const result = username.parse("測試.Test1234");
            expect(result).toEqual("test1234");
        });

        test("too short", () => {
            const accepted = username.parse("A".repeat(CONFIG.USERNAME_MIN_LENGTH));
            expect(accepted).toEqual("a".repeat(CONFIG.USERNAME_MIN_LENGTH));

            expect(() => username.parse("A".repeat(CONFIG.USERNAME_MIN_LENGTH - 1)))
                .toThrow();
        });

        test("too long", () => {
            const accepted = username.parse("A".repeat(CONFIG.USERNAME_MAX_LENGTH));
            expect(accepted).toEqual("a".repeat(CONFIG.USERNAME_MAX_LENGTH));

            expect(() => username.parse("A".repeat(CONFIG.USERNAME_MAX_LENGTH + 1)))
                .toThrow();
        });
    });

    describe("password", () => {
        test("valid", () => {
            const pw = createHash("sha512").update("test").digest("hex");
            const result = password.parse(pw);
            expect(result).toEqual(pw);
        });

        test("invalid (length)", () => {
            for (let i = 0; i <= 160; i++) {
                if (i !== 128) {
                    expect(() => password.parse("a".repeat(i)))
                        .toThrow();
                }
            }
        });

        test("invalid (format)", () => {
            const pw = `${"a".repeat(127)}z`;
            expect(() => password.parse(pw))
                .toThrow();
        });
    });

    describe("email", () => {
        const domain = "@test.com";

        test("length validation", () => {
            for (let i = 0; i < CONFIG.EMAIL_MAX_LENGTH; i++) {
                const address = "a".repeat(i) + domain;

                if (i === 0 || address.length > CONFIG.EMAIL_MAX_LENGTH) {
                    expect(() => email.parse(address))
                        .toThrow();
                } else {
                    const result = email.parse(address);
                    expect(result).toEqual(address);
                }
            }
        });
    });
});
