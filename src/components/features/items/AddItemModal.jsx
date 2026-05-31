"use client";

import { useState } from "react";
import { Btn, InputField, Modal } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/context/LoadingContext";

const ITEM_TYPES = [
  { value: "service", label: "Service" },
  { value: "product", label: "Product" },
  { value: "charge", label: "Charge" },
];

const UNIT_TYPES = [
  { value: "Bags", label: "Bags" },
  { value: "Bottl", label: "Bottle" },
  { value: "Box", label: "Box" },
  { value: "Pcs", label: "Pieces" },
  // ... (others can be added as needed)
];

const TAX_CATEGORIES = [
  { value: "none", label: "None" },
  { value: "gst-5", label: "GST 5%" },
  { value: "gst-12", label: "GST 12%" },
  { value: "gst-18", label: "GST 18%" },
  { value: "gst-28", label: "GST 28%" },
];

/**
 * AddItemModal - Modal to create a new item in the master list
 */
export default function AddItemModal({ open, onClose, onSuccess, initialName = "" }) {
  const { loading, setLoading } = useLoading();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: initialName,
    type: "service",
    unit_type: "Pcs",
    tax_category: "none",
    rate: "",
    discount: "",
    with_tax: false,
    sac: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        rate: parseFloat(formData.rate) || 0,
        discount: parseFloat(formData.discount) || 0,
        sac: parseInt(formData.sac, 10) || 0,
      };
      
      const res = await apiClient.post("/items/", payload);

      if (res.data.success) {
        toast.success("Item created successfully");
        onSuccess(res.data.data); // Pass back the new item
        onClose();
      }
    } catch (err) {
      const resp = err.response?.data;
      toast.error(resp?.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Item" size="2xl">
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

        <div className="flex justify-end gap-3 mt-6">
          <Btn variant="outline" onClick={onClose} type="button">Cancel</Btn>
          <Btn variant="primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Item"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
