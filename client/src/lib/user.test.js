import { describe, expect, it } from "vitest";
import { firstName, greeting, initials, memberSince, passwordStrength } from "./user";

describe("firstName", () => {
    it("returns the first word of the name", () => {
        expect(firstName({ name: "Ayesha Khan" })).toBe("Ayesha");
    });

    it("returns an empty string when there is no user", () => {
        expect(firstName(null)).toBe("");
    });
});

describe("initials", () => {
    it("uses the first and last name", () => {
        expect(initials({ name: "Ayesha Khan" })).toBe("AK");
        expect(initials({ name: "  sara   malik  " })).toBe("SM");
    });

    it("uses the first two letters of a single name", () => {
        expect(initials({ name: "Bilal" })).toBe("BI");
    });
});

describe("greeting", () => {
    const at = (hour) => greeting(new Date(2026, 8, 27, hour, 0, 0));

    it("changes with the time of day, including the boundaries", () => {
        expect(at(3)).toBe("Still up");
        expect(at(5)).toBe("Good morning");
        expect(at(11)).toBe("Good morning");
        expect(at(12)).toBe("Good afternoon");
        expect(at(17)).toBe("Good evening");
        expect(at(23)).toBe("Good evening");
    });
});

describe("memberSince", () => {
    it("formats the sign-up month", () => {
        expect(memberSince({ createdAt: "2026-09-27T10:00:00.000Z" })).toBe("September 2026");
    });
});

describe("passwordStrength", () => {
    it("rates passwords from too short to strong", () => {
        expect(passwordStrength("")).toEqual({ score: 0, label: "" });
        expect(passwordStrength("short")).toEqual({ score: 1, label: "Too short" });
        expect(passwordStrength("password")).toEqual({ score: 1, label: "Weak" });
        expect(passwordStrength("longerpassword12")).toEqual({ score: 2, label: "Fair" });
        expect(passwordStrength("Longerpass12")).toEqual({ score: 3, label: "Good" });
        expect(passwordStrength("Longer-pass-12")).toEqual({ score: 4, label: "Strong" });
    });
});
