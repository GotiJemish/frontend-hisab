"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Trash2, Edit2, CheckCircle2, X } from "lucide-react";
import { Btn, InputField, Select, Textarea, Table, Modal, AppSelect } from "@/components/ui";
import { useLoading } from "@/context/LoadingContext";
import { useToast } from "@/context/ToastContext";
import apiClient from "@/utilities/apiClients";
import AddItemMasterModal from "@/components/features/items/AddItemModal";
import AddContactModal from "@/components/features/contacts/AddContactModal";

/**
 * AddItemModal Content
 * Handles the logic for adding a single item with complex calculations
 */
/**
 * LineItemForm Content
 * Handles the logic for adding a single line item to the invoice
 */
function LineItemForm({ onAdd, onClose }) {
  const [item, setItem] = useState({
    name: "",
    qty: 1.0,
    rate: 0.0,
    discount: 0.0,
    discountType: "amount", // "percent" or "amount"
    description: "",
    itemId: null,
  });

  const [masterItems, setMasterItems] = useState([]);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [tempItemName, setTempItemName] = useState("");
  const toast = useToast();

  const fetchMasterItems = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/items/");
      if (data.success) {
        setMasterItems(data.data.map(i => ({ 
          value: i.id, 
          label: i.name,
          rate: i.rate,
          tax: i.tax_category,
          type: i.type
        })));
      }
    } catch (err) {
      console.error("Failed to load master items", err);
    }
  }, []);

  useEffect(() => {
    fetchMasterItems();
  }, [fetchMasterItems]);

  const [errors, setErrors] = useState({});

  const qty = parseFloat(item.qty) || 0;
  const rate = parseFloat(item.rate) || 0;
  const subtotal = qty * rate;

  let discountValue = 0;
  if (item.discountType === "percent") {
    discountValue = (subtotal * (parseFloat(item.discount) || 0)) / 100;
  } else {
    discountValue = (parseFloat(item.discount) || 0) * qty;
  }

  const total = subtotal - discountValue;

  const handleAdd = () => {
    if (!item.name) {
      setErrors({ name: "Required" });
      return;
    }
    onAdd({
      ...item,
      id: Date.now(),
      total: total,
    });
    onClose();
  };

  const handleCreateNewItem = (name) => {
    setTempItemName(name);
    setIsMasterModalOpen(true);
  };

  const handleMasterItemCreated = (newItem) => {
    const option = { 
      value: newItem.id, 
      label: newItem.name,
      rate: newItem.rate,
      tax: newItem.tax_category
    };
    setMasterItems(prev => [...prev, option]);
    setItem({ 
      ...item, 
      name: newItem.name, 
      itemId: newItem.id,
      rate: newItem.rate 
    });
    setErrors({});
  };

  return (
    <div className="space-y-6 pt-2">
      <AddItemMasterModal 
        open={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        onSuccess={handleMasterItemCreated}
        initialName={tempItemName}
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold mb-1 dark:text-gray-300 block">Items Name or Code*</label>
          <button 
            type="button" 
            onClick={() => handleCreateNewItem("")}
            className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#3B82F6] dark:hover:text-[#60A5FA] flex items-center gap-1 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Create New Item
          </button>
        </div>
        <AppSelect
          placeholder="Search or Create Item..."
          options={masterItems}
          value={masterItems.find(o => o.label === item.name) || (item.name ? { label: item.name, value: item.itemId } : null)}
          formatOptionLabel={(opt) => (
            <div className="flex justify-between items-center w-full">
              <span className="font-medium">{opt.label}</span>
              <div className="flex items-center gap-3 text-[10px] uppercase font-bold">
                <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">₹{opt.rate}</span>
                <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{opt.type}</span>
              </div>
            </div>
          )}
          onChange={(opt) => {
            if (opt) {
              setItem({ 
                ...item, 
                name: opt.label, 
                itemId: opt.value,
                rate: opt.rate || item.rate
              });
              setErrors({});
            } else {
              setItem({ ...item, name: "", itemId: null });
            }
          }}
          onCreateOption={handleCreateNewItem}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Row 1: Qty x Rate = Result */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <InputField
            label="Qty*"
            type="number"
            value={item.qty}
            onChange={(e) => setItem({ ...item, qty: e.target.value })}
          />
        </div>
        <div className="pt-6 text-[#94A3B8] text-xl">×</div>
        <div className="flex-1 relative">
          <InputField
            label="Rate (Without Tax)*"
            type="number"
            value={item.rate}
            onChange={(e) => setItem({ ...item, rate: e.target.value })}
            leftIcon={<span className="text-xs">₹</span>}
          />
        </div>
        <div className="pt-6 text-[#94A3B8] text-xl">＝</div>
        <div className="pt-6 flex-1 flex items-center justify-between min-w-[100px]">
          <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">₹ {subtotal.toFixed(2)}</span>
          <Edit2 className="h-4 w-4 text-[#94A3B8] cursor-pointer hover:text-[#0EA5E9]" />
        </div>
      </div>

      {/* Row 2: Discount = Result */}
      <div className="flex items-center gap-4 pl-20">
        <div className="flex-1 relative">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 scale-90">
            <button
              type="button"
              className={`px-2 py-0.5 text-xs font-bold ${item.discountType === "percent" ? "bg-[#0EA5E9] text-white" : "text-[#64748B]"}`}
              onClick={() => setItem({ ...item, discountType: "percent" })}
            >
              %
            </button>
            <button
              type="button"
              className={`px-2 py-0.5 text-xs font-bold ${item.discountType === "amount" ? "bg-[#0EA5E9] text-white" : "text-[#64748B]"}`}
              onClick={() => setItem({ ...item, discountType: "amount" })}
            >
              ₹
            </button>
          </div>
          <InputField
            placeholder="Discount per Unit"
            type="number"
            value={item.discount}
            onChange={(e) => setItem({ ...item, discount: e.target.value })}
          />
          <p className="absolute -bottom-5 left-0 text-[10px] text-[#94A3B8]">₹ 0.00</p>
        </div>
        <div className="text-[#94A3B8] text-xl">＝</div>
        <div className="flex-1 flex items-center justify-between min-w-[100px] border-b pb-1 border-[#E2E8F0] dark:border-[#1F2937]">
          <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">(-) ₹ {discountValue.toFixed(2)}</span>
          <Edit2 className="h-4 w-4 text-[#94A3B8] cursor-pointer hover:text-[#0EA5E9]" />
        </div>
      </div>

      {/* Row 3: Total */}
      <div className="flex items-center justify-end gap-6 pt-4 pr-12">
        <span className="text-sm font-medium text-[#475569] dark:text-[#9CA3AF]">Total</span>
        <span className="text-xl font-bold text-[#0F172A] dark:text-white">₹ {total.toFixed(2)}</span>
      </div>

      <Textarea
        label="Description"
        placeholder="Enter item description"
        value={item.description}
        onChange={(e) => setItem({ ...item, description: e.target.value })}
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#1F2937]">
        <Btn
          type="button"
          variant="outline"
          className="text-[#0EA5E9] border-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white min-w-[100px]"
          onClick={onClose}
        >
          CANCEL
        </Btn>
        <Btn
          type="button"
          variant="primary"
          className="bg-[#0EA5E9] border-[#0EA5E9] hover:bg-[#0284C7] min-w-[100px]"
          onClick={handleAdd}
        >
          ADD
        </Btn>
      </div>
    </div>
  );
}

export default function InvoiceForm({ onClose }) {
  const { loading, setLoading } = useLoading();
  const [success, setSuccess] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  
  // ── Form State ──
  const [form, setForm] = useState({
    invoiceBook: "Delivery Challan",
    invoiceNumber: "DC-1322",
    supplyType: "Regular",
    date: new Date().toISOString().split("T")[0],
    billTo: "",
    billToId: null,
    partyChallan: "",
    internalNotes: "",
    notes: "",
    roundOff: 0,
  });

  const [contacts, setContacts] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [tempContactName, setTempContactName] = useState("");

  const fetchContacts = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/contacts/");
      if (data.success) {
        setContacts(data.data.map(c => ({ 
          value: c.id, 
          label: c.name,
          mobile: c.mobile
        })));
      }
    } catch (err) {
      console.error("Failed to load contacts", err);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // ── Items Table State ──
  const [items, setItems] = useState([]); // Start empty now

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const addItemToMainList = (newItem) => {
    setItems([...items, newItem]);
  };

  // ── Calculations ──
  const basicAmount = items.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = items.reduce((sum, item) => {
     const qty = parseFloat(item.qty) || 0;
     const disc = parseFloat(item.discount) || 0;
     if (item.discountType === "percent") {
       return sum + (qty * parseFloat(item.rate) * disc / 100);
     }
     return sum + (qty * disc);
  }, 0);
  const netPayable = basicAmount + (parseFloat(form.roundOff) || 0);

  // ── Handlers ──
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateNewContact = (name) => {
    setTempContactName(name);
    setIsContactModalOpen(true);
  };

  const handleContactCreated = (newContact) => {
    const option = { 
      value: newContact.id, 
      label: newContact.name,
      mobile: newContact.mobile
    };
    setContacts(prev => [...prev, option]);
    setForm(prev => ({ ...prev, billTo: newContact.name, billToId: newContact.id }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting Invoice:", { ...form, items, totals: { basicAmount, netPayable } });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const itemColumns = [
    { key: "index", header: "Ind.", align: "center", render: (_, __, i) => i + 1 },
    { key: "name", header: "Item" },
    { key: "qty", header: "Qty", align: "center" },
    { 
      key: "rate", 
      header: "Rate (W/O Tax)", 
      align: "right", 
      render: (v) => `₹ ${parseFloat(v).toFixed(2)}` 
    },
    { 
      key: "discount", 
      header: "Discount", 
      align: "right",
      render: (v, row) => row.discountType === "percent" ? `${v}%` : `₹ ${v}`
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (v) => <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">₹ {v.toFixed(2)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "center",
      render: (_, row) => (
        <button
          type="button"
          onClick={() => removeItem(row.id)}
          className="text-[#EF4444] hover:bg-[#FEF2F2] p-2 rounded-lg transition-colors focus:ring-2 focus:ring-[#EF4444]/20"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="bg-[#F0FDF4] dark:bg-[#064E3B] p-4 rounded-full">
          <CheckCircle2 className="h-12 w-12 text-[#22C55E]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Invoice Created Successfully!</h2>
          <p className="text-[#64748B] dark:text-[#94A3B8]">The invoice has been saved and is ready for billing.</p>
        </div>
        <Btn variant="primary" onClick={onClose}>Done</Btn>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Item Modal ── */}
      <Modal 
        open={isItemModalOpen} 
        onClose={() => setIsItemModalOpen(false)} 
        title="New Sale Item"
        size="md"
      >
        <LineItemForm 
          onAdd={addItemToMainList} 
          onClose={() => setIsItemModalOpen(false)} 
        />
      </Modal>

      {/* ── Header Fields ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-semibold mb-1 dark:text-gray-300 block">Invoice Book</label>
          <AppSelect
            options={[
              { value: "Delivery Challan", label: "Delivery Challan" },
              { value: "Sale Invoice", label: "Sale Invoice" },
            ]}
            value={{ value: form.invoiceBook, label: form.invoiceBook }}
            onChange={(opt) => handleFormChange("invoiceBook", opt?.value || "")}
          />
        </div>
        <div className="flex items-end gap-2">
          <Select
            id="invoice-number"
            label="Invoice Number"
            className="flex-1"
            value={form.invoiceNumber}
            onChange={(e) => handleFormChange("invoiceNumber", e.target.value)}
            options={[
              { value: "DC-1322", label: "DC-1322" },
              { value: "DC-1323", label: "DC-1323" },
            ]}
          />
          <button 
            type="button"
            className="mb-2.5 text-xs font-bold text-[#0EA5E9] hover:underline uppercase tracking-tight"
            onClick={() => handleFormChange("invoiceNumber", "AUTO-GENERATED")}
          >
            Skip
          </button>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold mb-1 dark:text-gray-300 block">Supply Type</label>
          <AppSelect
            options={[
              { value: "Regular", label: "Regular" },
              { value: "Export", label: "Export" },
              { value: "Taxable", label: "Taxable" },
            ]}
            value={{ value: form.supplyType, label: form.supplyType }}
            onChange={(opt) => handleFormChange("supplyType", opt?.value || "")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InputField
          id="invoice-date"
          type="date"
          label="Date"
          value={form.date}
          onChange={(e) => handleFormChange("date", e.target.value)}
          required
        />
        <InputField 
          id="party-challan" 
          label="Party Challan N" 
          placeholder="Enter number"
          value={form.partyChallan}
          onChange={(e) => handleFormChange("partyChallan", e.target.value)}
        />
      </div>

      {/* ── Contact Modal ── */}
      <AddContactModal
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSuccess={handleContactCreated}
        initialName={tempContactName}
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold mb-1 dark:text-gray-300 block">Bill To*</label>
          <button 
            type="button" 
            onClick={() => handleCreateNewContact("")}
            className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#3B82F6] dark:hover:text-[#60A5FA] flex items-center gap-1 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Create New Party
          </button>
        </div>
        <AppSelect
          placeholder="Search or Create Party (Customer/Vendor)..."
          options={contacts}
          value={contacts.find(o => o.value === form.billToId) || (form.billTo ? { label: form.billTo, value: form.billToId } : null)}
          onChange={(opt) => {
            if (opt) {
              handleFormChange("billTo", opt.label);
              handleFormChange("billToId", opt.value);
            } else {
              handleFormChange("billTo", "");
              handleFormChange("billToId", null);
            }
          }}
          onCreateOption={handleCreateNewContact}
        />
      </div>

      {/* ── Items Table ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Items</h3>
        <div className="border border-[#E2E8F0] dark:border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
          <Table
            columns={itemColumns}
            data={items}
            hoverable={false}
            className="border-none rounded-none"
            emptyMessage="No items added yet. Click 'Add Item' to start."
          />
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A]/30 flex justify-center border-t border-[#E2E8F0] dark:border-[#1F2937]">
            <Btn
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsItemModalOpen(true)}
              className="text-[#0EA5E9] border-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white transition-all transform hover:scale-105"
            >
              Add Item
            </Btn>
          </div>
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="flex flex-col items-end space-y-2 text-sm pt-4">
        <div className="flex w-72 justify-between text-[#475569] dark:text-[#9CA3AF]">
          <span>Basic Amount</span>
          <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">₹ {basicAmount.toFixed(2)}</span>
        </div>
        <div className="flex w-72 justify-between text-[#475569] dark:text-[#9CA3AF]">
          <span>Discount</span>
          <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">- ₹ {totalDiscount.toFixed(2)}</span>
        </div>
        <div className="flex w-72 justify-between items-center text-[#475569] dark:text-[#9CA3AF]">
          <div className="flex items-center gap-1">
            <span>Round Off</span>
            <Edit2 className="h-3 w-3 opacity-50" />
          </div>
          <div className="relative w-28">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold">₹</span>
            <input
              type="number"
              className="w-full text-right pr-2 pl-6 py-1 border border-[#E2E8F0] dark:border-[#1F2937] bg-white dark:bg-[#111827] rounded text-sm focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none"
              value={form.roundOff}
              onChange={(e) => handleFormChange("roundOff", e.target.value)}
            />
          </div>
        </div>
        <div className="h-px w-72 bg-[#E2E8F0] dark:bg-[#374151] my-2" />
        <div className="flex w-72 justify-between items-center text-lg font-bold">
          <span className="text-[#0F172A] dark:text-[#E2E8F0]">Net Payable</span>
          <span className="text-[#0EA5E9]">₹ {netPayable.toFixed(2)}</span>
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Textarea
          id="internal-notes"
          label="Internal Notes"
          maxLength={250}
          placeholder="Internal reference notes..."
          value={form.internalNotes}
          onChange={(e) => handleFormChange("internalNotes", e.target.value)}
        />
        <Textarea
          id="notes"
          label="Terms & Conditions / Notes"
          maxLength={4000}
          placeholder="Public notes to be printed on invoice..."
          value={form.notes}
          onChange={(e) => handleFormChange("notes", e.target.value)}
        />
      </div>

      {/* ── Footer Actions ── */}
      <div className="flex justify-end gap-3 pt-6 border-t border-[#E2E8F0] dark:border-[#1F2937]">
        <Btn
          type="button"
          variant="outline"
          className="text-[#64748B] border-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] min-w-[120px]"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Btn>
        <Btn
          type="submit"
          variant="primary"
          className="bg-[#0EA5E9] border-[#0EA5E9] hover:bg-[#0284C7] min-w-[120px] shadow-lg shadow-[#0EA5E9]/20"
          loading={loading}
        >
          Create Invoice
        </Btn>
      </div>
    </form>
  );
}
