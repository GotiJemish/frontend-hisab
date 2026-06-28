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

  const handleToggleApproval = async (org) => {
    const nextStatus = !org.is_approved;
    const actionText = nextStatus ? "approve" : "suspend";

    try {
      setLoading(true);
      const { data } = await apiClient.patch(`/admin/companies/${org.id}/`, {
        is_approved: nextStatus
      });
      if (data.success) {
        toast.success(`Organization ${nextStatus ? "approved" : "suspended"} successfully!`);
        // Update local state
        setOrganizations(prev => prev.map(o => o.id === org.id ? { ...o, is_approved: nextStatus } : o));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${actionText} organization`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = organizations.filter(org => 
    (org.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (org.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (org.gstin || "").toLowerCase().includes(search.toLowerCase())
  );

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
      render: (_, row) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          row.is_approved 
            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" 
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
        }`}>
          {row.is_approved ? "Approved" : "Pending Approval"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (_, row) => (
        <div className="flex justify-center">
          <Btn 
            variant={row.is_approved ? "outline" : "primary"} 
            size="sm"
            onClick={() => {
              setSelectedOrg(row);
              setConfirmOpen(true);
            }}
            className={row.is_approved ? "border-amber-500! text-amber-500! hover:bg-amber-50!" : "bg-green-600! hover:bg-green-700!"}
          >
            {row.is_approved ? "Suspend" : "Approve"}
          </Btn>
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
          <p className="text-sm text-gray-500">Manage all registered companies, view details, and approve/suspend their access.</p>
        </div>
      </div>

      <Card
        header={
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Organization Directory</h2>
            <div className="flex items-center gap-2">
              <InputField
                id="search-orgs"
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
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
        <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={selectedOrg?.is_approved ? "Suspend Organization" : "Approve Organization"} size="md">
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to {selectedOrg?.is_approved ? "suspend" : "approve"} the organization <strong>{selectedOrg?.name}</strong>?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Btn variant="outline" onClick={() => setConfirmOpen(false)} type="button">Cancel</Btn>
              <Btn variant="primary" onClick={async () => {
                if (selectedOrg) {
                  await handleToggleApproval(selectedOrg);
                  setConfirmOpen(false);
                }
              }} disabled={loading}>
                {loading ? "Processing..." : (selectedOrg?.is_approved ? "Suspend" : "Approve")}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
