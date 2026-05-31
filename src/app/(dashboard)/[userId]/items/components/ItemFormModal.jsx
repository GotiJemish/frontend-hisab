import { Modal, InputField, Btn } from "@/components/ui";

export const ITEM_TYPES = [
  { value: "service", label: "Service" },
  { value: "product", label: "Product" },
  { value: "charge", label: "Charge" },
];

export const UNIT_TYPES = [
  { value: "Bags", label: "Bags" },
  { value: "Bottl", label: "Bottle" },
  { value: "Box", label: "Box" },
  { value: "Carat", label: "Carat" },
  { value: "Cent", label: "Cent" },
  { value: "Cm", label: "Cm" },
  { value: "Dozen", label: "Dozen" },
  { value: "Feet", label: "Feet" },
  { value: "Gram", label: "Gram" },
  { value: "Hrs", label: "Hours" },
  { value: "Kg", label: "Kilogram" },
  { value: "Ltr", label: "Litre" },
  { value: "Mg", label: "Milligram" },
  { value: "Mlt", label: "Millilitre" },
  { value: "Mm", label: "Millimetre" },
  { value: "Mtr", label: "Metre" },
  { value: "Pcs", label: "Pieces" },
  { value: "Tblet", label: "Tablet" },
  { value: "Tonne", label: "Tonne" },
];

export const TAX_CATEGORIES = [
  { value: "none", label: "None" },
  { value: "gst-0.25", label: "GST 0.25%" },
  { value: "gst-1", label: "GST 1%" },
  { value: "gst-3", label: "GST 3%" },
  { value: "gst-5", label: "GST 5%" },
  { value: "gst-12", label: "GST 12%" },
  { value: "gst-18", label: "GST 18%" },
  { value: "gst-28", label: "GST 28%" },
  { value: "nil-rated", label: "Nil Rated" },
  { value: "non-gst", label: "Non GST" },
  { value: "exempt", label: "Exempt" },
];

export default function ItemFormModal({
  open,
  onClose,
  editingItem,
  formData,
  setFormData,
  handleSubmit,
  loading
}) {
  return (
    <Modal open={open} onClose={onClose} title={editingItem ? "Edit Item" : "Add New Item"} size="2xl">
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Item Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 dark:text-gray-300">Type</label>
            <select
              className="rounded-xl border-[#E2E8F0] dark:border-[#1F2937] bg-white dark:bg-[#111827] text-sm focus:ring-[#2563EB] focus:border-[#2563EB]"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {ITEM_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 dark:text-gray-300">Unit</label>
            <select
              className="rounded-xl border-[#E2E8F0] dark:border-[#1F2937] bg-white dark:bg-[#111827] text-sm focus:ring-[#2563EB] focus:border-[#2563EB]"
              value={formData.unit_type}
              onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
            >
              {UNIT_TYPES.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 dark:text-gray-300">Tax Category</label>
            <select
              className="rounded-xl border-[#E2E8F0] dark:border-[#1F2937] bg-white dark:bg-[#111827] text-sm focus:ring-[#2563EB] focus:border-[#2563EB]"
              value={formData.tax_category}
              onChange={(e) => setFormData({ ...formData, tax_category: e.target.value })}
            >
              {TAX_CATEGORIES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <InputField
            label="Rate"
            type="number"
            step="0.01"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            required
          />
          <InputField
            label="Discount"
            type="number"
            step="0.01"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
          />
          <InputField
            label="SAC/HSN Code"
            type="number"
            value={formData.sac}
            onChange={(e) => setFormData({ ...formData, sac: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="with-tax"
            type="checkbox"
            className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] dark:border-[#1F2937] dark:bg-[#111827]"
            checked={formData.with_tax}
            onChange={(e) => setFormData({ ...formData, with_tax: e.target.checked })}
          />
          <label htmlFor="with-tax" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Rate includes Tax
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Btn variant="outline" onClick={onClose} type="button">Cancel</Btn>
          <Btn variant="primary" type="submit" disabled={loading}>
            {loading ? "Processing..." : (editingItem ? "Update Item" : "Save Item")}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
