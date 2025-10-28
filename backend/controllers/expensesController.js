const Expense = require("../models/Expense");

exports.getExpenses = async (req, res) => {
  const rows = await Expense.findAll();
  if (rows.length === 0) {
    return res.status(200).json({ message: "No expenses found" });
  }
  const orderedRows = rows.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.status(201).json(orderedRows);
};

exports.getExpenseById = async (req, res) => {
  const { id } = req.params;
  const expense = await Expense.findByPk(id);
  if (expense) {
    res.json(expense);
  } else {
    res.status(404).json({ message: "Expense not found" });
  }
};

exports.getExpensesByTripId = async (req, res) => {
  const { trip_id } = req.params;
  const expenses = await Expense.findAll({ where: { trip_id } });
  if (expenses.length > 0) {
    const orderedExpenses = expenses.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    res.json(orderedExpenses);
  } else {
    res.status(200).json({ message: "No expenses found for this trip" });
  }
};

exports.getExpensesByUserId = async (req, res) => {
  let { user_id } = req.params;
  if (!user_id) {
    user_id = req.user.userId;
  }
  const expenses = await Expense.findAll({ where: { user_id } });
  if (expenses.length > 0) {
    const orderedExpenses = expenses.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    res.json(orderedExpenses);
  } else {
    res.status(200).json({ message: "No expenses found for this user" });
  }
};

exports.createExpense = async (req, res) => {
  const { trip_id, category, amount, date, description, paid_by } = req.body;
  const expense = await Expense.create({
    trip_id,
    description,
    amount,
    paid_by,
    category,
    date,
  });
  res.status(201).json({ message: "Expense added successfully", expense });
};

exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { trip_id, category, amount, date, description, paid_by } = req.body;
  const expense = await Expense.findByPk(id);
  if (expense) {
    await expense.update({
      trip_id,
      description,
      amount,
      paid_by,
      category,
      date,
    });
    res.json({ message: "Expense updated successfully", expense });
  } else {
    res.status(404).json({ message: "Expense not found" });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  const expense = await Expense.findByPk(id);
  if (expense) {
    await expense.destroy();
    res.json({ message: "Expense deleted successfully" });
  } else {
    res.status(404).json({ message: "Expense not found" });
  }
};
