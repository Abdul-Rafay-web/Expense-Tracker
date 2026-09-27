export function firstName(user) {
    return user?.name?.trim().split(/\s+/)[0] ?? "";
}

export function initials(user) {
    const parts = user?.name?.trim().split(/\s+/).filter(Boolean) ?? [];
    const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
    return letters.toUpperCase();
}

export function greeting(date = new Date()) {
    const hour = date.getHours();
    if (hour < 5) {
        return "Still up";
    }
    if (hour < 12) {
        return "Good morning";
    }
    if (hour < 17) {
        return "Good afternoon";
    }
    return "Good evening";
}

export function memberSince(user) {
    if (!user?.createdAt) {
        return "";
    }
    return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(user.createdAt));
}

export function passwordStrength(password) {
    if (!password) {
        return { score: 0, label: "" };
    }
    if (password.length < 8) {
        return { score: 1, label: "Too short" };
    }
    let score = 1;
    if (password.length >= 12) {
        score += 1;
    }
    if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) {
        score += 1;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
        score += 1;
    }
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    return { score, label: labels[score] };
}
