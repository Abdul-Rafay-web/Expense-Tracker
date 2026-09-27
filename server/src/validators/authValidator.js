const { z } = require("zod");

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email")
    .max(254, "Email is too long")
    .pipe(z.email("Enter a valid email address"));

const signupSchema = z.object({
    name: z.string().trim().min(1, "Tell us your name").max(60, "Name is too long"),
    email: emailSchema,
    password: z.string().min(8, "Use at least 8 characters").max(72, "Use at most 72 characters"),
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().min(1, "Enter your email").max(254, "Email is too long"),
    password: z.string().min(1, "Enter your password").max(72, "Password is too long"),
});

module.exports = { signupSchema, loginSchema };
