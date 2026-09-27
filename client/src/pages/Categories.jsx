import { useMemo, useState } from "react";
import { useConfirm } from "../hooks/useConfirm";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Tags, Trash2 } from "lucide-react";
import Page from "../components/Page";
import Card from "../components/Card";
import CategoryAvatar from "../components/CategoryAvatar";
import { useToast } from "../components/Toasts";
import { EmptyState, ErrorNotice, Skeleton } from "../components/Feedback";
import { useMonth } from "../context/MonthContext";
import { fieldErrorsFrom } from "../lib/api";
import { colorFor, formatMoney, monthName } from "../lib/format";
import { useBreakdown, useCategories, useCreateCategory, useDeleteCategory } from "../lib/queries";
import { EASE_OUT } from "../lib/motion";

function CategoryTile({ category, spent, earned, index }) {
    const toast = useToast();
    const deleteCategory = useDeleteCategory();
    const [confirming, setConfirming] = useConfirm();

    async function handleDelete() {
        if (!confirming) {
            setConfirming(true);
            return;
        }
        try {
            await deleteCategory.mutateAsync(category.id);
            toast.success(`${category.name} deleted`);
        } catch (error) {
            toast.error(error.message);
            setConfirming(false);
        }
    }

    return (
        <motion.article
            layout
            className="category"
            style={{ "--accent": colorFor(category.id) }}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)", transition: { duration: 0.22 } }}
            transition={{ duration: 0.6, delay: index * 0.04, ease: EASE_OUT }}
            whileHover={{ y: -4 }}
        >
            <div className="category__head">
                <CategoryAvatar category={category} size={42} />
                <button
                    type="button"
                    className={`icon-btn icon-btn--sm${confirming ? " icon-btn--danger is-confirming" : ""}`}
                    aria-label={confirming ? "Click again to delete category" : `Delete ${category.name}`}
                    onClick={handleDelete}
                    disabled={deleteCategory.isPending}
                >
                    <Trash2 size={15} />
                    {confirming && <span className="icon-btn__confirm">Delete?</span>}
                </button>
            </div>
            <h3 className="category__name">{category.name}</h3>
            <dl className="category__stats">
                <div>
                    <dt>Spent</dt>
                    <dd className={spent ? "is-expense" : "muted"}>{spent ? formatMoney(spent) : "—"}</dd>
                </div>
                <div>
                    <dt>Earned</dt>
                    <dd className={earned ? "is-income" : "muted"}>{earned ? formatMoney(earned) : "—"}</dd>
                </div>
            </dl>
        </motion.article>
    );
}

export default function Categories() {
    const { month } = useMonth();
    const toast = useToast();
    const { data: categories = [], isLoading, isError, error } = useCategories();
    const { data: expenses = [] } = useBreakdown(month, "EXPENSE");
    const { data: income = [] } = useBreakdown(month, "INCOME");
    const createCategory = useCreateCategory();
    const [name, setName] = useState("");
    const [formError, setFormError] = useState("");

    const spentById = useMemo(() => new Map(expenses.map((row) => [row.categoryId, row.total])), [expenses]);
    const earnedById = useMemo(() => new Map(income.map((row) => [row.categoryId, row.total])), [income]);

    async function handleSubmit(event) {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setFormError("Give the category a name");
            return;
        }
        setFormError("");
        try {
            await createCategory.mutateAsync(trimmed);
            toast.success(`${trimmed} added`);
            setName("");
        } catch (createError) {
            const fields = fieldErrorsFrom(createError);
            setFormError(fields.name ?? fields.form);
        }
    }

    return (
        <Page>
            <div className="grid">
                <Card className="span-12 category-form">
                    <div>
                        <p className="eyebrow">New category</p>
                        <h3 className="card__title">
                            Give your money <em>a place to go</em>
                        </h3>
                    </div>
                    <form className="inline-form" onSubmit={handleSubmit} noValidate>
                        <div className="field inline-form__field">
                            <input
                                className={`input${formError ? " has-error" : ""}`}
                                placeholder="e.g. Health, Education, Travel"
                                maxLength={50}
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                aria-label="Category name"
                                aria-invalid={Boolean(formError)}
                            />
                            {formError && <span className="field__error">{formError}</span>}
                        </div>
                        <button type="submit" className="btn btn--primary" disabled={createCategory.isPending}>
                            <Plus size={16} />
                            <span>{createCategory.isPending ? "Adding…" : "Add category"}</span>
                        </button>
                    </form>
                </Card>

                <div className="span-12">
                    <p className="section-note">
                        Activity shown for <strong>{monthName(month)}</strong>. Categories with transactions can't be deleted.
                    </p>
                    {isError && <ErrorNotice error={error} />}
                    {isLoading && (
                        <div className="category-grid">
                            {[0, 1, 2, 3].map((key) => (
                                <Skeleton key={key} height={170} radius={22} />
                            ))}
                        </div>
                    )}
                    {!isLoading && !isError && categories.length === 0 && (
                        <Card>
                            <EmptyState icon={Tags} title="No categories yet" text="Create categories like Food, Bills or Salary to start organising your money." />
                        </Card>
                    )}
                    <div className="category-grid">
                        <AnimatePresence>
                            {categories.map((category, index) => (
                                <CategoryTile
                                    key={category.id}
                                    category={category}
                                    index={index}
                                    spent={spentById.get(category.id) ?? 0}
                                    earned={earnedById.get(category.id) ?? 0}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </Page>
    );
}
