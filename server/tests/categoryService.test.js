jest.mock("../src/repositories/categoryRepository");

const categoryRepository = require("../src/repositories/categoryRepository");
const categoryService = require("../src/services/categoryServices");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("createCategory", () => {
    it("creates the category when the name is new", async () => {
        categoryRepository.findByName.mockResolvedValue(null);
        categoryRepository.create.mockResolvedValue({ id: 1, name: "Food" });

        const result = await categoryService.createCategory(1, "Food");

        expect(result).toEqual({ id: 1, name: "Food" });
        expect(categoryRepository.create).toHaveBeenCalledWith({ userId: 1, name: "Food" });
    });

    it("throws 409 when the name already exists", async () => {
        categoryRepository.findByName.mockResolvedValue({ id: 1, name: "Food" });

        await expect(categoryService.createCategory(1, "Food")).rejects.toMatchObject({ statusCode: 409 });
        expect(categoryRepository.create).not.toHaveBeenCalled();
    });
});

describe("deleteCategory", () => {
    it("throws 404 when the category does not exist", async () => {
        categoryRepository.findById.mockResolvedValue(null);

        await expect(categoryService.deleteCategory(1, 99)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws 409 when the category has transactions", async () => {
        categoryRepository.findById.mockResolvedValue({ id: 1, name: "Food" });
        categoryRepository.countTransactions.mockResolvedValue(3);

        await expect(categoryService.deleteCategory(1, 1)).rejects.toMatchObject({ statusCode: 409 });
        expect(categoryRepository.remove).not.toHaveBeenCalled();
    });

    it("deletes the category when it is unused", async () => {
        categoryRepository.findById.mockResolvedValue({ id: 1, name: "Food" });
        categoryRepository.countTransactions.mockResolvedValue(0);

        await categoryService.deleteCategory(1, 1);

        expect(categoryRepository.remove).toHaveBeenCalledWith(1);
    });
});