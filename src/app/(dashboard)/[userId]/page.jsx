"use client";

import { useState } from "react";
import { Plus, Download, RefreshCw, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { Btn } from "@/components/ui";
import { Card } from "@/components/ui";
import { Alert } from "@/components/ui";
import { InputField } from "@/components/ui";
import { Table } from "@/components/ui";
import { Modal } from "@/components/ui";
import InvoiceForm from "@/components/features/invoices/InvoiceForm";

// ── Sample data ──────────────────────────────────────────────────
const STAT_CARDS = [
  { label: "Total Revenue", value: "₹1,24,500", change: "+12.5%", positive: true },
  { label: "Active Users", value: "3,482", change: "+8.1%", positive: true },
  { label: "Pending Bills", value: "47", change: "-3.2%", positive: false },
  { label: "Paid Invoices", value: "284", change: "+21.4%", positive: true },
];

const SAMPLE_ROWS = [
  { id: "INV-001", client: "Ravi Enterprises", amount: "₹12,500", date: "2026-03-15", status: "paid" },
  { id: "INV-002", client: "Sharma & Co.", amount: "₹8,200", date: "2026-03-16", status: "pending" },
  { id: "INV-003", client: "Blue Horizon Ltd.", amount: "₹34,000", date: "2026-03-10", status: "overdue" },
  { id: "INV-004", client: "TechSpace Pvt.", amount: "₹6,750", date: "2026-03-18", status: "paid" },
  { id: "INV-005", client: "Nirmala Traders", amount: "₹2,900", date: "2026-03-19", status: "pending" },
];

const STATUS_MAP = {
  paid: { label: "Paid", cls: "bg-[#F0FDF4] text-[#166534] dark:bg-[#052E16]/40 dark:text-[#22C55E]" },
  pending: { label: "Pending", cls: "bg-[#FFFBEB] text-[#92400E] dark:bg-[#451A03]/40 dark:text-[#FBBF24]" },
  overdue: { label: "Overdue", cls: "bg-[#FEF2F2] text-[#991B1B] dark:bg-[#450A0A]/40 dark:text-[#F87171]" },
};

const TABLE_COLUMNS = [
  { key: "id", header: "Invoice ID" },
  { key: "client", header: "Client" },
  { key: "amount", header: "Amount", align: "right" },
  { key: "date", header: "Date" },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (value) => {
      const s = STATUS_MAP[value] ?? STATUS_MAP.pending;
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
          {s.label}
        </span>
      );
    },
  },
  {
    key: "__actions",
    header: "Actions",
    align: "center",
    render: (_v, row) => (
      <div className="flex items-center justify-center gap-1.5">
        <button
          type="button"
          aria-label={`View ${row.id}`}
          className="rounded-lg p-1.5 text-[#0EA5E9] hover:bg-[#F0F9FF] dark:hover:bg-[#082F49]/40 transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={`Edit ${row.id}`}
          className="rounded-lg p-1.5 text-[#F59E0B] hover:bg-[#FFFBEB] dark:hover:bg-[#451A03]/40 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${row.id}`}
          className="rounded-lg p-1.5 text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#450A0A]/40 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = SAMPLE_ROWS.filter(
    (r) =>
      r.client.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  function simulateRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  }

  return (
    <div className="space-y-6">
      {/* ── Page heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">
            Dashboard
          </h1>
          <p className="text-sm text-[#94A3B8] dark:text-[#6B7280] mt-0.5">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn
            variant="ghost"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Btn>
          <Btn
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            New Invoice
          </Btn>
        </div>
      </div>

      {/* ── Alert ── */}
      <Alert variant="info" title="Month-end reporting" dismissible>
        Your March 2026 report is ready to review. Click Export to download.
      </Alert>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.label} hover>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-[#6B7280]">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">
              {card.value}
            </p>
            <span
              className={`mt-1 text-sm font-medium ${card.positive
                ? "text-[#22C55E]"
                : "text-[#EF4444] dark:text-[#F87171]"
                }`}
            >
              {card.change} from last month
            </span>
          </Card>
        ))}
      </div>

      {/* ── Invoice table ── */}
      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">
              Recent Invoices
            </h2>
            <div className="flex items-center gap-2">
              <InputField
                id="invoice-search"
                type="search"
                placeholder="Search invoices…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full sm:w-64"
              />
              <Btn
                variant="ghost"
                size="sm"
                leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
                onClick={simulateRefresh}
                aria-label="Refresh table"
              >
                Refresh
              </Btn>
            </div>
          </div>
        }
      >
        <div className="-mx-5 -mb-5">
          <Table
            columns={TABLE_COLUMNS}
            data={filtered}
            striped
            hoverable
            loading={loading}
            emptyMessage="No invoices match your search."
          />
        </div>
      </Card>

      {/* ── New Invoice Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Sale Invoice"
        size="full"
      >
        <InvoiceForm onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
