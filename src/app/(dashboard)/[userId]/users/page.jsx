"use client";

import { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, Trash2, Shield, User as UserIcon } from "lucide-react";
import { Btn, Card, InputField, Table, Modal } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();
  const { user } = useAuth(); // Current logged-in user

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "STAFF",
  });

  const [permissions, setPermissions] = useState({
    invoices: true,
    items: true,
    contacts: true,
  });

  const availablePermissions = [
    { id: "invoices", label: "Create, Edit & Delete Invoices" },
    { id: "items", label: "Manage Items / Inventory" },
    { id: "contacts", label: "Manage Contacts / Customers" },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/users/");
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this user from your company?")) return;
    try {
      await apiClient.delete(`/users/${id}/`);
      toast.success("User removed successfully.");
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove user");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: formData.role,
        permissions: formData.role === "COMPANY_ADMIN" ? { all: true } : permissions,
      };
      
      const { data } = await apiClient.post("/users/", payload);
      if (data.success) {
        toast.success(data.message || "User added successfully");
        setModalOpen(false);
        fetchUsers();
        setFormData({ firstName: "", lastName: "", email: "", role: "STAFF" });
        setPermissions({ invoices: true, items: true, contacts: true });
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        const firstKey = Object.keys(resp.errors)[0];
        toast.error(resp.errors[firstKey][0] || "Validation Error");
      } else {
        toast.error(resp?.message || "Failed to add user");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (id) => {
    setPermissions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = users.filter((u) => 
    (u.first_name + " " + u.last_name).toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "name", 
      header: "Name",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 uppercase font-bold text-xs">
            {row.first_name?.[0]}{row.last_name?.[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {row.first_name} {row.last_name}
            </span>
            <span className="text-xs text-gray-500">{row.email}</span>
          </div>
        </div>
      )
    },
    { 
      key: "role", 
      header: "Role",
      align: "center",
      render: (role) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          role === "COMPANY_ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        }`}>
          {role === "COMPANY_ADMIN" ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
          {role === "COMPANY_ADMIN" ? "Admin" : "Staff"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (_, row) => (
        row.id !== user?.user_id && (
          <button
            onClick={() => handleDelete(row.id)}
            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
            title="Remove User"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Users</h1>
          <p className="text-sm text-gray-500">Manage access and roles for your company members.</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            Add User
          </Btn>
        </div>
      </div>

      <Card
        header={
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Directory</h2>
            <div className="flex items-center gap-2">
              <InputField
                id="search-users"
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
              <Btn variant="ghost" size="sm" onClick={fetchUsers}>
                <RefreshCw className={`h-4 w-4 ${loading && users.length === 0 ? "animate-spin" : ""}`} />
              </Btn>
            </div>
          </div>
        }
      >
        <div className="-mx-5 -mb-5">
           <Table
             columns={columns}
             data={filtered}
             loading={loading && users.length === 0}
             emptyMessage="No users found."
           />
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Invite User" size="md">
        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
             <InputField
               label="First Name"
               value={formData.firstName}
               onChange={(e) => setFormData({...formData, firstName: e.target.value})}
               required
             />
             <InputField
               label="Last Name"
               value={formData.lastName}
               onChange={(e) => setFormData({...formData, lastName: e.target.value})}
               required
             />
          </div>
          
          <InputField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            helperText="An email will be sent with their temporary password."
          />

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 dark:text-gray-300">Assign Role</label>
            <select 
              className="rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-blue-500" 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="STAFF">Staff (Custom Permissions)</option>
              <option value="COMPANY_ADMIN">Company Admin (Full Access)</option>
            </select>
          </div>

          {formData.role === "STAFF" && (
            <div className="p-4 border rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-sm font-bold block mb-3 dark:text-gray-300">Specific Permissions</label>
              <div className="space-y-2.5">
                {availablePermissions.map(p => (
                  <label key={p.id} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                      checked={permissions[p.id]} 
                      onChange={() => togglePermission(p.id)} 
                    />
                    <span className="font-medium">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Btn variant="outline" onClick={() => setModalOpen(false)} type="button">Cancel</Btn>
            <Btn variant="primary" type="submit" disabled={loading}>
              {loading ? "Inviting..." : "Send Invite"}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}