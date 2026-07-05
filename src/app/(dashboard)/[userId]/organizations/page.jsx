"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Btn, Card, InputField, Table, Modal } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useParams, useRouter } from "next/navigation";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const { loading, setLoading } = useLoading();
  const toast = useToast();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId || "";

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/admin/companies/");
      if (data.success) {
        setOrganizations(data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      router.push(`/${userId}`);
      return;
    }
    fetchOrganizations();
  }, [user]);

  const handleSetStatus = async (org, statusValue) => {
    try {
      setLoading(true);
      const { data } = await apiClient.patch(`/admin/companies/${org.id}/`, {
        status: statusValue
      });
      if (data.success) {
        toast.success(`Organization "${org.name}" status updated to ${statusValue} successfully!`);
        // Update local state
        setOrganizations(prev => prev.map(o => o.id === org.id ? { ...o, status: statusValue, is_approved: statusValue === "approved" } : o));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update status`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = organizations.filter(org => {
    const matchesSearch = 
      (org.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (org.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (org.gstin || "").toLowerCase().includes(search.toLowerCase());
      
    const matchesFilter = 
      statusFilter === "all" || 
      org.status === statusFilter;
      
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      key: "name",
      header: "Organization Name",
      sortable: true,
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{val || "Unnamed Company"}</span>
          <span className="text-xs text-gray-500">{row.email || "No email"}</span>
        </div>
      )
    },
    {
      key: "phone",
      header: "Phone",
      render: (val) => val || "-"
    },
    {
      key: "gstin",
      header: "GSTIN / PAN",
      render: (_, row) => (
        <div className="flex flex-col text-xs text-gray-600 dark:text-gray-400">
          <span>GSTIN: {row.gstin || "-"}</span>
          <span>PAN: {row.pan || "-"}</span>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (_, row) => {
        const statusMap = {
          approved: { text: "Approved", class: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
          pending: { text: "Pending", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
          on_hold: { text: "On Hold", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
          rejected: { text: "Rejected", class: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
        };
        const config = statusMap[row.status] || { text: row.status || "Pending", class: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.class}`}>
            {config.text}
          </span>
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (_, row) => (
        <div className="flex justify-center gap-1.5">
          <button 
            type="button"
            onClick={() => {
              setSelectedOrg({ org: row, action: "approved" });
              setConfirmOpen(true);
            }}
            disabled={row.status === "approved" || loading}
            className={`rounded-lg px-2 py-1 text-xs font-medium border transition-colors ${
              row.status === "approved" 
                ? "bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800/40 dark:text-gray-600 dark:border-gray-800 cursor-not-allowed" 
                : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 cursor-pointer"
            }`}
            title="Approve organization"
          >
            Approve
          </button>
          <button 
            type="button"
            onClick={() => {
              setSelectedOrg({ org: row, action: "on_hold" });
              setConfirmOpen(true);
            }}
            disabled={row.status === "on_hold" || loading}
            className={`rounded-lg px-2 py-1 text-xs font-medium border transition-colors ${
              row.status === "on_hold" 
                ? "bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800/40 dark:text-gray-600 dark:border-gray-800 cursor-not-allowed" 
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800 cursor-pointer"
            }`}
            title="Put organization on hold"
          >
            Hold
          </button>
          <button 
            type="button"
            onClick={() => {
              setSelectedOrg({ org: row, action: "rejected" });
              setConfirmOpen(true);
            }}
            disabled={row.status === "rejected" || loading}
            className={`rounded-lg px-2 py-1 text-xs font-medium border transition-colors ${
              row.status === "rejected" 
                ? "bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800/40 dark:text-gray-600 dark:border-gray-800 cursor-not-allowed" 
                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 cursor-pointer"
            }`}
            title="Reject organization"
          >
            Reject
          </button>
        </div>
      )
    }
  ];

  if (user && user.role !== "SUPER_ADMIN") {
    return null; // Redirecting...
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Organizations</h1>
          <p className="text-sm text-gray-500">Manage all registered companies, view details, and approve/suspend/hold their access.</p>
        </div>
      </div>

      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Organization Directory</h2>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-hidden text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="on_hold">On Hold</option>
                <option value="rejected">Rejected</option>
              </select>
              <InputField
                id="search-orgs"
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full sm:w-48"
              />
              <Btn variant="ghost" size="sm" onClick={fetchOrganizations}>
                <RefreshCw className={`h-4 w-4 ${loading && organizations.length === 0 ? "animate-spin" : ""}`} />
              </Btn>
            </div>
          </div>
        }
      >
        <div className="-mx-5 -mb-5">
          <Table
            columns={columns}
            data={filtered}
            loading={loading && organizations.length === 0}
            emptyMessage="No organizations found in the system."
            striped={true}
            hoverable={true}
          />
        </div>
      </Card>
      {user?.role === "SUPER_ADMIN" && (
        <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Change Organization Status" size="md">
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to change the status of organization <strong>{selectedOrg?.org?.name}</strong> to <strong className="uppercase font-bold text-gray-900 dark:text-white">{selectedOrg?.action}</strong>?
            </p>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs text-gray-500 space-y-1 border border-gray-150 dark:border-gray-800">
              {selectedOrg?.action === "on_hold" && (
                <p>⚠️ <strong>On Hold:</strong> The organization's users will be restricted to read-only access. They can view data, but any creation, modification, or deletion operations will be blocked.</p>
              )}
              {selectedOrg?.action === "rejected" && (
                <p>⛔ <strong>Rejected:</strong> The organization will be suspended, and their users will immediately be blocked from logging into HISAAB.</p>
              )}
              {selectedOrg?.action === "approved" && (
                <p>✅ <strong>Approved:</strong> The organization will become active, and their users will have full write/operational permissions.</p>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Btn variant="outline" onClick={() => setConfirmOpen(false)} type="button">Cancel</Btn>
              <Btn variant="primary" onClick={async () => {
                if (selectedOrg) {
                  await handleSetStatus(selectedOrg.org, selectedOrg.action);
                  setConfirmOpen(false);
                }
              }} disabled={loading}>
                {loading ? "Updating..." : "Confirm Action"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
