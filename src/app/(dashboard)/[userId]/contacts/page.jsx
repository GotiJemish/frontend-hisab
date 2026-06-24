"use client";

import { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, Trash2, Edit, Eye, Phone, Mail, MapPin, Building, FileText, Calendar, User, Shield } from "lucide-react";
import { Btn, Card, InputField, Table, Modal } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const { loading, setLoading } = useLoading();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingContact, setViewingContact] = useState(null);
  const { user, hasPermission } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    pan: "",
    gst: "",
    billing_address: "",
    billing_city: "",
    billing_state: "",
    billing_pincode: "",
    billing_country: "",
    same_as_billing: false,
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_pincode: "",
    shipping_country: "",
    payment_type: "receivable",
    payment_status: "pending",
    notes: "",
  });

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/contacts/");
      if (data.success) {
        setContacts(data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await apiClient.delete(`/contacts/${id}/`);
      toast.success("Contact deleted successfully.");
      setContacts(contacts.filter(c => c.id !== id));
    } catch (err) {
      toast.error("Failed to delete contact");
    }
  };

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name || "",
        mobile: contact.mobile || "",
        email: contact.email || "",
        pan: contact.pan || "",
        gst: contact.gst || "",
        billing_address: contact.billing_address || "",
        billing_city: contact.billing_city || "",
        billing_state: contact.billing_state || "",
        billing_pincode: contact.billing_pincode || "",
        billing_country: contact.billing_country || "",
        same_as_billing: contact.same_as_billing || false,
        shipping_address: contact.shipping_address || "",
        shipping_city: contact.shipping_city || "",
        shipping_state: contact.shipping_state || "",
        shipping_pincode: contact.shipping_pincode || "",
        shipping_country: contact.shipping_country || "",
        payment_type: contact.payment_type || "receivable",
        payment_status: contact.payment_status || "pending",
        notes: contact.notes || "",
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: "",
        mobile: "",
        email: "",
        pan: "",
        gst: "",
        billing_address: "",
        billing_city: "",
        billing_state: "",
        billing_pincode: "",
        billing_country: "",
        same_as_billing: false,
        shipping_address: "",
        shipping_city: "",
        shipping_state: "",
        shipping_pincode: "",
        shipping_country: "",
        payment_type: "receivable",
        payment_status: "pending",
        notes: "",
      });
    }
    setModalOpen(true);
  };

  const handleViewModal = (contact) => {
    setViewingContact(contact);
    setViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name is required");
    if (!formData.mobile.trim() && !formData.email.trim()) {
      return toast.error("Either mobile or email is required");
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.mobile) payload.mobile = null;
      if (!payload.email) payload.email = null;

      if (editingContact) {
        const { data } = await apiClient.patch(`/contacts/${editingContact.id}/`, payload);
        if (data.success) toast.success("Contact updated successfully");
      } else {
        const { data } = await apiClient.post("/contacts/", payload);
        if (data.success) toast.success("Contact created successfully");
      }
      setModalOpen(false);
      fetchContacts();
    } catch (err) {
      if (err.response?.data) {
        // Display backend error messages if available
        const errorMsg = typeof err.response.data === 'string' ? err.response.data : Object.values(err.response.data).join(", ");
        toast.error(`Error: ${errorMsg}`);
      } else {
        toast.error("Failed to save contact");
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.mobile && c.mobile.includes(search))
  );

  const columns = [
    { key: "name", header: "Name", sortable: true },
    { key: "mobile", header: "Mobile", render: (val, row) => val || "N/A" },
    { key: "email", header: "Email", render: (val, row) => val || "N/A" },
    { key: "payment_type", header: "Type", render: (val) => val === "receivable" ? "Customer" : "Vendor" },
    {
      key: "actions", header: "Actions", align: "center",
      render: (_, row) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => handleViewModal(row)} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="View Details">
            <Eye className="h-4 w-4" />
          </button>
          {hasPermission("contacts", "update") && (
            <button onClick={() => handleOpenModal(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg" title="Edit">
              <Edit className="h-4 w-4" />
            </button>
          )}
          {hasPermission("contacts", "delete") && (
            <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  if (user && !hasPermission("contacts", "read")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-[#0F172A] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm max-w-md mx-auto mt-12">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-full text-red-500 dark:text-red-400 mb-4 ring-8 ring-red-50/50 dark:ring-red-950/10">
          <Shield className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          You do not have the required permissions to view or manage organization contacts. Please contact your administrator if you believe this is an error.
        </p>
        <Btn variant="primary" onClick={() => window.location.href = `/${user?.user_id || ""}`}>
          Back to Dashboard
        </Btn>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts Management</h1>
          <p className="text-sm text-gray-500">Manage your customers and vendors</p>
        </div>
        {hasPermission("contacts", "create") && (
          <Btn variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => handleOpenModal()}>
            Add Contact
          </Btn>
        )}
      </div>

      <Card
        header={
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Contacts List</h2>
            <div className="flex items-center gap-2">
              <InputField
                id="search-contacts" type="search" placeholder="Search by name, email or mobile..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
              <Btn variant="ghost" size="sm" onClick={fetchContacts}>
                <RefreshCw className={`h-4 w-4 ${loading && contacts.length === 0 ? "animate-spin" : ""}`} />
              </Btn>
            </div>
          </div>
        }
      >
        <div className="-mx-5 -mb-5">
           <Table
             columns={columns}
             data={filtered}
             loading={loading && contacts.length === 0}
             emptyMessage="No contacts found. Click 'Add Contact' to create one."
             pagination={true}
             rowsPerPage={10}
             striped={true}
           />
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingContact ? "Edit Contact" : "Add Contact"} size="3xl">
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
               <div className="w-1/2">
                <InputField
                    label="Mobile Number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    placeholder="+1234567890"
                />
               </div>
               <div className="w-1/2">
                <InputField
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="example@domain.com"
                />
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="PAN Number (Optional)"
              value={formData.pan}
              onChange={(e) => setFormData({...formData, pan: e.target.value.toUpperCase()})}
              placeholder="ABCDE1234F"
            />
            <InputField
              label="GST Number (Optional)"
              value={formData.gst}
              onChange={(e) => setFormData({...formData, gst: e.target.value.toUpperCase()})}
              placeholder="15-char GSTIN"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              {/* Billing Address */}
              <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Billing Address</h3>
                  <InputField
                      label="Address Line"
                      value={formData.billing_address}
                      onChange={(e) => setFormData({...formData, billing_address: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                        label="City"
                        value={formData.billing_city}
                        onChange={(e) => setFormData({...formData, billing_city: e.target.value})}
                    />
                    <InputField
                        label="State"
                        value={formData.billing_state}
                        onChange={(e) => setFormData({...formData, billing_state: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                        label="Pincode"
                        value={formData.billing_pincode}
                        onChange={(e) => setFormData({...formData, billing_pincode: e.target.value})}
                    />
                    <InputField
                        label="Country"
                        value={formData.billing_country}
                        onChange={(e) => setFormData({...formData, billing_country: e.target.value})}
                    />
                  </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Shipping Address</h3>
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <input 
                        type="checkbox" 
                        checked={formData.same_as_billing}
                        onChange={(e) => setFormData({...formData, same_as_billing: e.target.checked})}
                        className="rounded text-blue-600"
                      />
                      Same as Billing
                    </label>
                  </div>
                  {!formData.same_as_billing && (
                    <>
                      <InputField
                          label="Address Line"
                          value={formData.shipping_address}
                          onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <InputField
                            label="City"
                            value={formData.shipping_city}
                            onChange={(e) => setFormData({...formData, shipping_city: e.target.value})}
                        />
                        <InputField
                            label="State"
                            value={formData.shipping_state}
                            onChange={(e) => setFormData({...formData, shipping_state: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <InputField
                            label="Pincode"
                            value={formData.shipping_pincode}
                            onChange={(e) => setFormData({...formData, shipping_pincode: e.target.value})}
                        />
                        <InputField
                            label="Country"
                            value={formData.shipping_country}
                            onChange={(e) => setFormData({...formData, shipping_country: e.target.value})}
                        />
                      </div>
                    </>
                  )}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Type</label>
              <select
                  value={formData.payment_type}
                  onChange={(e) => setFormData({...formData, payment_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E293B] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                  <option value="receivable">Customer (Receivable)</option>
                  <option value="payable">Vendor (Payable)</option>
              </select>
            </div>
            <InputField
              label="Additional Notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Remarks..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Btn variant="outline" onClick={() => setModalOpen(false)} type="button">Cancel</Btn>
            <Btn variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Contact"}
            </Btn>
          </div>
        </form>
      </Modal>

      {/* View Contact Details Modal */}
      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Contact Profile" size="xl">
        {viewingContact && (
          <div className="space-y-6 pt-4 text-gray-800 dark:text-gray-200">
            
            {/* Header Profile Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/80 dark:to-slate-800/80 p-5 rounded-2xl border border-blue-100 dark:border-gray-700/60 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
                  <span className="text-2xl font-bold">{viewingContact.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{viewingContact.name}</h2>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-1.5 text-sm text-gray-600 dark:text-gray-300">
                    {viewingContact.mobile && (
                      <span className="flex items-center gap-1.5 bg-white/60 dark:bg-black/20 px-2.5 py-1 rounded-md border border-gray-200/50 dark:border-gray-700/50">
                        <Phone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        {viewingContact.mobile}
                      </span>
                    )}
                    {viewingContact.email && (
                      <span className="flex items-center gap-1.5 bg-white/60 dark:bg-black/20 px-2.5 py-1 rounded-md border border-gray-200/50 dark:border-gray-700/50">
                        <Mail className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                        {viewingContact.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-center absolute top-4 right-4 sm:static">
                <span className={`px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full border shadow-sm tracking-wider uppercase ${
                  viewingContact.payment_type === "receivable" 
                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50" 
                    : "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50"
                }`}>
                  {viewingContact.payment_type === "receivable" ? "Customer" : "Vendor"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Tax & Financial Info */}
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-700/60 p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700/50 pb-2 uppercase tracking-wider">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Tax Identifiers
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">PAN Number</p>
                    <p className="text-sm font-medium mt-1 text-gray-900 dark:text-gray-100">{viewingContact.pan || <span className="text-gray-400 italic">Not Provided</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">GST Number</p>
                    <p className="text-sm font-medium mt-1 text-gray-900 dark:text-gray-100">{viewingContact.gst || <span className="text-gray-400 italic">Not Provided</span>}</p>
                  </div>
                </div>
              </div>

              {/* Remarks / Notes */}
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-700/60 p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700/50 pb-2 uppercase tracking-wider">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Additional Notes
                </h3>
                {viewingContact.notes ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {viewingContact.notes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic flex items-center justify-center h-10">
                    No remarks added.
                  </p>
                )}
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 gap-6">
              {/* Billing Address */}
              <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wider">
                  <Building className="h-4 w-4 text-blue-500" />
                  Billing Address
                </h3>
                {viewingContact.billing_address || viewingContact.billing_city ? (
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{viewingContact.billing_address}</p>
                      <p>
                        {viewingContact.billing_city}
                        {viewingContact.billing_state ? `, ${viewingContact.billing_state}` : ""}
                        {viewingContact.billing_pincode ? ` - ${viewingContact.billing_pincode}` : ""}
                      </p>
                      <p className="font-medium text-gray-500 dark:text-gray-400">{viewingContact.billing_country}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-400 italic">
                    No billing address
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  Shipping Address
                  {viewingContact.same_as_billing && (
                    <span className="ml-auto text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full tracking-normal">
                      Same as Billing
                    </span>
                  )}
                </h3>
                {viewingContact.shipping_address || viewingContact.shipping_city ? (
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{viewingContact.shipping_address}</p>
                      <p>
                        {viewingContact.shipping_city}
                        {viewingContact.shipping_state ? `, ${viewingContact.shipping_state}` : ""}
                        {viewingContact.shipping_pincode ? ` - ${viewingContact.shipping_pincode}` : ""}
                      </p>
                      <p className="font-medium text-gray-500 dark:text-gray-400">{viewingContact.shipping_country}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-400 italic">
                    No shipping address
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-[#1E293B] px-5 py-3 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created: {new Date(viewingContact.created_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Last Updated: {new Date(viewingContact.updated_at).toLocaleString()}</span>
              </div>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
