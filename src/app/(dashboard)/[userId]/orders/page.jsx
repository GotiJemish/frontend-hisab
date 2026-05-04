"use client";

import { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, Trash2, Edit, FileText, Eye, Printer, Download } from "lucide-react";
import { Btn, Card, InputField, Table, Modal } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/context/LoadingContext";

export default function OrdersPage() {
  const [invoices, setInvoices] = useState([]);
  const { loading, setLoading } = useLoading();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  
  // Lookups
  const [contacts, setContacts] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [taxesList, setTaxesList] = useState([]);
  const [availableNumbers, setAvailableNumbers] = useState([]);

  const toast = useToast();

  const [formData, setFormData] = useState({
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    contact: "",
    invoice_type: "default",
    supply_type: "regular",
    internal_note: "",
    notes: "",
    items: [
      { item_id: "", description: "", quantity: 1, rate: 0, discount: 0, tax: "" }
    ],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, conRes, itmRes, taxRes] = await Promise.all([
        apiClient.get("/invoices/"),
        apiClient.get("/contacts/"),
        apiClient.get("/items/"),
        apiClient.get("/taxes/")
      ]);
      
      if (invRes.data.success) setInvoices(invRes.data.data || []);
      if (conRes.data.success) setContacts(conRes.data.data || []);
      if (itmRes.data.success) setItemsList(itmRes.data.data || []);
      if (taxRes.data.success) setTaxesList(taxRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      invoice_number: "",
      invoice_date: new Date().toISOString().split("T")[0],
      contact: "",
      invoice_type: "default",
      supply_type: "regular",
      internal_note: "",
      notes: "",
      items: [
        { item_id: "", description: "", quantity: 1, rate: 0, discount: 0, tax: "" }
      ],
    });
    setModalOpen(true);
  };

  const handleViewModal = (inv) => {
    setViewingInvoice(inv);
    setViewModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await apiClient.delete(`/invoices/${id}/`);
      toast.success("Invoice deleted successfully.");
      setInvoices(invoices.filter(i => i.id !== id));
    } catch (err) {
      toast.error("Failed to delete invoice");
    }
  };

  // Item Handlers
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-fill rate/desc when item is selected
    if (field === "item_id" && value) {
      const selectedItem = itemsList.find(i => i.id == value);
      if (selectedItem) {
        newItems[index].rate = selectedItem.sale_price || 0;
        newItems[index].description = selectedItem.name || "";
      }
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: "", description: "", quantity: 1, rate: 0, discount: 0, tax: "" }]
    });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const disc = parseFloat(item.discount) || 0;
    return Math.max(0, (qty * rate) - disc);
  };

  const calculateTaxAmount = (item) => {
    const subtotal = calculateSubtotal(item);
    if (!item.tax) return 0;
    const taxObj = taxesList.find(t => t.id == item.tax);
    if (!taxObj) return 0;
    return (subtotal * parseFloat(taxObj.rate)) / 100;
  };

  const calculateGrandTotal = () => {
    return formData.items.reduce((acc, item) => {
      const subtotal = calculateSubtotal(item);
      const taxAmt = calculateTaxAmount(item);
      return acc + subtotal + taxAmt;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contact) return toast.error("Please select a Bill To contact");
    
    const validItems = formData.items.filter(i => i.item_id || i.description);
    if (validItems.length === 0) return toast.error("Please add at least one item");

    setLoading(true);
    try {
      const payload = {
        ...formData,
        items: validItems.map(i => ({
          ...i,
          item_id: i.item_id || null,
          tax: i.tax || null
        }))
      };

      const { data } = await apiClient.post("/invoices/", payload);
      if (data.success) {
        toast.success("Invoice created successfully");
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      if (err.response?.data) {
        const errorMsg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
        toast.error(`Error: ${errorMsg}`);
      } else {
        toast.error("Failed to create invoice");
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter(i => 
    i.bill_id.toLowerCase().includes(search.toLowerCase()) || 
    (i.invoice_number && i.invoice_number.toLowerCase().includes(search.toLowerCase()))
  );

  const getContactName = (contactId) => {
    const c = contacts.find(c => c.id === contactId);
    return c ? c.name : "Unknown";
  };

  const columns = [
    { key: "bill_id", header: "Bill ID", sortable: true },
    { key: "invoice_number", header: "Invoice #", render: (val) => val || "-" },
    { key: "invoice_date", header: "Date" },
    { key: "contact", header: "Bill To", render: (val) => getContactName(val) },
    { key: "total_amount", header: "Total Amount", render: (val) => `₹${parseFloat(val).toFixed(2)}` },
    {
      key: "actions", header: "Actions", align: "center",
      render: (_, row) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => handleViewModal(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="View Details">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices & Orders</h1>
          <p className="text-sm text-gray-500">Manage your billing and invoices</p>
        </div>
        <Btn variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpenModal}>
          Create Invoice
        </Btn>
      </div>

      <Card
        header={
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Invoice List</h2>
            <div className="flex items-center gap-2">
              <InputField
                id="search-invoices" type="search" placeholder="Search by Bill ID..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
              <Btn variant="ghost" size="sm" onClick={fetchData}>
                <RefreshCw className={`h-4 w-4 ${loading && invoices.length === 0 ? "animate-spin" : ""}`} />
              </Btn>
            </div>
          </div>
        }
      >
        <div className="-mx-5 -mb-5">
           <Table
             columns={columns}
             data={filtered}
             loading={loading && invoices.length === 0}
             emptyMessage="No invoices found."
             pagination={true}
             rowsPerPage={10}
             striped={true}
           />
        </div>
      </Card>

      {/* Create Invoice Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Invoice" size="5xl">
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bill To (Contact) <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E293B] focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Contact</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name} {c.mobile ? `(${c.mobile})` : ""}</option>)}
                </select>
              </div>
              <InputField
                label="Invoice Date"
                type="date"
                required
                value={formData.invoice_date}
                onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
              />
              <InputField
                label="Custom Invoice #"
                placeholder="Auto-generated if blank"
                value={formData.invoice_number}
                onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Type</label>
                <select
                  value={formData.invoice_type}
                  onChange={(e) => setFormData({...formData, invoice_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E293B] focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="delivery_challan">Delivery Challan</option>
                  <option value="old_dc">OLD DC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supply Type</label>
                <select
                  value={formData.supply_type}
                  onChange={(e) => setFormData({...formData, supply_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E293B] focus:ring-2 focus:ring-blue-500"
                >
                  <option value="regular">Regular</option>
                  <option value="bill_to_ship_to">Bill To - Ship To</option>
                  <option value="bill_from_dispatch_from">Bill From - Dispatch From</option>
                  <option value="a_party">4 Party Transaction</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Line Items</h3>
              <Btn variant="primary" size="sm" onClick={addItemRow} type="button" leftIcon={<Plus className="h-4 w-4" />}>Add Item</Btn>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium w-1/4">Item Details</th>
                    <th className="px-4 py-2 text-right font-medium w-24">Qty</th>
                    <th className="px-4 py-2 text-right font-medium w-32">Rate</th>
                    <th className="px-4 py-2 text-right font-medium w-32">Disc.</th>
                    <th className="px-4 py-2 text-left font-medium w-40">Tax</th>
                    <th className="px-4 py-2 text-right font-medium w-32">Amount</th>
                    <th className="px-4 py-2 text-center font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {formData.items.map((item, index) => (
                    <tr key={index} className="bg-white dark:bg-[#1E293B]">
                      <td className="px-4 py-2">
                        <div className="space-y-2">
                          <select
                            value={item.item_id}
                            onChange={(e) => handleItemChange(index, "item_id", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#0F172A]"
                          >
                            <option value="">Select Item (Optional)</option>
                            {itemsList.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                          </select>
                          <input
                            type="text"
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#0F172A]"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 align-top pt-3">
                        <input
                          type="number" min="1" step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#0F172A]"
                        />
                      </td>
                      <td className="px-4 py-2 align-top pt-3">
                        <input
                          type="number" min="0" step="any"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#0F172A]"
                        />
                      </td>
                      <td className="px-4 py-2 align-top pt-3">
                        <input
                          type="number" min="0" step="any"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, "discount", e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#0F172A]"
                        />
                      </td>
                      <td className="px-4 py-2 align-top pt-3">
                        <select
                          value={item.tax}
                          onChange={(e) => handleItemChange(index, "tax", e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#0F172A]"
                        >
                          <option value="">No Tax</option>
                          {taxesList.map(t => <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>)}
                        </select>
                        {item.tax && (
                          <div className="text-xs text-gray-500 mt-1 text-right">
                            + ₹{calculateTaxAmount(item).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top pt-3 text-right font-semibold text-gray-800 dark:text-gray-200">
                        ₹{(calculateSubtotal(item) + calculateTaxAmount(item)).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 align-top pt-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          disabled={formData.items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-2 border-t border-gray-300 dark:border-gray-600">
                  <span>Grand Total:</span>
                  <span>₹{calculateGrandTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Internal Note"
              value={formData.internal_note}
              onChange={(e) => setFormData({...formData, internal_note: e.target.value})}
              placeholder="Not visible to customer"
            />
            <InputField
              label="Customer Notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Terms & conditions, etc."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Btn variant="outline" onClick={() => setModalOpen(false)} type="button">Cancel</Btn>
            <Btn variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Invoice"}
            </Btn>
          </div>
        </form>
      </Modal>

      {/* View Invoice Modal */}
      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Invoice Details" size="4xl">
        {viewingInvoice && (
          <div className="space-y-6 pt-4 text-gray-800 dark:text-gray-200">
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h2 className="text-2xl font-bold">INVOICE</h2>
                <p className="text-sm text-gray-500 mt-1">Bill ID: {viewingInvoice.bill_id}</p>
                <p className="text-sm text-gray-500">Invoice #: {viewingInvoice.invoice_number || "N/A"}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-gray-700 dark:text-gray-300">Date: {viewingInvoice.invoice_date}</p>
                <p className="text-gray-500 mt-1 uppercase tracking-wider">{viewingInvoice.invoice_type.replace('_', ' ')}</p>
                <p className="text-gray-500 uppercase tracking-wider">{viewingInvoice.supply_type.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Billed To</h3>
              <p className="font-semibold text-lg">{getContactName(viewingInvoice.contact)}</p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Description</th>
                    <th className="px-4 py-2 font-semibold text-right">Qty</th>
                    <th className="px-4 py-2 font-semibold text-right">Rate</th>
                    <th className="px-4 py-2 font-semibold text-right">Disc.</th>
                    <th className="px-4 py-2 font-semibold text-right">Tax</th>
                    <th className="px-4 py-2 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {viewingInvoice.items?.map((item, idx) => (
                    <tr key={idx} className="bg-white dark:bg-[#1E293B]">
                      <td className="px-4 py-3">{item.description || "Item"}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">₹{parseFloat(item.rate).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">₹{parseFloat(item.discount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">₹{parseFloat(item.tax_amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold">₹{parseFloat(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 flex justify-end">
                 <div className="w-64 flex justify-between font-bold text-xl text-gray-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span>₹{parseFloat(viewingInvoice.total_amount).toFixed(2)}</span>
                 </div>
              </div>
            </div>

            {(viewingInvoice.internal_note || viewingInvoice.notes) && (
              <div className="grid grid-cols-2 gap-4">
                {viewingInvoice.notes && (
                  <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Customer Notes</h4>
                    <p className="text-sm whitespace-pre-wrap">{viewingInvoice.notes}</p>
                  </div>
                )}
                {viewingInvoice.internal_note && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <h4 className="text-xs font-bold text-blue-500 uppercase mb-1">Internal Note</h4>
                    <p className="text-sm text-blue-900 dark:text-blue-300 whitespace-pre-wrap">{viewingInvoice.internal_note}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
