const prisma = require("./db");
const { hashPassword } = require("../src/utils/security");
const { DEMO_EMAIL } = require("../src/utils/demo");

const DEMO_USER = { name: "Demo User", email: DEMO_EMAIL, password: "demo-pass-2026" };

const CATEGORY_NAMES = ["Food", "Transport", "Bills", "Shopping", "Entertainment", "Salary", "Freelance"];

const TRANSACTIONS = [
    { type: "INCOME", amount: 15000000, date: "2026-08-01", note: "August salary", category: "Salary" },
    { type: "EXPENSE", amount: 1480000, date: "2026-08-07", note: "Electricity and gas", category: "Bills" },
    { type: "EXPENSE", amount: 1050000, date: "2026-08-10", note: "Monthly groceries", category: "Food" },
    { type: "EXPENSE", amount: 300000, date: "2026-08-12", note: "Fuel", category: "Transport" },
    { type: "EXPENSE", amount: 600000, date: "2026-08-22", note: "New shoes", category: "Shopping" },
    { type: "EXPENSE", amount: 300000, date: "2026-08-25", note: "Cinema", category: "Entertainment" },

    { type: "INCOME", amount: 15000000, date: "2026-09-01", note: "September salary", category: "Salary" },
    { type: "EXPENSE", amount: 450000, date: "2026-09-03", note: "Groceries", category: "Food" },
    { type: "EXPENSE", amount: 200000, date: "2026-09-05", note: "Fuel", category: "Transport" },
    { type: "EXPENSE", amount: 1200000, date: "2026-09-07", note: "Electricity bill", category: "Bills" },
    { type: "EXPENSE", amount: 350000, date: "2026-09-08", note: "Internet bill", category: "Bills" },
    { type: "EXPENSE", amount: 320000, date: "2026-09-10", note: "Restaurant", category: "Food" },
    { type: "INCOME", amount: 2500000, date: "2026-09-12", note: "Logo design project", category: "Freelance" },
    { type: "EXPENSE", amount: 250000, date: "2026-09-13", note: "Concert ticket", category: "Entertainment" },
    { type: "EXPENSE", amount: 900000, date: "2026-09-15", note: "Clothes", category: "Shopping" },
    { type: "EXPENSE", amount: 280000, date: "2026-09-18", note: "Groceries", category: "Food" },
    { type: "EXPENSE", amount: 150000, date: "2026-09-19", note: "Careem rides", category: "Transport" },
    { type: "EXPENSE", amount: 400000, date: "2026-09-21", note: "Gaming subscription", category: "Entertainment" },
    { type: "EXPENSE", amount: 150000, date: "2026-09-24", note: "Snacks", category: "Food" },
];

const BUDGETS = [
    { category: "Food", month: "2026-09", limitAmount: 1400000 },
    { category: "Transport", month: "2026-09", limitAmount: 800000 },
    { category: "Bills", month: "2026-09", limitAmount: 2000000 },
    { category: "Entertainment", month: "2026-09", limitAmount: 500000 },
];

async function main() {
    await prisma.budget.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
        data: {
            name: DEMO_USER.name,
            email: DEMO_USER.email,
            passwordHash: await hashPassword(DEMO_USER.password),
        },
    });

    const categoryIds = {};
    for (const name of CATEGORY_NAMES) {
        const category = await prisma.category.create({ data: { name, userId: user.id } });
        categoryIds[name] = category.id;
    }

    for (const t of TRANSACTIONS) {
        await prisma.transaction.create({
            data: {
                type: t.type,
                amount: t.amount,
                date: new Date(t.date),
                note: t.note,
                categoryId: categoryIds[t.category],
                userId: user.id,
            },
        });
    }

    for (const b of BUDGETS) {
        await prisma.budget.create({
            data: {
                month: b.month,
                limitAmount: b.limitAmount,
                categoryId: categoryIds[b.category],
                userId: user.id,
            },
        });
    }

    console.log(
        `Seeded ${DEMO_USER.email} with ${CATEGORY_NAMES.length} categories, ${TRANSACTIONS.length} transactions, ${BUDGETS.length} budgets`
    );
}

main()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());