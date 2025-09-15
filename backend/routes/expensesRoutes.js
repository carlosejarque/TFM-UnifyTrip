const express = require('express');
const router = express.Router();

const {
  getExpenses,
  getExpenseById,
    getExpensesByTripId,
    getExpensesByUserId,
    createExpense,
    updateExpense,
    deleteExpense
} = require('../controllers/expensesController');

const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validateBody');
const { expenseSchema } = require('../schemas/expenseSchema');

router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.get('/trip/:trip_id', getExpensesByTripId);
router.get('/user/:user_id', authMiddleware, getExpensesByUserId);
router.post('/', authMiddleware, validateBody(expenseSchema), createExpense);
router.put('/:id', authMiddleware, validateBody(expenseSchema), updateExpense);
router.delete('/:id', authMiddleware, deleteExpense);

module.exports = router;