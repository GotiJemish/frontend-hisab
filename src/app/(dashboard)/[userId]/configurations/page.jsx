"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  ShieldCheck, 
  Percent, 
  Settings as SettingsIcon,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Phone,
  Mail,
  Globe,
  Hash,
  MapPin,
  Save,
  ShieldAlert,
  CreditCard
} from "lucide-react";
import { Btn, Card, InputField, Table, Modal, PermissionMatrix } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/context/LoadingContext";
import { useAuth } from "@/context/AuthContext";

export default function ConfigurationsPage() {
  const [activeTab, setActiveTab] = useState("roles"); // "company", "roles", "taxes"
  const toast = useToast();

  const TABS = [
    { id: "company", label: "Company", icon: Building2 },
    { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
    { id: "taxes", label: "Taxes (GST)", icon: Percent },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurations</h1>
          <p className="text-sm text-gray-500">Control organizational settings, role assignments, and tax details</p>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="bg-white dark:bg-[#0F172A] p-1.5 rounded-2xl flex items-center gap-1 border border-gray-100 dark:border-gray-800 shadow-sm w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all
                ${isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300"}
              `}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="mt-4">
        {activeTab === "roles" && <RolesTab />}
        {activeTab === "taxes" && <TaxesTab />}
        {activeTab === "company" && <CompanyTab />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────── */
/* Taxes Management Tab Component      */
/* ─────────────────────────────────── */
function TaxesTab() {
  const [taxes, setTaxes] = useState([]);
  const { loading, setLoading } = useLoading();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({ name: "", rate: "", description: "" });

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/taxes/");
      if (data.success) setTaxes(data.data || []);
    } catch (err) {
      toast.error("Failed to load taxes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tax = null) => {
    if (tax) {
      setEditingTax(tax);
      setFormData({ name: tax.name, rate: tax.rate, description: tax.description || "" });
    } else {
      setEditingTax(null);
      setFormData({ name: "", rate: "", description: "" });
    }
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this tax rate?")) return;
    try {
      await apiClient.delete(`/taxes/${id}/`);
      toast.success("Tax removed");
      fetchTaxes();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, rate: parseFloat(formData.rate) };
      if (editingTax) {
        await apiClient.patch(`/taxes/${editingTax.id}/`, payload);
        toast.success("Tax updated");
      } else {
        await apiClient.post("/taxes/", payload);
        toast.success("Tax created");
      }
      setModalOpen(false);
      fetchTaxes();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "name", header: "Tax Name", sortable: true },
    { key: "rate", header: "Rate (%)", sortable: true, align: "center", render: (val) => `${val}%` },
    { key: "description", header: "Description" },
    {
      key: "actions", header: "Actions", align: "right",
      render: (_, row) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => handleOpenModal(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <Card header={
        <div className="flex items-center justify-between">
          <div><h2 className="text-lg font-bold">Tax Management</h2><p className="text-xs text-gray-500">Configure GST and other tax rates.</p></div>
          <Btn variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => handleOpenModal()}>Add Tax</Btn>
        </div>
      }>
        <div className="-mx-5 -mb-5">
          <Table columns={columns} data={taxes} loading={loading && taxes.length === 0} pagination={true} rowsPerPage={10} striped={true} />
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTax ? "Edit Tax" : "Add Tax"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <InputField label="Tax Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="e.g. GST 18%" />
          <InputField label="Rate (%)" type="number" step="0.01" value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} required />
          <InputField label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Optional details..." />
          <div className="flex justify-end gap-3 pt-4">
            <Btn variant="outline" onClick={() => setModalOpen(false)}>Cancel</Btn>
            <Btn variant="primary" type="submit" disabled={loading}>Save Tax</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─────────────────────────────────── */
/* Roles Management Tab Component      */
/* ─────────────────────────────────── */
function RolesTab() {
  const [roles, setRoles] = useState([]);
  const { loading, setLoading } = useLoading();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({ name: "" });
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/roles/");
      if (data.success) {
        setRoles(data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name });
      setPermissions(role.permissions || {});
    } else {
      setEditingRole(null);
      setFormData({ name: "" });
      setPermissions({});
    }
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await apiClient.delete(`/roles/${id}/`);
      toast.success("Role deleted successfully.");
      setRoles(roles.filter(r => r.id !== id));
    } catch (err) {
      toast.error("Failed to delete role");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Role name is required");
    
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        permissions: permissions
      };

      if (editingRole) {
        const { data } = await apiClient.patch(`/roles/${editingRole.id}/`, payload);
        if (data.success) toast.success("Role updated successfully");
      } else {
        const { data } = await apiClient.post("/roles/", payload);
        if (data.success) toast.success("Role created successfully");
      }
      setModalOpen(false);
      fetchRoles();
    } catch (err) {
      toast.error("Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "name", header: "Role Name", sortable: true },
    { 
      key: "created_at", header: "Created At", sortable: true,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      key: "actions", header: "Actions", align: "center",
      render: (_, row) => (
        <div className="flex justify-center gap-1">
          <button onClick={() => handleOpenModal(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const filtered = roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Organization Roles</h2>
              <p className="text-xs text-gray-500">Define default permission templates for your team members.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search roles..."
                  className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none w-48 sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Btn variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => handleOpenModal()}>
                Add Role
              </Btn>
            </div>
          </div>
        }
      >
        <div className="-mx-5 -mb-5">
           <Table
             columns={columns}
             data={filtered}
             loading={loading && roles.length === 0}
             emptyMessage="No roles found. Create a role to get started."
             pagination={true}
             rowsPerPage={8}
             striped={true}
           />
        </div>
      </Card>

      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingRole ? "Edit Role" : "Create New Role"} 
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <InputField
            label="Role Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            placeholder="e.g. Accountant, Inventory Manager"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Default Permissions Matrix</h3>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Template</span>
            </div>
            <PermissionMatrix permissions={permissions} onChange={setPermissions} />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Btn variant="outline" onClick={() => setModalOpen(false)} type="button">Cancel</Btn>
            <Btn variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : (editingRole ? "Update Role" : "Create Role")}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─────────────────────────────────── */
/* Company Profile Tab Component       */
/* ─────────────────────────────────── */
function CompanyTab() {
  const { user } = useAuth();
  const { loading, setLoading } = useLoading();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    gstin: "",
    pan: "",
    address: ""
  });

  const isAdmin = user?.role === "COMPANY_ADMIN";

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/company/");
      if (data.success) {
        setFormData({
          name: data.data.name || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
          website: data.data.website || "",
          gstin: data.data.gstin || "",
          pan: data.data.pan || "",
          address: data.data.address || ""
        });
      }
    } catch (err) {
      toast.error("Failed to load company details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      return toast.error("Only company administrators can edit organization profiles.");
    }

    if (!formData.name.trim()) {
      return toast.error("Company name is required.");
    }

    if (formData.gstin && formData.gstin.trim().length !== 15) {
      return toast.error("GSTIN must be exactly 15 characters long.");
    }

    if (formData.pan && formData.pan.trim().length !== 10) {
      return toast.error("PAN must be exactly 10 characters long.");
    }

    setLoading(true);
    try {
      const { data } = await apiClient.patch("/company/", formData);
      if (data.success) {
        toast.success("Company profile updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update company details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {!isAdmin && (
        <Card className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">Read-Only Access</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              You are logged in as a Staff User. Only Company Administrators can modify the official organization profile.
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-10">
              <Building2 className="h-48 w-48" />
            </div>
            
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md mb-4 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            
            <h3 className="text-xl font-bold">{formData.name || "My Organization"}</h3>
            <p className="text-xs text-blue-100 mt-1">Official Company Profile & GSTIN Settings</p>
            
            <div className="border-t border-white/10 my-4"></div>
            
            <div className="space-y-2.5 text-xs text-blue-100">
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 opacity-80" />
                <span>GSTIN: {formData.gstin || "Not Configured"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 opacity-80" />
                <span>PAN: {formData.pan || "Not Configured"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 opacity-80" />
                <span>Phone: {formData.phone || "Not Configured"}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Globe className="h-3.5 w-3.5 opacity-80" />
                <span className="truncate max-w-[200px]">{formData.website || "No Website"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">GST Invoicing Requirements</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              To generate valid GST tax invoices, you must provide your company's official registered name, billing address, and 15-character GSTIN. This information is printed directly on your invoices, bills, and challans.
            </p>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card header={
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Organization Profile</h2>
              <p className="text-xs text-gray-500">View and update official organizational details.</p>
            </div>
          }>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Official Company Name"
                  id="company-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={!isAdmin}
                  placeholder="e.g. Acme Corporation Pvt Ltd"
                  leftIcon={<Building2 className="h-4 w-4" />}
                />
                
                <InputField
                  label="GSTIN (GST Identification Number)"
                  id="company-gstin"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  disabled={!isAdmin}
                  placeholder="15-digit alphanumeric (e.g. 27AADCA1154K1Z5)"
                  leftIcon={<Hash className="h-4 w-4" />}
                  maxLength={15}
                />
              </div>

              <InputField
                label="PAN (Permanent Account Number)"
                id="company-pan"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                disabled={!isAdmin}
                placeholder="10-char alphanumeric (e.g. AAACH1234F)"
                leftIcon={<CreditCard className="h-4 w-4" />}
                maxLength={10}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Contact Email Address"
                  id="company-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isAdmin}
                  placeholder="e.g. contact@acme.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                />
                
                <InputField
                  label="Contact Phone"
                  id="company-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isAdmin}
                  placeholder="e.g. +91 99999 99999"
                  leftIcon={<Phone className="h-4 w-4" />}
                />
              </div>

              <InputField
                label="Official Website"
                id="company-website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!isAdmin}
                placeholder="e.g. https://acme.com"
                leftIcon={<Globe className="h-4 w-4" />}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A] dark:text-[#E2E8F0]">
                  Registered Billing Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#94A3B8] dark:text-[#6B7280]">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <textarea
                    id="company-address"
                    rows={4}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isAdmin}
                    placeholder="Enter complete office address..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#111827] dark:text-[#E5E7EB] dark:placeholder-[#6B7280] border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/20 dark:border-[#1F2937] dark:focus:border-[#3B82F6] dark:focus:ring-[#3B82F6]/20"
                  />
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end pt-2">
                  <Btn variant="primary" type="submit" leftIcon={<Save className="h-4 w-4" />} disabled={loading}>
                    Save Company Profile
                  </Btn>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
