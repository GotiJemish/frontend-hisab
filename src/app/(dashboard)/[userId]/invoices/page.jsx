"use client";

import { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, Trash2, Eye, Printer, Edit, Shield, Share2, Mail, Link as LinkIcon } from "lucide-react";
import { Btn, Card, InputField, Table, Modal } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import AppSelect from "@/components/ui/AppSelect";
import ItemFormModal from "../items/components/ItemFormModal";
import { useParams, useSearchParams } from "next/navigation";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const { loading, setLoading } = useLoading();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const { user, hasPermission } = useAuth();
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  const params = useParams();
  const userId = params?.userId || "";
  const searchParams = useSearchParams();
  const isPdfView = searchParams?.get("pdf") === "true";

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharingItem, setSharingItem] = useState(null);
  const canShare = user?.role === "COMPANY_ADMIN" || user?.role === "SUPER_ADMIN";

  
  // Lookups
  const [contacts, setContacts] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [taxesList, setTaxesList] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);
  
  // GST Selection Rates from Configuration module
  const [gstOptions, setGstOptions] = useState([]);

  // GST Treatment State: intra (CGST + SGST) vs inter (IGST)
  const [gstType, setGstType] = useState("intra");
  const [viewGstType, setViewGstType] = useState("intra");

  // New Item Modal State
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemAddingIndex, setItemAddingIndex] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: "",
    type: "service",
    unit_type: "Pcs",
    tax_category: "none",
    rate: "",
    discount: "",
    with_tax: false,
    sac: "",
  });

  // New Contact Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    billing_address: "",
    billing_city: "",
    billing_state: "Gujarat",
    billing_pincode: "",
    billing_country: "India",
    same_as_billing: true,
    shipping_address: "",
    shipping_city: "",
    shipping_state: "Gujarat",
    shipping_pincode: "",
    shipping_country: "India",
  });

  const toast = useToast();

  const [formData, setFormData] = useState({
    bill_id: "",
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    contact: "",
    invoice_type: "old_dc",
    supply_type: "regular",
    party_challan_no: "",
    internal_note: "",
    notes: "",
    items: [
      { item_id: "", description: "", quantity: 1, rate: 0, gst_percentage: 5, delivery_challan_no: "" }
    ],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, conRes, itmRes, taxRes, compRes] = await Promise.all([
        apiClient.get("/invoices/"),
        apiClient.get("/contacts/"),
        apiClient.get("/items/"),
        apiClient.get("/taxes/"),
        apiClient.get("/company/").catch(() => ({ data: { success: false } }))
      ]);
      
      if (invRes.data.success) setInvoices(invRes.data.data || []);
      if (conRes.data.success) setContacts(conRes.data.data || []);
      if (itmRes.data.success) setItemsList(itmRes.data.data || []);
      if (taxRes.data.success) setTaxesList(taxRes.data.data || []);
      if (compRes.data.success) setCompanyProfile(compRes.data.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Deep-linking: auto-open invoice view modal if ?id=xxx search param matches
  useEffect(() => {
    if (invoices && invoices.length > 0 && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const invoiceId = urlParams.get("id");
      if (invoiceId) {
        const found = invoices.find(i => String(i.id) === String(invoiceId));
        if (found) {
          handleViewModal(found);
        }
      }
    }
  }, [invoices]);

  // Sync GST rates with taxes from configuration module
  useEffect(() => {
    if (taxesList) {
      const options = taxesList.map(t => ({
        value: parseFloat(t.rate),
        label: `${t.name} (${parseFloat(t.rate)}%)`
      }));
      setGstOptions(options);
    }
  }, [taxesList]);

  // Auto-detect Intra vs Inter State based on contact billing state
  useEffect(() => {
    if (!formData.contact) return;
    const selectedContact = contacts.find(c => c.id == formData.contact);
    if (selectedContact && selectedContact.billing_state) {
      const isLocal = selectedContact.billing_state.toLowerCase().trim() === "gujarat";
      setGstType(isLocal ? "intra" : "inter");
    } else {
      setGstType("intra");
    }
  }, [formData.contact, contacts]);

  // Fetch next invoice number and bill ID when date changes or modal opens
  useEffect(() => {
    if (!modalOpen || editingInvoiceId) return; // Only fetch during creation
    
    const fetchNextIds = async () => {
      try {
        const res = await apiClient.get(`/invoices/invoice-number/?date=${formData.invoice_date}`);
        if (res.data.success) {
          setFormData(prev => ({
            ...prev,
            invoice_number: res.data.data.next_invoice_number || "",
            bill_id: res.data.data.next_bill_id || ""
          }));
        }
      } catch (err) {
        console.error("Failed to fetch next invoice ID:", err);
      }
    };
    
    fetchNextIds();
  }, [formData.invoice_date, modalOpen, editingInvoiceId]);

  const handleSkipInvoiceId = () => {
    if (!formData.invoice_number) return;
    
    const last4 = formData.invoice_number.slice(-4);
    const prefix = formData.invoice_number.slice(0, -4);
    if (/^\d{4}$/.test(last4)) {
      const nextNum = parseInt(last4, 10) + 1;
      const paddedNum = String(nextNum).padStart(4, '0');
      setFormData(prev => ({
        ...prev,
        invoice_number: `${prefix}${paddedNum}`
      }));
    }
  };

  const handleOpenModal = () => {
    setFormData({
      bill_id: "",
      invoice_number: "",
      invoice_date: new Date().toISOString().split("T")[0],
      contact: "",
      invoice_type: "old_dc",
      supply_type: "regular",
      party_challan_no: "",
      internal_note: "",
      notes: "",
      items: [
        { item_id: "", description: "", quantity: 1, rate: 0, gst_percentage: 5, delivery_challan_no: "" }
      ],
    });
    setGstType("intra");
    setEditingInvoiceId(null);
    setModalOpen(true);
  };

  const handleEditModal = (inv) => {
    let note = inv.internal_note || "";
    let extractedGstType = "intra";
    
    if (note.startsWith("[GST_TYPE:inter]")) {
      extractedGstType = "inter";
      note = note.replace("[GST_TYPE:inter]", "").trim();
    } else if (note.startsWith("[GST_TYPE:intra]")) {
      extractedGstType = "intra";
      note = note.replace("[GST_TYPE:intra]", "").trim();
    } else {
      // Auto-detect based on contact's billing state
      const selectedContact = contacts.find(c => c.id == inv.contact);
      if (selectedContact && selectedContact.billing_state) {
        const isLocal = selectedContact.billing_state.toLowerCase().trim() === "gujarat";
        extractedGstType = isLocal ? "intra" : "inter";
      }
    }

    setFormData({
      bill_id: inv.bill_id || "",
      invoice_number: inv.invoice_number || "",
      invoice_date: inv.invoice_date || new Date().toISOString().split("T")[0],
      contact: inv.contact || "",
      invoice_type: inv.invoice_type || "old_dc",
      supply_type: inv.supply_type || "regular",
      party_challan_no: inv.party_challan_no || "",
      internal_note: note,
      notes: inv.notes || "",
      items: inv.items ? inv.items.map(item => ({
        item_id: item.item_id || "",
        description: item.description || "",
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        gst_percentage: item.gst_percentage || 5,
        delivery_challan_no: item.delivery_challan_no || ""
      })) : [
        { item_id: "", description: "", quantity: 1, rate: 0, gst_percentage: 5, delivery_challan_no: "" }
      ],
    });
    
    setGstType(extractedGstType);
    setEditingInvoiceId(inv.id);
    setModalOpen(true);
  };

  const handleViewModal = (inv) => {
    let note = inv.internal_note || "";
    let extractedGstType = "intra";
    
    if (note.startsWith("[GST_TYPE:inter]")) {
      extractedGstType = "inter";
      note = note.replace("[GST_TYPE:inter]", "").trim();
    } else if (note.startsWith("[GST_TYPE:intra]")) {
      extractedGstType = "intra";
      note = note.replace("[GST_TYPE:intra]", "").trim();
    } else {
      // Auto-detect based on contact's billing state
      const selectedContact = contacts.find(c => c.id == inv.contact);
      if (selectedContact && selectedContact.billing_state) {
        const isLocal = selectedContact.billing_state.toLowerCase().trim() === "gujarat";
        extractedGstType = isLocal ? "intra" : "inter";
      }
    }
    
    setViewingInvoice({
      ...inv,
      display_internal_note: note
    });
    setViewGstType(extractedGstType);
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
    if (field === "item_id" && value === "new-item") {
      setItemAddingIndex(index);
      setItemFormData({
        name: "",
        type: "service",
        unit_type: "Pcs",
        tax_category: "none",
        rate: "",
        discount: "",
        with_tax: false,
        sac: "",
      });
      setItemModalOpen(true);
      return;
    }

    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-fill rate/desc when item is selected
    if (field === "item_id" && value) {
      const selectedItem = itemsList.find(i => i.id == value);
      if (selectedItem) {
        newItems[index].rate = selectedItem.rate || 0;
        newItems[index].description = selectedItem.name || "";
      }
    }
    setFormData({ ...formData, items: newItems });
  };



  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...itemFormData,
        rate: parseFloat(itemFormData.rate) || 0,
        discount: parseFloat(itemFormData.discount) || 0,
        sac: parseInt(itemFormData.sac, 10) || 0,
      };
      
      const res = await apiClient.post("/items/", payload);

      if (res.data.success) {
        toast.success(res.data.message || "Item created successfully");
        setItemModalOpen(false);
        // Refresh items list
        const itmRes = await apiClient.get("/items/");
        if (itmRes.data.success) {
          const newItemsList = itmRes.data.data || [];
          setItemsList(newItemsList);
          
          // Auto-select the newly created item
          const createdItem = res.data.data || newItemsList.find(i => i.name === itemFormData.name);
          if (createdItem && itemAddingIndex !== null) {
            const newItems = [...formData.items];
            newItems[itemAddingIndex].item_id = createdItem.id;
            newItems[itemAddingIndex].rate = createdItem.rate || 0;
            newItems[itemAddingIndex].description = createdItem.name || "";
            setFormData({ ...formData, items: newItems });
          }
        }
      }
    } catch (err) {
      toast.error("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactFormData.name) return toast.error("Contact name is required");
    
    setLoading(true);
    try {
      const payload = {
        ...contactFormData,
        shipping_address: contactFormData.same_as_billing ? contactFormData.billing_address : contactFormData.shipping_address,
        shipping_city: contactFormData.same_as_billing ? contactFormData.billing_city : contactFormData.shipping_city,
        shipping_state: contactFormData.same_as_billing ? contactFormData.billing_state : contactFormData.shipping_state,
        shipping_pincode: contactFormData.same_as_billing ? contactFormData.billing_pincode : contactFormData.shipping_pincode,
        shipping_country: contactFormData.same_as_billing ? contactFormData.billing_country : contactFormData.shipping_country,
      };

      const res = await apiClient.post("/contacts/", payload);
      if (res.data.success) {
        toast.success("Contact created successfully.");
        
        // Refresh contacts list
        const conRes = await apiClient.get("/contacts/");
        if (conRes.data.success) {
          const updatedContacts = conRes.data.data || [];
          setContacts(updatedContacts);
          
          // Auto-select the newly created contact
          const newContact = res.data.data || updatedContacts.find(c => c.name === contactFormData.name);
          if (newContact) {
            setFormData(prev => ({ ...prev, contact: newContact.id }));
          }
        }
        setContactModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to create contact");
    } finally {
      setLoading(false);
    }
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: "", description: "", quantity: 1, rate: 0, gst_percentage: 5, delivery_challan_no: "" }]
    });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Real-time Calculation Functions
  const calculateItemTaxable = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return qty * rate;
  };

  const calculateItemGst = (item) => {
    const taxable = calculateItemTaxable(item);
    const gstRate = parseFloat(item.gst_percentage) || 0;
    return (taxable * gstRate) / 100;
  };

  const calculateItemTotal = (item) => {
    return calculateItemTaxable(item) + calculateItemGst(item);
  };

  // Summary Aggregates
  const summarySubtotal = formData.items.reduce((sum, item) => sum + calculateItemTaxable(item), 0);
  const summaryTotalGst = formData.items.reduce((sum, item) => sum + calculateItemGst(item), 0);
  const summaryCgst = summaryTotalGst / 2;
  const summarySgst = summaryTotalGst / 2;
  const summaryIgst = summaryTotalGst;
  const summaryGrandTotal = summarySubtotal + summaryTotalGst;

  // Indian Rupee Consistent Currency Formatter
  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contact) return toast.error("Please select a Bill To contact");
    
    const validItems = formData.items.filter(i => i.item_id || i.description);
    if (validItems.length === 0) return toast.error("Please add at least one item");

    setLoading(true);
    try {
      // Prepend selected GST type in internal_note metadata
      const prependedNote = `[GST_TYPE:${gstType}] ${formData.internal_note}`.trim();
      
      const payload = {
        ...formData,
        internal_note: prependedNote,
        party_challan_no: formData.party_challan_no || "",
        items: validItems.map(i => ({
          item_id: i.item_id || null,
          description: i.description || "",
          quantity: parseInt(i.quantity, 10) || 1,
          rate: parseFloat(i.rate) || 0,
          discount: 0,
          gst_percentage: parseFloat(i.gst_percentage) ?? 5,
          delivery_challan_no: i.delivery_challan_no || ""
        }))
      };

      let response;
      if (editingInvoiceId) {
        response = await apiClient.put(`/invoices/${editingInvoiceId}/`, payload);
      } else {
        response = await apiClient.post("/invoices/", payload);
      }

      if (response.data.success) {
        toast.success(editingInvoiceId ? "Invoice updated successfully" : "Invoice created successfully");
        setModalOpen(false);
        setEditingInvoiceId(null);
        fetchData();
      }
    } catch (err) {
      if (err.response?.data) {
        const errorMsg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
        toast.error(`Error: ${errorMsg}`);
      } else {
        toast.error(editingInvoiceId ? "Failed to update invoice" : "Failed to create invoice");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window === "undefined" || !viewingInvoice) return;
    const printContent = document.getElementById("printable-invoice");
    if (!printContent) {
      toast.error("Could not find invoice content to print");
      return;
    }

    // Create a temporary iframe for clean, isolated printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();

    // Copy all style sheets and style tags from the parent document to preserve Tailwind styles
    let stylesHTML = "";
    document.querySelectorAll("link[rel='stylesheet'], style").forEach((styleNode) => {
      stylesHTML += styleNode.outerHTML;
    });

    doc.write(`
      <html>
        <head>
          <title>Invoice - ${viewingInvoice.bill_id}</title>
          ${stylesHTML}
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1.2cm 1.5cm;
              }
            }
            body {
              background: white !important;
              color: #0f172a !important;
              font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important;
              padding: 0 !important;
              margin: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #printable-invoice {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
              color: #0f172a !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            #printable-invoice-info-grid {
              display: grid !important;
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 1.5rem !important;
            }
            #printable-invoice-info-grid-right {
              border-left: 1px solid #e2e8f0 !important;
              padding-left: 1.5rem !important;
              margin-left: 0 !important;
              margin-top: 0 !important;
            }
            #printable-invoice-bottom-flex {
              display: flex !important;
              flex-direction: row !important;
              justify-content: space-between !important;
              align-items: flex-start !important;
              gap: 1.5rem !important;
              margin-top: 1.5rem !important;
            }
            #printable-invoice-bottom-flex > div:first-child {
              flex: 1 !important;
              max-width: 60% !important;
              margin-bottom: 0 !important;
            }
            #printable-invoice-bottom-flex > div:last-child {
              width: 20rem !important;
              min-width: 20rem !important;
              margin-top: 0 !important;
            }
            .print-hide {
              display: none !important;
            }
            /* Enforce borders to render as light gray on paper */
            *, *::before, *::after {
              color-scheme: light !important;
              border-color: #e2e8f0 !important;
            }
            /* Enforce backgrounds in print */
            .bg-slate-50 {
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .bg-emerald-50 {
              background-color: #ecfdf5 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .bg-blue-50 {
              background-color: #eff6ff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .text-emerald-600 {
              color: #059669 !important;
            }
            .text-blue-650 {
              color: #1d4ed8 !important;
            }
            .text-slate-900 {
              color: #0f172a !important;
            }
            .text-slate-800 {
              color: #1e293b !important;
            }
            .text-slate-700 {
              color: #334155 !important;
            }
            .text-slate-600 {
              color: #475569 !important;
            }
            .text-slate-500 {
              color: #64748b !important;
            }
          </style>
        </head>
        <body class="bg-white text-slate-900">
          <div>
            ${printContent.outerHTML}
          </div>
          <script>
            window.addEventListener('DOMContentLoaded', () => {
              setTimeout(() => {
                window.focus();
                window.print();
                setTimeout(() => {
                  window.frameElement.remove();
                }, 500);
              }, 500);
            });
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  const filtered = invoices.filter(i => 
    i.invoice_type === "old_dc" && (
      i.bill_id.toLowerCase().includes(search.toLowerCase()) || 
      (i.invoice_number && i.invoice_number.toLowerCase().includes(search.toLowerCase()))
    )
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
    { 
      key: "party_challan_no", 
      header: "Party Challan", 
      render: (val, row) => val || row.party_challan_no || "-" 
    },

    { key: "total_amount", header: "Total Amount", render: (val) => formatCurrency(val) },
    {
      key: "actions", header: "Actions", align: "center",
      render: (_, row) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => handleViewModal(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all" title="View & Print Details">
            <Eye className="h-4 w-4" />
          </button>
          {canShare && (
            <button 
              onClick={() => {
                setSharingItem({ type: "invoice", details: row });
                setShareModalOpen(true);
              }}
              className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all"
              title="Share Invoice"
            >
              <Share2 className="h-4 w-4" />
            </button>
          )}
          {hasPermission("invoices", "update") && (
            <button onClick={() => handleEditModal(row)} className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-all" title="Edit Invoice">
              <Edit className="h-4 w-4" />
            </button>
          )}
          {hasPermission("invoices", "delete") && (
            <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-all" title="Delete Invoice">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  if (user && !hasPermission("invoices", "read")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-[#0F172A] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm max-w-md mx-auto mt-12">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-full text-red-500 dark:text-red-400 mb-4 ring-8 ring-red-50/50 dark:ring-red-950/10">
          <Shield className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          You do not have the required permissions to view or manage organization invoices. Please contact your administrator if you believe this is an error.
        </p>
        <Btn variant="primary" onClick={() => window.location.href = `/${user?.user_id || ""}`}>
          Back to Dashboard
        </Btn>
      </div>
    );
  }

  if (isPdfView) {
    const activeInvoice = invoices.find(i => String(i.id) === String(searchParams.get("id")));
    if (loading && invoices.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0B1220]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-sm text-gray-500">Loading invoice document...</span>
        </div>
      );
    }
    if (!activeInvoice) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-white dark:bg-slate-900">
          <p className="text-red-500 font-semibold mb-2">Invoice Document Not Found</p>
          <p className="text-xs text-gray-500">Please verify the link or check if it has been deleted.</p>
        </div>
      );
    }

    const activeGstType = activeInvoice.internal_note?.startsWith("[GST_TYPE:inter]") ? "inter" : "intra";

    return (
      <div className="bg-white dark:bg-slate-950 min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            .print-hide {
              display: none !important;
            }
          }
        `}} />
        <div className="flex justify-end gap-3 mb-6 print-hide">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>

        {/* Printable invoice container */}
        <div id="printable-invoice" className="bg-white text-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100 shadow-xl space-y-6">
          {/* TOP HEADER */}
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-650 dark:text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase">
                Tax Invoice
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-4">{companyProfile?.name || "My Company"}</h2>
              {companyProfile?.gstin && <p className="text-xs text-slate-500 mt-1 font-semibold">GSTIN: {companyProfile.gstin}</p>}
              {companyProfile?.pan && <p className="text-xs text-slate-500 mt-0.5 font-semibold">PAN: {companyProfile.pan}</p>}
              {companyProfile?.address && <p className="text-xs text-slate-400 mt-1 max-w-xs">{companyProfile.address}</p>}
            </div>
            <div className="text-right space-y-1 text-sm font-medium">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Invoice Details</p>
              <p className="text-slate-900 dark:text-slate-100 font-extrabold">Bill ID: {activeInvoice.bill_id}</p>
              <p className="text-slate-600 dark:text-slate-400">Invoice #: {activeInvoice.invoice_number || "N/A"}</p>
              <p className="text-slate-600 dark:text-slate-400">Date: {activeInvoice.invoice_date}</p>
            </div>
          </div>

          {/* TWO COLUMN INFO (BILL TO & CHALLAN DETAILS) */}
          <div id="printable-invoice-info-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Billed To</h3>
              <p className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{getContactName(activeInvoice.contact)}</p>
              {(() => {
                const contactObj = contacts.find(c => c.id == activeInvoice.contact);
                if (contactObj) {
                  return (
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 space-y-0.5 font-medium">
                      {contactObj.mobile && <p>Mobile: {contactObj.mobile}</p>}
                      {contactObj.billing_address && <p>Address: {contactObj.billing_address}</p>}
                      {contactObj.billing_state && <p>State: {contactObj.billing_state}</p>}
                      {contactObj.gst && <p className="font-extrabold text-slate-700 dark:text-slate-350 mt-1">GSTIN: {contactObj.gst}</p>}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            
            <div id="printable-invoice-info-grid-right" className="md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Challan Information</h3>
              <div className="text-sm font-medium">
                <div>
                  <p className="text-xs text-slate-450">Party Challan No.</p>
                  <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{activeInvoice.party_challan_no || "N/A"}</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">Delivery Challan numbers are listed per item below.</p>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/10">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-bold text-center w-12">Sr.</th>
                  <th className="px-4 py-3 font-bold">Item Description</th>
                  <th className="px-4 py-3 font-bold w-28">DC No.</th>
                  <th className="px-4 py-3 font-bold text-right w-20">Qty</th>
                  <th className="px-4 py-3 font-bold text-right w-28">Rate</th>
                  <th className="px-4 py-3 font-bold text-right w-20">GST</th>
                  <th className="px-4 py-3 font-bold text-right w-24">GST Amt</th>
                  <th className="px-4 py-3 font-bold text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-850 dark:text-slate-200">
                {activeInvoice.items?.map((item, idx) => {
                  const qty = parseFloat(item.quantity) || 0;
                  const rate = parseFloat(item.rate) || 0;
                  const gstPerc = parseFloat(item.gst_percentage) || 5;
                  const taxable = qty * rate;
                  const gstAmt = parseFloat(item.tax_amount) || (taxable * gstPerc / 100);
                  const itemTotal = parseFloat(item.total) || (taxable + gstAmt);

                  return (
                    <tr key={idx} className="bg-white dark:bg-slate-900/10 hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                      <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-extrabold text-slate-900 dark:text-white">{item.description || "Product/Service"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.delivery_challan_no || "-"}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{qty}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(rate)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{gstPerc}%</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">{formatCurrency(gstAmt)}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white">{formatCurrency(itemTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CALCULATION SUMMARY PANEL */}
          <div id="printable-invoice-bottom-flex" className="flex flex-col md:flex-row justify-between items-start pt-4 gap-6">
            {/* Notes & Terms */}
            <div className="flex-1 space-y-4 max-w-md w-full">
              {activeInvoice.notes && (
                <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Customer Notes</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{activeInvoice.notes}</p>
                </div>
              )}
              <div className="h-24 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl flex items-end justify-center p-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/10">
                Authorized Signatory
              </div>
            </div>

            {/* Financial Summary */}
            <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm text-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-2">GST Summary</h4>
              
              {(() => {
                const gstSum = activeInvoice.gst_summary || {};
                const subtotal = parseFloat(gstSum.subtotal) || 0;
                const totalGst = parseFloat(gstSum.total_gst) || 0;
                const cgst = parseFloat(gstSum.cgst) || (totalGst / 2);
                const sgst = parseFloat(gstSum.sgst) || (totalGst / 2);
                const igst = parseFloat(gstSum.igst) || totalGst;
                const grandTotal = parseFloat(gstSum.grand_total) || (subtotal + totalGst);

                return (
                  <div className="space-y-2.5 font-medium">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Subtotal (Before Tax)</span>
                      <span className="text-slate-900 dark:text-white font-extrabold">{formatCurrency(subtotal)}</span>
                    </div>

                    {activeGstType === "intra" ? (
                      <>
                        <div className="flex justify-between items-center text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-700">
                          <span>CGST (2.5% / 5% / etc)</span>
                          <span>{formatCurrency(cgst)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-700">
                          <span>SGST (2.5% / 5% / etc)</span>
                          <span>{formatCurrency(sgst)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-700">
                        <span>IGST (5% / 12% / etc)</span>
                        <span>{formatCurrency(igst)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                      <span>Total GST Amount</span>
                      <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(totalGst)}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-300 dark:border-slate-700 mt-1">
                      <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-base font-black">
                        <span className="text-slate-800 dark:text-emerald-300">Grand Total</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple Printing Style Sheet to support Ctrl+P fallback */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .print-hide {
            display: none !important;
          }
        }
      `}} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-gray-500">Manage and preview OLD DC Invoices</p>
        </div>
        <div className="flex items-center gap-2 print-hide">
          {canShare && (
            <Btn 
              variant="outline" 
              size="sm" 
              leftIcon={<Share2 className="h-4 w-4" />} 
              onClick={() => {
                setSharingItem({ type: "list", details: null });
                setShareModalOpen(true);
              }}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/40 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
            >
              Share List
            </Btn>
          )}
          {hasPermission("invoices", "create") && (
            <Btn variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpenModal}>
              Create Invoice
            </Btn>
          )}
        </div>
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

      {/* Create Invoice Modal (Sticky Two-Column Layout) */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingInvoiceId ? "Edit Invoice" : "Create New Invoice"} size="5xl">
        <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT COLUMN: Input Fields & Line Items */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-850 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Invoice Header</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Bill ID"
                    value={formData.bill_id || ""}
                    disabled
                    placeholder={editingInvoiceId ? "Bill ID" : "Auto-generating Bill ID..."}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                      Invoice ID <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        value={formData.invoice_number}
                        onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                        className="flex-1 w-full rounded-lg border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/20 bg-white text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#111827] dark:text-[#E5E7EB] dark:placeholder-[#6B7280] dark:border-[#1F2937] dark:focus:border-[#3B82F6] dark:focus:ring-[#3B82F6]/20 px-4 py-2"
                        placeholder="Auto-generating Invoice ID..."
                      />
                      <Btn
                        variant="outline"
                        type="button"
                        onClick={handleSkipInvoiceId}
                        className="rounded-xl border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 h-[38px] px-4 font-bold"
                      >
                        Skip
                      </Btn>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1">Bill To (Contact) <span className="text-rose-500">*</span></label>
                    <AppSelect
                      options={contacts.map(c => ({ value: c.id, label: `${c.name} ${c.mobile ? `(${c.mobile})` : ""}` }))}
                      value={contacts.find(c => c.id == formData.contact) ? { value: formData.contact, label: `${contacts.find(c => c.id == formData.contact).name} ${contacts.find(c => c.id == formData.contact).mobile ? `(${contacts.find(c => c.id == formData.contact).mobile})` : ""}` } : null}
                      onChange={(selected) => setFormData({...formData, contact: selected?.value || ""})}
                      onCreateOption={(inputValue) => {
                        setContactFormData({
                          name: inputValue,
                          mobile: "",
                          email: "",
                          billing_address: "",
                          billing_city: "",
                          billing_state: "Gujarat",
                          billing_pincode: "",
                          billing_country: "India",
                          same_as_billing: true,
                          shipping_address: "",
                          shipping_city: "",
                          shipping_state: "Gujarat",
                          shipping_pincode: "",
                          shipping_country: "India",
                        });
                        setContactModalOpen(true);
                      }}
                      placeholder="Search or Select Contact"
                    />
                  </div>
                  
                  <InputField
                    label="Invoice Date"
                    type="date"
                    required
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Party Challan No."
                    placeholder="Enter Party Challan (Optional)"
                    value={formData.party_challan_no}
                    onChange={(e) => setFormData({...formData, party_challan_no: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1">Invoice Type</label>
                    <select
                      disabled
                      value={formData.invoice_type}
                      onChange={(e) => setFormData({...formData, invoice_type: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm cursor-not-allowed"
                    >
                      <option value="old_dc">OLD DC</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1">Supply Type</label>
                    <select
                      value={formData.supply_type}
                      onChange={(e) => setFormData({...formData, supply_type: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1E293B] focus:ring-2 focus:ring-blue-500/20 text-sm"
                    >
                      <option value="regular">Regular</option>
                      <option value="bill_to_ship_to">Bill To - Ship To</option>
                      <option value="bill_from_dispatch_from">Bill From - Dispatch From</option>
                      <option value="a_party">4 Party Transaction</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3.5 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm tracking-tight">Line Items</h3>
                  <Btn variant="primary" size="sm" onClick={addItemRow} type="button" leftIcon={<Plus className="h-4 w-4" />}>
                    Add Item Row
                  </Btn>
                </div>
                
                <div className="overflow-x-auto bg-white dark:bg-slate-900/10">
                  <table className="w-full min-w-[800px] text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold w-2/5">Item Details</th>
                        <th className="px-4 py-3 text-right font-bold w-20">Qty</th>
                        <th className="px-4 py-3 text-right font-bold w-28">Rate (₹)</th>
                        <th className="px-4 py-3 text-left font-bold w-36">GST (%)</th>
                        <th className="px-4 py-3 text-right font-bold w-28">Amount</th>
                        <th className="px-4 py-3 text-center w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {formData.items.map((item, index) => {
                        const taxable = calculateItemTaxable(item);
                        const totalAmount = calculateItemTotal(item);

                        return (
                          <tr key={index} className="bg-white dark:bg-slate-900/20 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="px-4 py-3 align-top">
                              <div className="space-y-2">
                                <AppSelect
                                  options={[
                                    ...itemsList.map(i => ({ value: i.id, label: i.name, rate: i.rate })),
                                    { value: "new-item", label: "+ Add New Item" }
                                  ]}
                                  value={itemsList.find(i => i.id == item.item_id) ? { value: item.item_id, label: itemsList.find(i => i.id == item.item_id).name } : null}
                                  onChange={(selected) => handleItemChange(index, "item_id", selected?.value)}
                                  placeholder="Search or Select Item"
                                />
                                <input
                                  type="text"
                                  placeholder="Item Description / Notes"
                                  value={item.description}
                                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-800 dark:text-slate-100"
                                />
                                <input
                                  type="text"
                                  placeholder="Delivery Challan No. (Optional)"
                                  value={item.delivery_challan_no || ""}
                                  onChange={(e) => handleItemChange(index, "delivery_challan_no", e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <input
                                type="number" min="1" step="any"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                className="w-full px-3 py-2 text-right border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-800 dark:text-slate-100 font-semibold"
                              />
                            </td>
                            <td className="px-4 py-3 align-top">
                              <input
                                type="number" min="0" step="any"
                                value={item.rate}
                                onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                className="w-full px-3 py-2 text-right border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-800 dark:text-slate-100 font-semibold"
                              />
                            </td>
                            <td className="px-4 py-3 align-top">
                              <AppSelect
                                options={gstOptions}
                                value={gstOptions.find(o => o.value === parseFloat(item.gst_percentage)) || { value: parseFloat(item.gst_percentage), label: `${item.gst_percentage}%` }}
                                onChange={(selected) => {
                                  if (selected) {
                                    handleItemChange(index, "gst_percentage", selected.value);
                                  }
                                }}
                                placeholder="GST Rate"
                              />
                            </td>
                            <td className="px-4 py-3 align-top text-right pt-5 font-bold text-slate-800 dark:text-slate-200">
                              {formatCurrency(totalAmount)}
                              <div className="text-[10px] font-normal text-slate-400 dark:text-slate-500 mt-0.5">
                                Taxable: {formatCurrency(taxable)}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top text-center pt-5">
                              <button
                                type="button"
                                onClick={() => removeItemRow(index)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                                disabled={formData.items.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Internal Note"
                  value={formData.internal_note}
                  onChange={(e) => setFormData({...formData, internal_note: e.target.value})}
                  placeholder="Only visible to staff"
                />
                
                <InputField
                  label="Customer Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Terms, conditions, print-friendly info"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Calculation Panel */}
            <div className="lg:sticky lg:top-4 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 border-b pb-3 mb-4">Invoice Summary</h3>
                
                {/* GST Type Selector */}
                <div className="mb-4">
                   <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">GST Treatment</label>
                   <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                     <button
                       type="button"
                       onClick={() => setGstType("intra")}
                       className={`py-1.5 text-xs font-bold rounded-lg transition-all ${gstType === "intra" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"}`}
                     >
                       Intra-State
                     </button>
                     <button
                       type="button"
                       onClick={() => setGstType("inter")}
                       className={`py-1.5 text-xs font-bold rounded-lg transition-all ${gstType === "inter" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"}`}
                     >
                       Inter-State
                     </button>
                   </div>
                </div>

                {/* Calculation Rows */}
                <div className="space-y-3.5 text-sm">
                   <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Subtotal (Before GST)</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(summarySubtotal)}</span>
                   </div>
                   
                   {gstType === "intra" ? (
                     <>
                       <div className="flex justify-between items-center text-slate-500 pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                          <span>CGST (50%)</span>
                          <span>{formatCurrency(summaryCgst)}</span>
                       </div>
                       <div className="flex justify-between items-center text-slate-500 pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                          <span>SGST (50%)</span>
                          <span>{formatCurrency(summarySgst)}</span>
                       </div>
                     </>
                   ) : (
                     <div className="flex justify-between items-center text-slate-500 pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                        <span>IGST (100%)</span>
                        <span>{formatCurrency(summaryIgst)}</span>
                     </div>
                   )}

                   <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-2.5 border-t border-slate-200 dark:border-slate-800">
                      <span>Total GST Amount</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(summaryTotalGst)}</span>
                   </div>

                   <div className="pt-4 border-t border-slate-350 dark:border-slate-700 mt-2">
                      <div className="flex flex-col gap-1 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-250/50 dark:border-emerald-900/30">
                         <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300 tracking-tight uppercase">Grand Total</span>
                         <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(summaryGrandTotal)}</span>
                      </div>
                   </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-5 space-y-2">
                  <Btn variant="primary" type="submit" className="w-full justify-center bg-blue-600 hover:bg-blue-700 py-3 shadow-lg shadow-blue-500/20 rounded-xl" disabled={loading}>
                    {loading ? "Saving..." : editingInvoiceId ? "Save Changes" : "Create Invoice"}
                  </Btn>
                  <Btn variant="outline" onClick={() => setModalOpen(false)} type="button" className="w-full justify-center rounded-xl border-slate-300 dark:border-slate-700">
                    Cancel
                  </Btn>
                </div>
              </div>
            </div>

          </div>
        </form>

        {/* Floating Mobile Summary Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3.5 flex items-center justify-between z-30 shadow-2xl">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Grand Total</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(summaryGrandTotal)}</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="primary" size="sm" type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Saving..." : editingInvoiceId ? "Save" : "Create"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* View & Print Premium Invoice Modal */}
      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Invoice details" size="4xl">
        {viewingInvoice && (
          <div className="space-y-6 pt-2 pb-6">
            
            {/* Control Bar (Print & Close Buttons) */}
            <div className="flex justify-end gap-3 mb-4 print-hide">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/10 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Print / PDF Invoice
              </button>
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* A4 Tax Invoice Content */}
            <div id="printable-invoice" className="bg-white text-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100 shadow-xl space-y-6">
              
              {/* TOP HEADER */}
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-650 dark:text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase">
                    Tax Invoice
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-4">{companyProfile?.name || "My Company"}</h2>
                  {companyProfile?.gstin && <p className="text-xs text-slate-500 mt-1 font-semibold">GSTIN: {companyProfile.gstin}</p>}
                  {companyProfile?.pan && <p className="text-xs text-slate-500 mt-0.5 font-semibold">PAN: {companyProfile.pan}</p>}
                  {companyProfile?.address && <p className="text-xs text-slate-400 mt-1 max-w-xs">{companyProfile.address}</p>}
                </div>
                <div className="text-right space-y-1 text-sm font-medium">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Invoice Details</p>
                  <p className="text-slate-900 dark:text-slate-100 font-extrabold">Bill ID: {viewingInvoice.bill_id}</p>
                  <p className="text-slate-600 dark:text-slate-400">Invoice #: {viewingInvoice.invoice_number || "N/A"}</p>
                  <p className="text-slate-600 dark:text-slate-400">Date: {viewingInvoice.invoice_date}</p>
                </div>
              </div>

              {/* TWO COLUMN INFO (BILL TO & CHALLAN DETAILS) */}
              <div id="printable-invoice-info-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Billed To</h3>
                  <p className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{getContactName(viewingInvoice.contact)}</p>
                  {(() => {
                    const contactObj = contacts.find(c => c.id == viewingInvoice.contact);
                    if (contactObj) {
                      return (
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 space-y-0.5 font-medium">
                          {contactObj.mobile && <p>Mobile: {contactObj.mobile}</p>}
                          {contactObj.billing_address && <p>Address: {contactObj.billing_address}</p>}
                          {contactObj.billing_state && <p>State: {contactObj.billing_state}</p>}
                          {contactObj.gst && <p className="font-extrabold text-slate-700 dark:text-slate-350 mt-1">GSTIN: {contactObj.gst}</p>}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                
                <div id="printable-invoice-info-grid-right" className="md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-6 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Challan Information</h3>
                  <div className="text-sm font-medium">
                    <div>
                      <p className="text-xs text-slate-450">Party Challan No.</p>
                      <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{viewingInvoice.party_challan_no || "N/A"}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">Delivery Challan numbers are listed per item below.</p>
                  </div>
                </div>
              </div>

              {/* ITEMS TABLE */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/10">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-bold text-center w-12">Sr.</th>
                      <th className="px-4 py-3 font-bold">Item Description</th>
                      <th className="px-4 py-3 font-bold w-28">DC No.</th>
                      <th className="px-4 py-3 font-bold text-right w-20">Qty</th>
                      <th className="px-4 py-3 font-bold text-right w-28">Rate</th>
                      <th className="px-4 py-3 font-bold text-right w-20">GST</th>
                      <th className="px-4 py-3 font-bold text-right w-24">GST Amt</th>
                      <th className="px-4 py-3 font-bold text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-850 dark:text-slate-200">
                    {viewingInvoice.items?.map((item, idx) => {
                      const qty = parseFloat(item.quantity) || 0;
                      const rate = parseFloat(item.rate) || 0;
                      const gstPerc = parseFloat(item.gst_percentage) || 5;
                      const taxable = qty * rate;
                      const gstAmt = parseFloat(item.tax_amount) || (taxable * gstPerc / 100);
                      const itemTotal = parseFloat(item.total) || (taxable + gstAmt);

                      return (
                        <tr key={idx} className="bg-white dark:bg-slate-900/10 hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                          <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-extrabold text-slate-900 dark:text-white">{item.description || "Product/Service"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.delivery_challan_no || "-"}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">{qty}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(rate)}</td>
                          <td className="px-4 py-3 text-right font-semibold">{gstPerc}%</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">{formatCurrency(gstAmt)}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white">{formatCurrency(itemTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* CALCULATION SUMMARY PANEL */}
              <div id="printable-invoice-bottom-flex" className="flex flex-col md:flex-row justify-between items-start pt-4 gap-6">
                {/* Notes & Terms */}
                <div className="flex-1 space-y-4 max-w-md w-full">
                  {viewingInvoice.notes && (
                    <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Customer Notes</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{viewingInvoice.notes}</p>
                    </div>
                  )}
                  <div className="h-24 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl flex items-end justify-center p-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/10">
                    Authorized Signatory
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm text-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-2">GST Summary</h4>
                  
                  {(() => {
                    const gstSum = viewingInvoice.gst_summary || {};
                    const subtotal = parseFloat(gstSum.subtotal) || 0;
                    const totalGst = parseFloat(gstSum.total_gst) || 0;
                    const cgst = parseFloat(gstSum.cgst) || (totalGst / 2);
                    const sgst = parseFloat(gstSum.sgst) || (totalGst / 2);
                    const igst = parseFloat(gstSum.igst) || totalGst;
                    const grandTotal = parseFloat(gstSum.grand_total) || (subtotal + totalGst);

                    return (
                      <div className="space-y-2.5 font-medium">
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                          <span>Subtotal (Before Tax)</span>
                          <span className="text-slate-900 dark:text-white font-extrabold">{formatCurrency(subtotal)}</span>
                        </div>

                        {viewGstType === "intra" ? (
                          <>
                            <div className="flex justify-between items-center text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-700">
                              <span>CGST (2.5% / 5% / etc)</span>
                              <span>{formatCurrency(cgst)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-700">
                              <span>SGST (2.5% / 5% / etc)</span>
                              <span>{formatCurrency(sgst)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-700">
                            <span>IGST (5% / 12% / etc)</span>
                            <span>{formatCurrency(igst)}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                          <span>Total GST Amount</span>
                          <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(totalGst)}</span>
                        </div>

                        <div className="pt-3 border-t border-slate-300 dark:border-slate-700 mt-1">
                          <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-base font-black">
                            <span className="text-slate-800 dark:text-emerald-300">Grand Total</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(grandTotal)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Internal note (stripped metadata, visible only in print-hide layout) */}
              {viewingInvoice.display_internal_note && (
                <div className="bg-blue-50/50 dark:bg-blue-950/10 p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/30 text-xs mt-4 print-hide">
                  <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Internal Reference Note</h4>
                  <p className="text-blue-900 dark:text-blue-300">{viewingInvoice.display_internal_note}</p>
                </div>
              )}
            </div>

          </div>
        )}
      </Modal>

      <ItemFormModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        formData={itemFormData}
        setFormData={setItemFormData}
        handleSubmit={handleItemSubmit}
        loading={loading}
      />

      {/* Add Contact Modal */}
      <Modal open={contactModalOpen} onClose={() => setContactModalOpen(false)} title="Add Contact" size="2xl">
        <form onSubmit={handleContactSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Contact Name"
              value={contactFormData.name}
              onChange={(e) => setContactFormData({...contactFormData, name: e.target.value})}
              required
              placeholder="Full Name or Company"
            />
            <InputField
              label="Mobile Number"
              value={contactFormData.mobile}
              onChange={(e) => setContactFormData({...contactFormData, mobile: e.target.value})}
              placeholder="+919876543210"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Email Address"
              type="email"
              value={contactFormData.email}
              onChange={(e) => setContactFormData({...contactFormData, email: e.target.value})}
              placeholder="example@domain.com"
            />
            <InputField
              label="GST Number (Optional)"
              value={contactFormData.gst}
              onChange={(e) => setContactFormData({...contactFormData, gst: e.target.value.toUpperCase()})}
              placeholder="15-char GSTIN"
            />
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-400">Billing Address</h4>
            <InputField
              label="Address Line"
              value={contactFormData.billing_address}
              onChange={(e) => setContactFormData({...contactFormData, billing_address: e.target.value})}
              placeholder="123 Street Name"
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="City"
                value={contactFormData.billing_city}
                onChange={(e) => setContactFormData({...contactFormData, billing_city: e.target.value})}
                placeholder="City"
              />
              <InputField
                label="State"
                value={contactFormData.billing_state}
                onChange={(e) => setContactFormData({...contactFormData, billing_state: e.target.value})}
                placeholder="State"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Pincode"
                value={contactFormData.billing_pincode}
                onChange={(e) => setContactFormData({...contactFormData, billing_pincode: e.target.value})}
                placeholder="Pincode"
              />
              <InputField
                label="Country"
                value={contactFormData.billing_country}
                onChange={(e) => setContactFormData({...contactFormData, billing_country: e.target.value})}
                placeholder="Country"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <Btn variant="outline" type="button" onClick={() => setContactModalOpen(false)}>
              Cancel
            </Btn>
            <Btn variant="primary" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Save Contact"}
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Share Modal */}
      {canShare && (
        <Modal 
          open={shareModalOpen} 
          onClose={() => {
            setShareModalOpen(false);
            setSharingItem(null);
          }} 
          title={sharingItem?.type === "list" ? "Share Invoice List" : "Share Invoice"} 
          size="md"
        >
          <div className="space-y-6 pt-2 pb-4">
            <p className="text-sm text-gray-500">
              {sharingItem?.type === "list" 
                ? "Share the link to the full list of invoices via one of the channels below." 
                : `Share details for Invoice ID: ${sharingItem?.details?.bill_id}.`
              }
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {/* WhatsApp Option */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window === "undefined" || !sharingItem) return;
                  const path = sharingItem.type === "list" 
                    ? `/${userId}/invoices` 
                    : `/share/invoice/${sharingItem.details.bill_id}`;
                  const fullUrl = window.location.origin + path;
                  const text = sharingItem.type === "list" 
                    ? `Hello, please check the Invoice list here: ${fullUrl}` 
                    : `Hello, please find the details of Invoice ${sharingItem.details.bill_id} here: ${fullUrl}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50/20 dark:border-gray-800 dark:hover:border-green-800 dark:hover:bg-green-950/10 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-105 transition-transform">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.416 9.863-9.848.002-2.63-1.023-5.101-2.884-6.963C16.59 1.83 14.116.804 11.488.804 6.056.804 1.63 5.22 1.627 10.652c-.001 1.7.447 3.36 1.299 4.83l-.997 3.646 3.734-.974zm12.39-7.234c-.305-.153-1.808-.891-2.087-.993-.28-.103-.483-.153-.686.153-.203.305-.788.993-.966 1.2-.178.203-.356.228-.661.076-.305-.153-1.288-.475-2.454-1.517-.908-.81-1.52-1.81-1.698-2.115-.178-.305-.019-.47.133-.621.137-.136.305-.356.457-.534.153-.178.203-.356.457-.534.153-.178.203-.356.457-.356z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">WhatsApp</h4>
                    <p className="text-xs text-gray-500">Send via WhatsApp Web or mobile app</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">&rarr;</span>
              </button>

              {/* Email Option */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window === "undefined" || !sharingItem) return;
                  const path = sharingItem.type === "list" 
                    ? `/${userId}/invoices` 
                    : `/share/invoice/${sharingItem.details.bill_id}`;
                  const fullUrl = window.location.origin + path;
                  const subject = sharingItem.type === "list" 
                    ? `Invoice List` 
                    : `Invoice ${sharingItem.details.bill_id} Details`;
                  const body = sharingItem.type === "list" 
                    ? `Please check the Invoice list at: ${fullUrl}` 
                    : `Please check the details of Invoice ${sharingItem.details.bill_id} here: ${fullUrl}`;
                  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_self");
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 dark:border-gray-800 dark:hover:border-blue-800 dark:hover:bg-blue-950/10 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Email</h4>
                    <p className="text-xs text-gray-500">Send email via your local mail client</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">&rarr;</span>
              </button>

              {/* Copy Link Option */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window === "undefined" || !sharingItem) return;
                  const path = sharingItem.type === "list" 
                    ? `/${userId}/invoices` 
                    : `/share/invoice/${sharingItem.details.bill_id}`;
                  const fullUrl = window.location.origin + path;
                  navigator.clipboard.writeText(fullUrl);
                  toast.success("Link copied to clipboard!");
                  setShareModalOpen(false);
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50/20 dark:border-gray-800 dark:hover:border-purple-800 dark:hover:bg-purple-950/10 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                    <LinkIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Copy Link</h4>
                    <p className="text-xs text-gray-500">Copy URL path to clipboard</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">&rarr;</span>
              </button>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="outline" size="sm" type="button" onClick={() => setShareModalOpen(false)}>
                Close
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}