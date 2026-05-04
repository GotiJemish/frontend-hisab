"use client";

import { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, Trash2, Shield, User as UserIcon, Edit } from "lucide-react";
import { Btn, Card, InputField, Table, Modal, PermissionMatrix } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const { loading, setLoading } = useLoading();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const toast = useToast();
  const { user } = useAuth(); // Current logged-in user

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "STAFF",
    roleId: "",
  });

  const [permissions, setPermissions] = useState({});

  const availablePermissions = [
    { id: "invoices", label: "Create, Edit & Delete Invoices" },
    { id: "items", label: "Manage Items / Inventory" },
    { id: "contacts", label: "Manage Contacts / Customers" },
  ];

  const fetchUsers = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/users/", { params: { page: pageNumber } });
      if (data.success) {
        setTotalItems(data.data.count || 0);
        const results = data.data.results || data.data || [];
        const formattedUsers = results.map(u => ({
          ...u,
          name: `${u.first_name} ${u.last_name}`.trim(),
        }));
        setUsers(formattedUsers);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await apiClient.get("/roles/");
      if (data.success) {
        setRoles(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  useEffect(() => {
    fetchUsers(page);
    fetchRoles();
  }, [page]);

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

  const handleOpenModal = (u = null) => {
    if (u) {
      setEditingUser(u);
      setFormData({
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        role: u.role,
        roleId: u.custom_role || "",
      });
      setPermissions(u.permissions || {});
    } else {
      setEditingUser(null);
      setFormData({ firstName: "", lastName: "", email: "", role: "STAFF", roleId: "" });
      setPermissions({});
    }
    setModalOpen(true);
  };

  const handleRoleChange = (e) => {
    const roleId = e.target.value;
    const selectedRole = roles.find(r => r.id === roleId);
    
    setFormData({ 
      ...formData, 
      roleId: roleId,
      // If a custom role is selected, we usually default to STAFF backend role
      role: roleId ? "STAFF" : "STAFF" 
    });

    if (selectedRole) {
      setPermissions(selectedRole.permissions || {});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: formData.role,
        custom_role_id: formData.roleId || null,
        permissions: formData.role === "COMPANY_ADMIN" ? { all: true } : permissions,
      };
      
      let res;
      if (editingUser) {
        res = await apiClient.patch(`/users/${editingUser.id}/`, payload);
      } else {
        res = await apiClient.post("/users/", payload);
      }

      if (res.data.success) {
        toast.success(res.data.message || "Operation successful");
        setModalOpen(false);
        fetchUsers(page);
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
      sortable: true,
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
      sortable: true,
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
        <div className="flex justify-center gap-1">
          {row.id !== user?.user_id && (
            <>
              <button
                onClick={() => handleOpenModal(row)}
                className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                title="Edit User"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                title="Remove User"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
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
          <Btn variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => handleOpenModal()}>
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
             emptyMessage="No users found in your organization."
             pagination={true}
             serverPagination={true}
             totalItems={totalItems}
             page={page}
             onPageChange={(p) => setPage(p)}
             rowsPerPage={10}
             striped={true}
             hoverable={true}
           />
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? "Edit User" : "Invite User"} size="2xl">
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
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
            disabled={!!editingUser}
            helperText={!editingUser && "An email will be sent with their temporary password."}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1 dark:text-gray-300">System Role</label>
              <select 
                className="rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-blue-500" 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="STAFF">Staff</option>
                <option value="COMPANY_ADMIN">Company Admin (Full Access)</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1 dark:text-gray-300">Custom Organization Role</label>
              <select 
                className="rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-blue-500" 
                value={formData.roleId} 
                onChange={handleRoleChange}
              >
                <option value="">None (Custom Permissions)</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.role === "STAFF" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold block dark:text-gray-300 text-gray-700">Permissions Matrix</label>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Override Defaults</span>
              </div>
              <PermissionMatrix permissions={permissions} onChange={setPermissions} />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Btn variant="outline" onClick={() => setModalOpen(false)} type="button">Cancel</Btn>
            <Btn variant="primary" type="submit" disabled={loading}>
              {loading ? "Processing..." : (editingUser ? "Update User" : "Send Invite")}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}