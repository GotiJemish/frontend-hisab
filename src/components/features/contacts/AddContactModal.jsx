"use client";

import { useState } from "react";
import { Btn, InputField, Modal } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/context/LoadingContext";

/**
 * AddContactModal - Modal to create a new contact (Customer/Vendor)
 */
export default function AddContactModal({ open, onClose, onSuccess, initialName = "" }) {
  const { loading, setLoading } = useLoading();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: initialName,
    mobile: "",
    email: "",
    pan: "",
    gst: "",
    billing_address: "",
    billing_city: "",
    billing_state: "",
    billing_pincode: "",
    billing_country: "India",
    same_as_billing: true,
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_pincode: "",
    shipping_country: "India",
    payment_type: "receivable",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name is required");
    
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.mobile) payload.mobile = null;
      if (!payload.email) payload.email = null;

      const { data } = await apiClient.post("/contacts/", payload);
      if (data.success) {
        toast.success("Contact created successfully");
        onSuccess(data.data);
        onClose();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save contact";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Contact" size="3xl">
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Contact Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            placeholder="Full Name or Company"
          />
          <div className="flex gap-4">
            <InputField
              label="Mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              className="w-1/2"
            />
            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-1/2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="PAN Number"
            value={formData.pan}
            onChange={(e) => setFormData({...formData, pan: e.target.value.toUpperCase()})}
          />
          <InputField
            label="GST Number"
            value={formData.gst}
            onChange={(e) => setFormData({...formData, gst: e.target.value.toUpperCase()})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Billing Address</h3>
            <InputField
              label="Address"
              value={formData.billing_address}
              onChange={(e) => setFormData({...formData, billing_address: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-2">
              <InputField label="City" value={formData.billing_city} onChange={(e) => setFormData({...formData, billing_city: e.target.value})} />
              <InputField label="State" value={formData.billing_state} onChange={(e) => setFormData({...formData, billing_state: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Shipping Address</h3>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input type="checkbox" checked={formData.same_as_billing} onChange={(e) => setFormData({...formData, same_as_billing: e.target.checked})} className="rounded" />
                Same as Billing
              </label>
            </div>
            {!formData.same_as_billing && (
              <>
                <InputField
                  label="Address"
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="City" value={formData.shipping_city} onChange={(e) => setFormData({...formData, shipping_city: e.target.value})} />
                  <InputField label="State" value={formData.shipping_state} onChange={(e) => setFormData({...formData, shipping_state: e.target.value})} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Btn variant="outline" onClick={onClose} type="button">Cancel</Btn>
          <Btn variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Contact"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
