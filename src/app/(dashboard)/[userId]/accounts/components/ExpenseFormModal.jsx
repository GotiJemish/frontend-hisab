import { Modal, InputField, Select, Textarea } from "@/components/ui";
import { useState, useEffect } from "react";

export const EXPENSE_CATEGORIES = [
  { value: "", label: "Select Category" },
  { value: "rent", label: "Rent" },
  { value: "salary", label: "Salary" },
  { value: "utilities", label: "Utilities" },
  { value: "travel", label: "Travel" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "other", label: "Other Expense" },
];

export default function ExpenseFormModal({
  open,
  onClose,
  accounts = [],
  formData,
  setFormData,
  handleSubmit,
  loading,
}) {
  const [selectedAccountBalance, setSelectedAccountBalance] = useState(null);

  useEffect(() => {
    if (formData.account) {
      const acc = accounts.find((a) => a.id === formData.account);
      if (acc) {
        const formattedBalance = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(acc.balance);

        const dateObj = acc.updated_at ? new Date(acc.updated_at) : new Date();
        const formattedDate = dateObj.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });

        setSelectedAccountBalance({
          amount: formattedBalance,
          date: formattedDate,
        });
      } else {
        setSelectedAccountBalance(null);
      }
    } else {
      setSelectedAccountBalance(null);
    }
  }, [formData.account, accounts]);

  const accountOptions = [
    { value: "", label: "Select Account" },
    ...accounts.map((a) => ({ value: a.id, label: a.name })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Expense"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <InputField
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <Select
          label="Category"
          options={EXPENSE_CATEGORIES}
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        />

        <div>
          <Select
            label="Contact or Bank"
            options={accountOptions}
            value={formData.account}
            onChange={(e) =>
              setFormData({ ...formData, account: e.target.value })
            }
            required
          />
          {selectedAccountBalance && (
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              Balance {selectedAccountBalance.amount} as on {selectedAccountBalance.date}
            </p>
          )}
        </div>

        <InputField
          label="Amount"
          type="number"
          step="0.01"
          leftIcon={<span className="text-sm font-semibold text-gray-500">₹</span>}
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />

        <Textarea
          label="Notes"
          placeholder="Notes"
          maxLength={250}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
