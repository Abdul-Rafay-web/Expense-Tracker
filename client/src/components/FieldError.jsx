export function withError(className, message) {
    return message ? `${className} has-error` : className;
}

export default function FieldError({ id, message }) {
    if (!message) {
        return null;
    }
    return (
        <span id={id} className="field__error">
            {message}
        </span>
    );
}
