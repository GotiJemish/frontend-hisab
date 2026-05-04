"use client";

import { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, Trash2, Edit } from "lucide-react";
import { Btn, Card, InputField, Table, Modal, PermissionMatrix } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/context/LoadingContext";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const { loading, setLoading } = useLoading();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({ name: "" });
  const [permissions, setPermissions] = useState({});

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

  useEffect(() => {
    fetchRoles();
  }, []);

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

  const filtered = roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: "name", header: "Role Name", sortable: true },
    { 
      key: "created_at", header: "Created At", sortable: true,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      key: "actions", header: "Actions", align: "center",
      render: (_, row) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => handleOpenModal(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
            <Edit className="h-4 w-4" />
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Role Management</h1>
          <p className="text-sm text-gray-500">Manage standard permissions across organizational roles</p>
        </div>
        <Btn variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => handleOpenModal()}>
          Create Role
        </Btn>
      </div>

      <Card
        header={
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Roles</h2>
            <div className="flex items-center gap-2">
              <InputField
                id="search-roles" type="search" placeholder="Search..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
              <Btn variant="ghost" size="sm" onClick={fetchRoles}>
                <RefreshCw className={`h-4 w-4 ${loading && roles.length === 0 ? "animate-spin" : ""}`} />
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
             emptyMessage="No roles found in your organization. Create one!"
             pagination={true}
             rowsPerPage={10}
             striped={true}
           />
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingRole ? "Edit Role" : "Create Role"} size="2xl">
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <InputField
            label="Role Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            placeholder="e.g. Sales Manager"
          />

          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Default Permissions Matrix</h3>
            <PermissionMatrix permissions={permissions} onChange={setPermissions} />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Btn variant="outline" onClick={() => setModalOpen(false)} type="button">Cancel</Btn>
            <Btn variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Role"}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
