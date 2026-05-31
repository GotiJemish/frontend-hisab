import { Modal, InputField, Btn } from "@/components/ui";

export default function AccountFormModal({
  open,
  onClose,
  editingAccount,
  formData,
  setFormData,
  handleSubmit,
  loading,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingAccount ? "Edit Account" : "Add New Account"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <InputField
          label="Account Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Khodal GST, SBI Bank, Cash"
          required
        />

        {!editingAccount && (
          <InputField
            label="Initial Balance"
            type="number"
            step="0.01"
            value={formData.initial_balance}
            onChange={(e) =>
              setFormData({ ...formData, initial_balance: e.target.value })
            }
            placeholder="0.00"
          />
        )}

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
            {loading ? "Saving..." : editingAccount ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
