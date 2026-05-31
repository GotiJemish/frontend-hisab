"use client";

import { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, Trash2, Edit, Package, Eye } from "lucide-react";
import { Btn, Card, InputField, Table, Modal } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";

import ItemFormModal, { ITEM_TYPES, UNIT_TYPES, TAX_CATEGORIES } from "./components/ItemFormModal";
import ItemDetailModal from "./components/ItemDetailModal";


export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const { loading, setLoading } = useLoading();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const toast = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    type: "service",
    unit_type: "Pcs",
    tax_category: "none",
    rate: "",
    discount: "",
    with_tax: false,
    sac: "",
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/items/");
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await apiClient.delete(`/items/${id}/`);
      toast.success("Item deleted successfully.");
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete item");
    }
  };

  const handleOpenModal = (i = null) => {
    if (i) {
      setEditingItem(i);
      setFormData({
        name: i.name || "",
        type: i.type || "service",
        unit_type: i.unit_type || "Pcs",
        tax_category: i.tax_category || "none",
        rate: i.rate || "",
        discount: i.discount || "",
        with_tax: i.with_tax || false,
        sac: i.sac || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        type: "service",
        unit_type: "Pcs",
        tax_category: "none",
        rate: "",
        discount: "",
        with_tax: false,
        sac: "",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        rate: parseFloat(formData.rate) || 0,
        discount: parseFloat(formData.discount) || 0,
        sac: parseInt(formData.sac, 10) || 0,
      };
      
      let res;
      if (editingItem) {
        res = await apiClient.patch(`/items/${editingItem.id}/`, payload);
      } else {
        res = await apiClient.post("/items/", payload);
      }

      if (res.data.success) {
        toast.success(res.data.message || "Operation successful");
        setModalOpen(false);
        fetchItems();
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        const firstKey = Object.keys(resp.errors)[0];
        toast.error(resp.errors[firstKey][0] || "Validation Error");
      } else {
        toast.error(resp?.message || "Failed to save item");
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((i) => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.type.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "name", 
      header: "Name",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <Package className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {row.name}
            </span>
            <span className="text-xs text-gray-500 capitalize">{row.type}</span>
          </div>
        </div>
      )
    },
    { 
      key: "rate", 
      header: "Rate",
      sortable: true,
      render: (_, row) => (
        <span>₹{parseFloat(row.rate).toFixed(2)}</span>
      )
    },
    { 
      key: "tax_category", 
      header: "Tax",
      sortable: true,
      render: (_, row) => {
        const tax = TAX_CATEGORIES.find(t => t.value === row.tax_category);
        return <span className="text-sm text-gray-600 dark:text-gray-300">{tax ? tax.label : row.tax_category}</span>;
      }
    },
    {
      key: "unit_type",
      header: "Unit",
      sortable: true,
      render: (_, row) => {
        const unit = UNIT_TYPES.find(u => u.value === row.unit_type);
        return <span className="text-sm text-gray-600 dark:text-gray-300">{unit ? unit.label : row.unit_type}</span>;
      }
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (_, row) => (
        <div className="flex justify-center gap-1">
          <button
            onClick={() => {
              setViewingItem(row);
              setDetailModalOpen(true);
            }}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleOpenModal(row)}
            className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
            title="Edit Item"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
            title="Delete Item"
          >
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Items & Inventory</h1>
          <p className="text-sm text-gray-500">Manage products, services, and charges for your organization.</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => handleOpenModal()}>
            Add Item
          </Btn>
        </div>
      </div>

      <Card
        header={
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Items Directory</h2>
            <div className="flex items-center gap-2">
              <InputField
                id="search-items"
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
              <Btn variant="ghost" size="sm" onClick={fetchItems}>
                <RefreshCw className={`h-4 w-4 ${loading && items.length === 0 ? "animate-spin" : ""}`} />
              </Btn>
            </div>
          </div>
        }
      >
        <div className="-mx-5 -mb-5">
           <Table
             columns={columns}
             data={filtered}
             loading={loading && items.length === 0}
             emptyMessage="No items found in your organization."
             pagination={true}
             rowsPerPage={10}
             striped={true}
             hoverable={true}
           />
        </div>
      </Card>

      <ItemFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        loading={loading}
      />

      <ItemDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        viewingItem={viewingItem}
      />

    </div>
  );
}