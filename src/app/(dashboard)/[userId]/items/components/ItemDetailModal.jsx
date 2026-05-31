import { Modal, Btn } from "@/components/ui";
import { UNIT_TYPES, TAX_CATEGORIES } from "./ItemFormModal";

export default function ItemDetailModal({ open, onClose, viewingItem }) {
  if (!viewingItem) return null;

  return (
    <Modal open={open} onClose={onClose} title="Item Details" size="lg">
      <div className="space-y-4 pt-2 text-sm text-gray-700 dark:text-gray-300">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-900 dark:text-white block">Name</span>
            {viewingItem.name}
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white block">Type</span>
            <span className="capitalize">{viewingItem.type}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white block">Unit</span>
            {UNIT_TYPES.find(u => u.value === viewingItem.unit_type)?.label || viewingItem.unit_type}
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white block">Tax Category</span>
            {TAX_CATEGORIES.find(t => t.value === viewingItem.tax_category)?.label || viewingItem.tax_category}
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white block">Rate</span>
            ₹{parseFloat(viewingItem.rate).toFixed(2)}
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white block">Discount</span>
            ₹{parseFloat(viewingItem.discount).toFixed(2)}
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white block">SAC/HSN Code</span>
            {viewingItem.sac || "-"}
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white block">Rate Includes Tax?</span>
            {viewingItem.with_tax ? "Yes" : "No"}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Btn variant="primary" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </Modal>
  );
}
