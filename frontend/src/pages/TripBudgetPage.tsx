import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./TripBudgetPage.module.css";
import {
  Plus,
  Trash2,
  Users,
  Euro,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;

type Participant = {
  id: number;
  username: string;
  trip_id: number;
};

type Expense = {
  id: number;
  description: string;
  amount: number;
  paid_by: string;
  category: string;
  date: string;
  trip_id: number;
  participants: string[];
};

type ExpenseFormData = {
  description: string;
  amount: string;
  paid_by: string;
  category: string;
  participants: string[];
};

type Balance = {
  username: string;
  balance: number;
};

type Settlement = {
  from: string;
  to: string;
  amount: number;
};

export function TripBudgetPage() {
  const { id } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [personalExpense, setPersonalExpense] = useState<number>(0);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    paid_by: "",
    category: "Otros",
    participants: [] as string[],
  });

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editFormData, setEditFormData] = useState({
    description: "",
    amount: "",
    paid_by: "",
    category: "Otros",
    participants: [] as string[],
  });

  const [expenseToDelete, setExpenseToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const categories = [
    "Comida",
    "Transporte",
    "Alojamiento",
    "Actividades",
    "Compras",
    "Entretenimiento",
    "Otros",
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      try {
        const participantsResponse = await axios.get(
          `${API_URL}/trip-participants/trip/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const participantsWithUserInfo: Participant[] = [];

        for (const participant of participantsResponse.data) {
          try {
            const userResponse = await axios.get(
              `${API_URL}/users/${participant.user_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            participantsWithUserInfo.push({
              id: participant.user_id,
              username:
                userResponse.data.username ||
                userResponse.data.name ||
                `Usuario${participant.user_id}`,
              trip_id: participant.trip_id,
            });
          } catch (userError) {
            participantsWithUserInfo.push({
              id: participant.user_id,
              username: `Usuario${participant.user_id}`,
              trip_id: participant.trip_id,
            });
          }
        }

        setParticipants(participantsWithUserInfo);

        try {
          const expensesResponse = await axios.get(
            `${API_URL}/expenses/trip/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (Array.isArray(expensesResponse.data)) {
            const processedExpenses = await Promise.all(
              expensesResponse.data.map(async (expense: any) => {
                const paidByUser = participantsWithUserInfo.find(
                  (p) => p.id === expense.paid_by
                );
                const paidByUsername =
                  paidByUser?.username || `Usuario${expense.paid_by}`;

                let expenseParticipants: string[] = [];
                try {
                  const participantsResponse = await axios.get(
                    `${API_URL}/expense-participants/expense/${expense.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  
                  expenseParticipants = participantsResponse.data.map((ep: any) => {
                    const participant = participantsWithUserInfo.find(p => p.id === ep.user_id);
                    return participant?.username || `Usuario${ep.user_id}`;
                  });
                } catch {
                  expenseParticipants = participantsWithUserInfo.map((p) => p.username);
                }

                return {
                  id: expense.id,
                  description: expense.description,
                  amount: parseFloat(expense.amount),
                  paid_by: paidByUsername,
                  category: expense.category,
                  date: expense.date,
                  trip_id: expense.trip_id,
                  participants: expenseParticipants,
                };
              })
            );

            setExpenses(processedExpenses);
            
            try {
              const personalExpenseResponse = await axios.get(
                `${API_URL}/expense-participants/personal`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              const currentTripExpenseIds = processedExpenses.map((expense: Expense) => expense.id);
              const filteredPersonalExpenses = personalExpenseResponse.data.filter(
                (item: {expense_id: number; share_amount: string}) => currentTripExpenseIds.includes(item.expense_id)
              );

              const totalPersonalExpense = filteredPersonalExpenses.reduce(
                (total: number, item: {expense_id: number; share_amount: string}) =>
                  total + parseFloat(item.share_amount || '0'),
                0
              );

              setPersonalExpense(totalPersonalExpense);
            } catch {
              setPersonalExpense(0);
            }
          } else if (expensesResponse.data.message === "No expenses found") {
            setExpenses([]);
          } else {
            setExpenses([]);
          }
        } catch (expensesError) {
          setExpenses([]);

          if (axios.isAxiosError(expensesError) && expensesError.response) {
            console.error("📄 Response data:", expensesError.response.data);
            console.error("📊 Response status:", expensesError.response.status);
          }

          toast.error("❌ Error al cargar los gastos del viaje");
        }

        setLoading(false);
      } catch {
        setExpenses([]);
        setLoading(false);
      }
    } catch {
      setError("No se pudieron cargar los datos.");
      setLoading(false);
    }
  }, [id]);

  const resetFormData = () => {
    setFormData({
      description: "",
      amount: "",
      paid_by: "",
      category: "Otros",
      participants: [],
    });
  };

  const resetEditFormData = () => {
    setEditFormData({
      description: "",
      amount: "",
      paid_by: "",
      category: "Otros",
      participants: [],
    });
  };

  const handleApiError = (error: unknown, action: string) => {
    if (axios.isAxiosError(error) && error.response) {
      console.error("📄 Response data:", error.response.data);
      console.error("📊 Response status:", error.response.status);
    }
    toast.error(`❌ Error ${action}. Inténtalo de nuevo.`);
  };

  const validateExpenseForm = (data: ExpenseFormData): boolean => {
    if (!data.description || !data.amount || !data.paid_by || data.participants.length === 0) {
      toast.error("Por favor, completa todos los campos obligatorios.");
      return false;
    }
    return true;
  };

  const processExpenseData = (data: ExpenseFormData) => {
    const paidByUserId = parseInt(data.paid_by);
    const paidByUser = participants.find((p) => p.id === paidByUserId);
    const paidByUsername = paidByUser?.username || "Usuario desconocido";

    return {
      description: data.description,
      amount: parseFloat(data.amount),
      paid_by: paidByUsername,
      category: data.category,
      date: new Date().toISOString(),
      trip_id: parseInt(id!),
      participants: data.participants,
    };
  };

  const calculateBalancesAndSettlements = useCallback(() => {
    if (participants.length === 0 || expenses.length === 0) {
      setBalances([]);
      setSettlements([]);
      return;
    }

    const paidByUser: { [username: string]: number } = {};
    participants.forEach(participant => {
      paidByUser[participant.username] = 0;
    });

    expenses.forEach(expense => {
      if (expense.paid_by in paidByUser) {
        paidByUser[expense.paid_by] += expense.amount;
      }
    });

    const shouldPay: { [username: string]: number } = {};
    participants.forEach(participant => {
      shouldPay[participant.username] = 0;
    });

    expenses.forEach(expense => {
      const sharePerPerson = expense.amount / expense.participants.length;
      expense.participants.forEach(participantUsername => {
        if (participantUsername in shouldPay) {
          shouldPay[participantUsername] += sharePerPerson;
        }
      });
    });

    const calculatedBalances: Balance[] = participants.map(participant => {
      const balance = paidByUser[participant.username] - shouldPay[participant.username];
      
      return {
        username: participant.username,
        balance: balance
      };
    });
    
    const sortedBalances = calculatedBalances.sort((a, b) => b.balance - a.balance);
    
    setBalances(sortedBalances);

    const debtors = sortedBalances
      .filter(b => b.balance < 0)
      .map(b => ({ ...b }));
    const creditors = sortedBalances
      .filter(b => b.balance > 0)
      .map(b => ({ ...b }));
    const calculatedSettlements: Settlement[] = [];

    const debtorsCopy = [...debtors];
    const creditorsCopy = [...creditors];

    while (debtorsCopy.length > 0 && creditorsCopy.length > 0) {
      const debtor = debtorsCopy[0];
      const creditor = creditorsCopy[0];

      const debtAmount = Math.abs(debtor.balance);
      const creditAmount = creditor.balance;

      if (debtAmount <= creditAmount) {
        calculatedSettlements.push({
          from: debtor.username,
          to: creditor.username,
          amount: debtAmount
        });

        creditor.balance -= debtAmount;
        debtorsCopy.shift();
        
        if (creditor.balance === 0) {
          creditorsCopy.shift();
        }
      } else {
        calculatedSettlements.push({
          from: debtor.username,
          to: creditor.username,
          amount: creditAmount
        });

        debtor.balance += creditAmount;
        creditorsCopy.shift();
      }
    }

    setSettlements(calculatedSettlements);
  }, [participants, expenses]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    calculateBalancesAndSettlements();
  }, [calculateBalancesAndSettlements]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateExpenseForm(formData)) {
      return;
    }

    try {
      const expenseData = processExpenseData(formData);

      const newExpense: Expense = {
        ...expenseData,
        id: Date.now(),
      };

      setExpenses((prev) => [...prev, newExpense]);
      resetFormData();
      setShowAddForm(false);

      toast.success(`💰 Gasto "${formData.description}" añadido correctamente`);

      const token = localStorage.getItem("token");
      const savedExpenseResponse = await axios.post(
        `${API_URL}/expenses/`,
        {
          trip_id: parseInt(id!),
          description: formData.description,
          amount: parseFloat(formData.amount),
          paid_by: formData.paid_by,
          category: formData.category,
          date: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const expenseId =
        savedExpenseResponse.data.expense?.id || savedExpenseResponse.data.id;

      if (!expenseId) {
        toast.error("❌ Error: No se pudo obtener el ID del gasto");
        return;
      }

      const shareAmount =
        parseFloat(formData.amount) / formData.participants.length;

      const participantPromises = formData.participants.map(
        async (participantUsername) => {
          const participant = participants.find(
            (p) => p.username === participantUsername
          );

          if (!participant) {
            return;
          }

          await axios.post(
            `${API_URL}/expense-participants/`,
            {
              expense_id: expenseId,
              user_id: participant.id,
              share_amount: shareAmount,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      );

      await Promise.all(participantPromises);
      fetchData();
    } catch (err) {
      handleApiError(err, "al añadir el gasto");
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) return;

    setExpenseToDelete({
      id: expenseId,
      name: expense.description,
    });
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;

    try {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete.id));

      const token = localStorage.getItem("token");

      try {
        await axios.delete(
          `${API_URL}/expense-participants/expense/${expenseToDelete.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch {
        // Continue with expense deletion even if this fails
      }
      
      await axios.delete(
        `${API_URL}/expenses/${expenseToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`"${expenseToDelete.name}" eliminado correctamente`);

      fetchData();
    } catch (err) {
      handleApiError(err, "al eliminar el gasto");
    } finally {
      setExpenseToDelete(null);
    }
  };

  const cancelDeleteExpense = () => {
    setExpenseToDelete(null);
  };

  const handleParticipantToggle = (username: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(username)
        ? prev.participants.filter((p) => p !== username)
        : [...prev.participants, username],
    }));
  };

  const handleEditExpense = (expense: Expense) => {
    const paidByUser = participants.find((p) => p.username === expense.paid_by);

    setEditingExpense(expense);
    setEditFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      paid_by: paidByUser?.id.toString() || "",
      category: expense.category,
      participants: expense.participants,
    });
    setShowEditForm(true);
  };

  const handleEditParticipantToggle = (username: string) => {
    setEditFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(username)
        ? prev.participants.filter((p) => p !== username)
        : [...prev.participants, username],
    }));
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateExpenseForm(editFormData) || !editingExpense) {
      return;
    }

    try {
      const expenseData = processExpenseData(editFormData);

      // Actualizar en el estado local
      const updatedExpense: Expense = {
        ...editingExpense,
        description: editFormData.description,
        amount: parseFloat(editFormData.amount),
        paid_by: expenseData.paid_by,
        category: editFormData.category,
        participants: editFormData.participants,
      };

      setExpenses((prev) =>
        prev.map((exp) => (exp.id === editingExpense.id ? updatedExpense : exp))
      );

      resetEditFormData();
      setEditingExpense(null);
      setShowEditForm(false);

      toast.success(
        `✏️ Gasto "${editFormData.description}" actualizado correctamente`
      );

      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/expenses/${editingExpense.id}`,
        {
          trip_id: parseInt(id!),
          description: editFormData.description,
          amount: parseFloat(editFormData.amount),
          paid_by: editFormData.paid_by,
          category: editFormData.category,
          date: editingExpense.date,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      try {
        await axios.delete(
          `${API_URL}/expense-participants/expense/${editingExpense.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (deleteError) {
        console.warn("No se pudieron eliminar los participantes anteriores:", deleteError);
      }

      const shareAmount = parseFloat(editFormData.amount) / editFormData.participants.length;

      const participantPromises = editFormData.participants.map(
        async (participantUsername) => {
          const participant = participants.find(
            (p) => p.username === participantUsername
          );

          if (!participant) {
            console.warn(`Participante no encontrado: ${participantUsername}`);
            return;
          }

          try {
            await axios.post(
              `${API_URL}/expense-participants/`,
              {
                expense_id: editingExpense.id,
                user_id: participant.id,
                share_amount: shareAmount,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (participantError) {
            console.error(`Error al añadir participante ${participantUsername}:`, participantError);
            throw participantError;
          }
        }
      );

      await Promise.all(participantPromises);

      fetchData(); // Refresh data from server
    } catch (err) {
      handleApiError(err, "al actualizar el gasto");
    }
  };

  const cancelEditExpense = () => {
    resetEditFormData();
    setEditingExpense(null);
    setShowEditForm(false);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals = new Map<string, number>();
    expenses.forEach((expense) => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + expense.amount);
    });
    return Array.from(categoryTotals.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));
  };

  if (loading)
    return (
      <div className={styles.loading}>Cargando datos del presupuesto...</div>
    );
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Gastos del Viaje</h2>
        <button
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={20} />
          Añadir Gasto
        </button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Euro size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Total Gastado</h3>
            <p className={styles.amount}>€{getTotalExpenses().toFixed(2)}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Users size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Participantes</h3>
            <p className={styles.amount}>{participants.length}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Gasto Personal</h3>
            <p className={styles.amount}>€{personalExpense.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Expenses List */}
        <div className={styles.section}>
          <h3>Lista de Gastos</h3>
          {expenses.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No hay gastos registrados aún.</p>
              <button
                className={styles.emptyButton}
                onClick={() => setShowAddForm(true)}
              >
                Añadir primer gasto
              </button>
            </div>
          ) : (
            <div className={styles.expensesList}>
              {expenses.map((expense) => (
                <div key={expense.id} className={styles.expenseItem}>
                  <div
                    className={styles.expenseInfo}
                    onClick={() => handleEditExpense(expense)}
                    style={{ cursor: "pointer" }}
                    title="Click para editar este gasto"
                  >
                    <h4>{expense.description}</h4>
                    <div className={styles.expenseDetails}>
                      <span className={styles.category}>
                        {expense.category}
                      </span>
                      <span className={styles.paidBy}>
                        Pagado por: {expense.paid_by}
                      </span>
                      <span className={styles.participants}>
                        Participantes: {expense.participants.join(", ")}
                      </span>
                      <span className={styles.date}>
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.expenseAmount}>
                    <span>€{expense.amount.toFixed(2)}</span>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Balances */}
        <div className={styles.section}>
          <h3>Balances</h3>
          <div className={styles.balancesList}>
            {balances.map((balance) => {
              return (
                <div key={balance.username} className={styles.balanceItem}>
                  <span className={styles.username}>{balance.username}</span>
                  <span 
                    className={`${styles.balanceAmount} ${
                      balance.balance > 0 ? styles.positive : 
                      balance.balance < 0 ? styles.negative : styles.neutral
                    }`}
                  >
                    {balance.balance > 0 && <TrendingUp size={16} />}
                    {balance.balance < 0 && <TrendingDown size={16} />}
                    {balance.balance === 0 
                      ? "€0.00" 
                      : balance.balance > 0 
                        ? `+€${balance.balance.toFixed(2)}` 
                        : `-€${Math.abs(balance.balance).toFixed(2)}`
                    }
                    {balance.balance > 0 && " (a recibir)"}
                    {balance.balance < 0 && " (debe)"}
                    {balance.balance === 0 && " (equilibrado)"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settlements */}
        {settlements.length > 0 && (
          <div className={styles.section}>
            <h3>Liquidaciones Sugeridas</h3>
            <div className={styles.settlementsList}>
              {settlements.map((settlement, index) => (
                <div key={index} className={styles.settlementItem}>
                  <span className={styles.settlementText}>
                    <strong>{settlement.from}</strong> debe pagar{" "}
                    <strong>€{settlement.amount.toFixed(2)}</strong> a{" "}
                    <strong>{settlement.to}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Breakdown */}
        {expenses.length > 0 && (
          <div className={styles.section}>
            <h3>Gastos por Categoría</h3>
            <div className={styles.categoriesList}>
              {getExpensesByCategory().map(({ category, amount }) => (
                <div key={category} className={styles.categoryItem}>
                  <span className={styles.categoryName}>{category}</span>
                  <span className={styles.categoryAmount}>€{amount.toFixed(2)}</span>
                  <div className={styles.categoryBar}>
                    <div 
                      className={styles.categoryBarFill}
                      style={{ 
                        width: `${(amount / getTotalExpenses()) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Añadir Nuevo Gasto</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddExpense} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="description">Descripción *</label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Ej: Cena en restaurante"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="amount">Cantidad (€) *</label>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="category">Categoría</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="paid_by">Pagado por *</label>
                <select
                  id="paid_by"
                  value={formData.paid_by}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paid_by: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Seleccionar persona</option>
                  {participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Participantes que dividen el gasto *</label>
                <div className={styles.participantsGrid}>
                  {participants.map((participant) => (
                    <label
                      key={participant.id}
                      className={styles.participantCheckbox}
                    >
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(
                          participant.username
                        )}
                        onChange={() =>
                          handleParticipantToggle(participant.username)
                        }
                      />
                      <span>{participant.username}</span>
                    </label>
                  ))}
                </div>
                {formData.participants.length === 0 && (
                  <p className={styles.error}>
                    Selecciona al menos un participante
                  </p>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.submitButton}>
                  Añadir Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditForm && editingExpense && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Editar Gasto</h3>
              <button
                className={styles.closeButton}
                onClick={cancelEditExpense}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateExpense} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="edit-description">Descripción *</label>
                <input
                  type="text"
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Ej: Cena en restaurante"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-amount">Cantidad (€) *</label>
                  <input
                    type="number"
                    id="edit-amount"
                    step="0.01"
                    min="0"
                    value={editFormData.amount}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit-category">Categoría</label>
                  <select
                    id="edit-category"
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-paid_by">Pagado por *</label>
                <select
                  id="edit-paid_by"
                  value={editFormData.paid_by}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      paid_by: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Seleccionar persona</option>
                  {participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Participantes que dividen el gasto *</label>
                <div className={styles.participantsGrid}>
                  {participants.map((participant) => (
                    <label
                      key={participant.id}
                      className={styles.participantCheckbox}
                    >
                      <input
                        type="checkbox"
                        checked={editFormData.participants.includes(
                          participant.username
                        )}
                        onChange={() =>
                          handleEditParticipantToggle(participant.username)
                        }
                      />
                      <span>{participant.username}</span>
                    </label>
                  ))}
                </div>
                {editFormData.participants.length === 0 && (
                  <p className={styles.error}>
                    Selecciona al menos un participante
                  </p>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={cancelEditExpense}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.submitButton}>
                  Actualizar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={!!expenseToDelete}
        onOpenChange={(open) => !open && cancelDeleteExpense()}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.dialogContent}>
            <Dialog.Title className={styles.dialogTitle}>
              🗑️ Eliminar Gasto
            </Dialog.Title>

            <div className={styles.dialogBody}>
              <p>
                ¿Estás seguro de que quieres eliminar el gasto{" "}
                <strong>"{expenseToDelete?.name}"</strong>?
              </p>
              <p className={styles.dialogWarning}>
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className={styles.dialogActions}>
              <Dialog.Close asChild>
                <button type="button" className={styles.dialogCancelButton}>
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="button"
                className={styles.dialogDeleteButton}
                onClick={confirmDeleteExpense}
              >
                Eliminar
              </button>
            </div>

            <Dialog.Close asChild>
              <button className={styles.dialogCloseButton} aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
