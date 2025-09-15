const express = require('express');
const router = express.Router();

const {
    getExpenseParticipants,
    getExpenseParticipantById,
    getExpenseParticipantsByExpenseId,
    getExpenseParticipantsByUserId,
    getExpenseParticipantsPersonally,
    createExpenseParticipant,
    updateExpenseParticipant,
    deleteExpenseParticipant,
    deleteExpenseParticipantsByExpenseId
} = require('../controllers/expensesParticipantsController');

const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validateBody');
const { expenseParticipantSchema } = require('../schemas/expenseParticipantSchema');

router.get('/', getExpenseParticipants);
router.get('/personal', authMiddleware, getExpenseParticipantsPersonally);
router.get('/:id', getExpenseParticipantById);
router.get('/expense/:expense_id', getExpenseParticipantsByExpenseId);
router.get('/user/:user_id', getExpenseParticipantsByUserId);
router.post('/', authMiddleware, validateBody(expenseParticipantSchema), createExpenseParticipant);
router.put('/:id', authMiddleware, validateBody(expenseParticipantSchema), updateExpenseParticipant);
router.delete('/:id', authMiddleware, deleteExpenseParticipant);
router.delete('/expense/:expense_id', authMiddleware, deleteExpenseParticipantsByExpenseId);

module.exports = router;