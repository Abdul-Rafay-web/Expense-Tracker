import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BellRing, Eye, EyeOff, FileSpreadsheet, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound, WifiOff } from "lucide-react";
import Logo from "../components/Logo";
import Segmented from "../components/Segmented";
import AnimatedNumber from "../components/AnimatedNumber";
import { useToast } from "../components/Toasts";
import { fieldErrorsFrom } from "../lib/api";
import { formatMoney } from "../lib/format";
import { useDemoLogin, useHealth, useLogin, useSignup } from "../lib/queries";
import { firstName, passwordStrength } from "../lib/user";
import { EASE_OUT } from "../lib/motion";

const MODES = [
    { value: "login", label: "Log in" },
    { value: "signup", label: "Create account" },
];

const FEATURES = [
    { icon: ShieldCheck, title: "Private by design", text: "Hashed passwords and secure sessions. Only you see your money." },
    { icon: BellRing, title: "Early budget alerts", text: "A nudge at 80%, an alert the moment you go over." },
    { icon: FileSpreadsheet, title: "Bring your history", text: "Import and export CSV files whenever you like." },
];

const BARS = [
    [52, 30],
    [64, 41],
    [58, 36],
    [80, 44],
    [70, 52],
    [92, 38],
];

function float(delay, distance = 10) {
    return {
        animate: { y: [0, -distance, 0] },
        transition: { duration: 7, delay, repeat: Infinity, ease: "easeInOut" },
    };
}

function Showcase() {
    return (
        <section className="showcase" aria-hidden="true">
            <motion.div
                className="showcase__copy"
                initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: EASE_OUT, delay: 0.1 }}
            >
                <p className="eyebrow">Personal expense manager</p>
                <h1 className="showcase__title">
                    Money, <em>made personal.</em>
                </h1>
                <p className="showcase__lead">
                    Track every rupee, set budgets that warn you early, and watch your month take shape in a space that is entirely yours.
                </p>
            </motion.div>

            <div className="showcase__stage">
                <motion.div className="preview preview--balance" initial={{ opacity: 0, y: 40, rotate: -4 }} animate={{ opacity: 1, rotate: -4 }} transition={{ duration: 1.1, delay: 0.35, ease: EASE_OUT }}>
                    <motion.div {...float(0)}>
                        <p className="eyebrow">Net balance</p>
                        <p className="preview__value">
                            <AnimatedNumber value={12850000} format={formatMoney} duration={2.2} />
                        </p>
                        <div className="flow">
                            <motion.div className="flow__spent" initial={{ scaleX: 0 }} animate={{ scaleX: 0.27 }} transition={{ duration: 1.8, delay: 0.9, ease: EASE_OUT }} />
                        </div>
                        <p className="preview__caption">You kept 73% of what you earned.</p>
                    </motion.div>
                </motion.div>

                <motion.div className="preview preview--budget" initial={{ opacity: 0, y: 40, rotate: 5 }} animate={{ opacity: 1, rotate: 5 }} transition={{ duration: 1.1, delay: 0.55, ease: EASE_OUT }}>
                    <motion.div {...float(1.2, 12)}>
                        <div className="preview__row">
                            <span className="preview__name">Food</span>
                            <span className="chip chip--warning">Close to limit</span>
                        </div>
                        <div className="meter meter--lg">
                            <motion.div className="meter__fill meter__fill--warning" initial={{ scaleX: 0 }} animate={{ scaleX: 0.86 }} transition={{ duration: 1.6, delay: 1.1, ease: EASE_OUT }} />
                        </div>
                        <p className="preview__caption">Rs 12,000 of Rs 14,000</p>
                    </motion.div>
                </motion.div>

                <motion.div className="preview preview--chart" initial={{ opacity: 0, y: 40, rotate: -2 }} animate={{ opacity: 1, rotate: -2 }} transition={{ duration: 1.1, delay: 0.75, ease: EASE_OUT }}>
                    <motion.div {...float(2.4, 8)}>
                        <p className="eyebrow">Six-month rhythm</p>
                        <div className="mini-bars">
                            {BARS.map(([income, expense], index) => (
                                <div key={index} className="mini-bars__group">
                                    <motion.span className="mini-bars__bar mini-bars__bar--income" initial={{ scaleY: 0 }} animate={{ scaleY: income / 100 }} transition={{ duration: 1.2, delay: 1.2 + index * 0.08, ease: EASE_OUT }} />
                                    <motion.span className="mini-bars__bar mini-bars__bar--expense" initial={{ scaleY: 0 }} animate={{ scaleY: expense / 100 }} transition={{ duration: 1.2, delay: 1.3 + index * 0.08, ease: EASE_OUT }} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <motion.ul className="features" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.9 } } }}>
                {FEATURES.map(({ icon: Icon, title, text }) => (
                    <motion.li key={title} className="features__item" variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } } }}>
                        <span className="features__icon">
                            <Icon size={17} strokeWidth={1.8} />
                        </span>
                        <span>
                            <strong>{title}</strong>
                            <span className="features__text">{text}</span>
                        </span>
                    </motion.li>
                ))}
            </motion.ul>
        </section>
    );
}

function Field({ icon: Icon, label, error, children, hint }) {
    return (
        <label className="field">
            <span className="field__label">{label}</span>
            <span className={`auth-input${error ? " has-error" : ""}`}>
                <Icon size={17} className="auth-input__icon" aria-hidden="true" />
                {children}
            </span>
            {error ? <span className="field__error">{error}</span> : hint}
        </label>
    );
}

function PasswordInput({ value, onChange, autoComplete, invalid }) {
    const [visible, setVisible] = useState(false);
    return (
        <>
            <input
                type={visible ? "text" : "password"}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                placeholder="••••••••"
                maxLength={72}
                aria-invalid={invalid}
            />
            <button type="button" className="auth-input__toggle" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"}>
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
        </>
    );
}

function StrengthMeter({ password }) {
    const { score, label } = passwordStrength(password);
    if (!password) {
        return <span className="field__hint">At least 8 characters. Longer is stronger.</span>;
    }
    return (
        <span className={`strength strength--${score}`}>
            <span className="strength__bars">
                {[1, 2, 3, 4].map((step) => (
                    <span key={step} className={`strength__bar${score >= step ? " is-on" : ""}`} />
                ))}
            </span>
            <span className="strength__label">{label}</span>
        </span>
    );
}

const formMotion = {
    initial: { opacity: 0, x: 24, filter: "blur(6px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -24, filter: "blur(6px)", transition: { duration: 0.2 } },
    transition: { duration: 0.45, ease: EASE_OUT },
};

function LoginForm() {
    const toast = useToast();
    const login = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

    function edit(setter, field) {
        return (event) => {
            setter(event.target.value);
            setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
        };
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const found = {};
        if (!email.trim()) {
            found.email = "Enter your email";
        }
        if (!password) {
            found.password = "Enter your password";
        }
        setErrors(found);
        if (Object.keys(found).length > 0) {
            return;
        }
        try {
            const user = await login.mutateAsync({ email, password });
            toast.success(`Welcome back, ${firstName(user)}`);
        } catch (error) {
            setErrors(fieldErrorsFrom(error));
        }
    }

    return (
        <motion.form className="auth-form" onSubmit={handleSubmit} noValidate {...formMotion}>
            <div className="auth-form__intro">
                <h2 className="auth-form__title">
                    Welcome <em>back</em>
                </h2>
                <p className="muted">Log in to pick up right where your money left off.</p>
            </div>

            <Field icon={Mail} label="Email" error={errors.email}>
                <input type="email" value={email} onChange={edit(setEmail, "email")} autoComplete="email" placeholder="you@example.com" autoFocus aria-invalid={Boolean(errors.email)} />
            </Field>

            <Field icon={LockKeyhole} label="Password" error={errors.password}>
                <PasswordInput value={password} onChange={edit(setPassword, "password")} autoComplete="current-password" invalid={Boolean(errors.password)} />
            </Field>

            {errors.form && (
                <p className="form__error" role="alert">
                    {errors.form}
                </p>
            )}

            <motion.button type="submit" className="btn btn--primary btn--block btn--lg" disabled={login.isPending} whileTap={{ scale: 0.98 }}>
                <span>{login.isPending ? "Logging in…" : "Log in"}</span>
                {!login.isPending && <ArrowRight size={17} />}
            </motion.button>
        </motion.form>
    );
}

function SignupForm() {
    const toast = useToast();
    const signup = useSignup();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

    function edit(setter, field) {
        return (event) => {
            setter(event.target.value);
            setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
        };
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const found = {};
        if (!name.trim()) {
            found.name = "Tell us your name";
        }
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            found.email = "Enter a valid email address";
        }
        if (password.length < 8) {
            found.password = "Use at least 8 characters";
        }
        setErrors(found);
        if (Object.keys(found).length > 0) {
            return;
        }
        try {
            const user = await signup.mutateAsync({ name, email, password });
            toast.success(`Your space is ready, ${firstName(user)}`);
        } catch (error) {
            setErrors(fieldErrorsFrom(error));
        }
    }

    return (
        <motion.form className="auth-form" onSubmit={handleSubmit} noValidate {...formMotion}>
            <div className="auth-form__intro">
                <h2 className="auth-form__title">
                    Make it <em>yours</em>
                </h2>
                <p className="muted">Create an account in seconds. We'll set up starter categories for you.</p>
            </div>

            <Field icon={UserRound} label="Your name" error={errors.name}>
                <input value={name} onChange={edit(setName, "name")} autoComplete="name" placeholder="Ayesha Khan" maxLength={60} autoFocus aria-invalid={Boolean(errors.name)} />
            </Field>

            <Field icon={Mail} label="Email" error={errors.email}>
                <input type="email" value={email} onChange={edit(setEmail, "email")} autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
            </Field>

            <Field icon={LockKeyhole} label="Password" error={errors.password} hint={<StrengthMeter password={password} />}>
                <PasswordInput value={password} onChange={edit(setPassword, "password")} autoComplete="new-password" invalid={Boolean(errors.password)} />
            </Field>

            {errors.form && (
                <p className="form__error" role="alert">
                    {errors.form}
                </p>
            )}

            <motion.button type="submit" className="btn btn--primary btn--block btn--lg" disabled={signup.isPending} whileTap={{ scale: 0.98 }}>
                <span>{signup.isPending ? "Creating your space…" : "Create account"}</span>
                {!signup.isPending && <ArrowRight size={17} />}
            </motion.button>
        </motion.form>
    );
}

function DemoLogin() {
    const toast = useToast();
    const demo = useDemoLogin();

    async function handleClick() {
        try {
            await demo.mutateAsync();
            toast.success("You're exploring the demo account");
        } catch (error) {
            toast.error(error.message);
        }
    }

    return (
        <div className="demo-login">
            <span className="demo-login__divider">or</span>
            <motion.button type="button" className="btn btn--ghost btn--block demo-login__button" onClick={handleClick} disabled={demo.isPending} whileTap={{ scale: 0.98 }}>
                <Sparkles size={16} />
                <span>{demo.isPending ? "Opening the demo…" : "Continue with demo account"}</span>
            </motion.button>
            <p className="demo-login__note">Local development only — skips the password and opens the sample data.</p>
        </div>
    );
}

export default function AuthScreen() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isError: offline } = useHealth();

    if (location.pathname !== "/login" && location.pathname !== "/signup") {
        return <Navigate to="/login" replace />;
    }

    const mode = location.pathname === "/signup" ? "signup" : "login";

    return (
        <motion.div className="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.4 } }}>
            <Showcase />

            <section className="auth__panel">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, y: 30, scale: 0.97, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2 }}
                >
                    <div className="auth-card__brand">
                        <Logo size={34} />
                        <span className="sidebar__name">
                            Expense<em>Mate</em>
                        </span>
                    </div>

                    <AnimatePresence>
                        {offline && (
                            <motion.p className="offline-banner" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                <WifiOff size={16} />
                                <span>
                                    The server isn't responding. Run <code>npm run dev</code> in the <code>server</code> folder.
                                </span>
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <Segmented name="auth-mode" label="Log in or create an account" options={MODES} value={mode} onChange={(next) => navigate(next === "signup" ? "/signup" : "/login")} />

                    <AnimatePresence mode="wait" initial={false}>
                        {mode === "login" ? <LoginForm key="login" /> : <SignupForm key="signup" />}
                    </AnimatePresence>

                    {import.meta.env.DEV && <DemoLogin />}
                </motion.div>
                <p className="auth__footnote">Your data lives only in your ExpenseMate database and is visible to your account alone.</p>
            </section>
        </motion.div>
    );
}
