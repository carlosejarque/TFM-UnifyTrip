const ExpenseParticipant = require('../models/ExpenseParticipant');

exports.getExpenseParticipants = async (req, res) => {
    const rows = await ExpenseParticipant.findAll();
    if (rows.length === 0) {
        return res.status(200).json({ message: 'No expense participants found' });  
    }
    res.status(201).json(rows);
}

exports.getExpenseParticipantById = async (req, res) => {
    const { id } = req.params;
    const expenseParticipant = await ExpenseParticipant.findByPk(id);
    if (expenseParticipant) {
        res.json(expenseParticipant);
    } else {
        res.status(404).json({ message: 'Expense participant not found' });
    }
}

exports.getExpenseParticipantsByExpenseId = async (req, res) => {
    const { expense_id } = req.params;
    const expenseParticipants = await ExpenseParticipant.findAll({ where: { expense_id } });
    if (expenseParticipants.length > 0) {
        res.json(expenseParticipants);
    } else {
        res.status(200).json({ message: 'No participants found for this expense' });
    }
}

exports.getExpenseParticipantsByUserId = async (req, res) => {
    const { user_id } = req.params;
    const expenseParticipants = await ExpenseParticipant.findAll({ where: { user_id } });
    if (expenseParticipants.length > 0) {
        res.json(expenseParticipants);
    } else {
        res.status(200).json({ message: 'No expense participants found for this user' });
    }
}

exports.getExpenseParticipantsPersonally = async (req, res) => {
    const user_id = req.user.userId;    
    const expenseParticipants = await ExpenseParticipant.findAll({ where: { user_id } });
    if (expenseParticipants.length > 0) {
        res.json(expenseParticipants);
    } else {
        res.status(200).json({ message: 'No expense participants found for this user' });
    }
}

exports.createExpenseParticipant = async (req, res) => {
    const { expense_id, user_id, share_amount } = req.body;
    const expenseParticipant = await ExpenseParticipant.create({
        expense_id,
        user_id,
        share_amount
    });
    res.status(201).json({ message: 'Expense participant added successfully', expenseParticipant });
}

exports.updateExpenseParticipant = async (req, res) => {
    const { id } = req.params;
    const { expense_id, user_id, share_amount } = req.body;
    const expenseParticipant = await ExpenseParticipant.findByPk(id);
    if (expenseParticipant) {
        await expenseParticipant.update({
            expense_id,
            user_id,
            share_amount
        });
        res.status(201).json({ message: 'Expense participant updated successfully', expenseParticipant });
    } else {
        res.status(404).json({ message: 'Expense participant not found' });
    }
}

exports.deleteExpenseParticipant = async (req, res) => {
    const { id } = req.params;
    const expenseParticipant = await ExpenseParticipant.findByPk(id);
    if (expenseParticipant) {
        await expenseParticipant.destroy();
        res.status(201).json({ message: 'Expense participant deleted successfully' });
    } else {
        res.status(404).json({ message: 'Expense participant not found' });
    }
}

exports.deleteExpenseParticipantsByExpenseId = async (req, res) => {
    const { expense_id } = req.params;
    const expenseParticipants = await ExpenseParticipant.findAll({ where: { expense_id } }); 
    if (expenseParticipants.length > 0) {
        await ExpenseParticipant.destroy({ where: { expense_id } });
        res.status(201).json({ message: 'Expense participants deleted successfully' });
    } else {
        res.status(404).json({ message: 'No expense participants found for this expense' });
    }
}