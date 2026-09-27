import { colorFor } from "../lib/format";

export default function CategoryAvatar({ category, size = 40 }) {
    const color = colorFor(category.id);
    return (
        <span
            className="avatar"
            style={{ width: size, height: size, "--avatar": color }}
            aria-hidden="true"
        >
            {category.name.charAt(0).toUpperCase()}
        </span>
    );
}
