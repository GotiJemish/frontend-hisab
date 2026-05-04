"use client";

import { useState, useEffect } from "react";
import { Plus, Download, RefreshCw, Search, Eye, Users, FileText, Banknote, Building } from "lucide-react";
import { Btn, Card, Alert, InputField, Table } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter, useParams } from "next/navigation";

export default function DashboardPage() {
  const [invoices, setInvoices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const { loading, setLoading } = useLoading();
  const [search, setSearch] = useState("");
  const toast = useToast();
  const router = useRouter();
  const params = useParams();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, conRes] = await Promise.all([
        apiClient.get("/invoices/"),
        apiClient.get("/contacts/")
      ]);
      if (invRes.data.success) setInvoices(invRes.data.data || []);
      if (conRes.data.success) setContacts(conRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Stats
  const totalRevenue = invoices.reduce((acc, inv) => acc + parseFloat(inv.total_amount || 0), 0);
  const totalContacts = contacts.length;
  const customers = contacts.filter(c => c.payment_type === "receivable").length;
  const vendors = contacts.filter(c => c.payment_type === "payable").length;
  const invoicesThisMonth = invoices.filter(inv => {
    const invDate = new Date(inv.invoice_date);
    const now = new Date();
    return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
  }).length;

  const STAT_CARDS = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: <Banknote className="h-6 w-6 text-green-500" />, positive: true },
    { label: "Total Contacts", value: totalContacts, icon: <Users className="h-6 w-6 text-blue-500" />, positive: true },
    { label: "Customers", value: customers, icon: <Building className="h-6 w-6 text-indigo-500" />, positive: true },
    { label: "Invoices This Month", value: invoicesThisMonth, icon: <FileText className="h-6 w-6 text-purple-500" />, positive: true },
  ];

  // Map contacts for table display
  const getContactName = (id) => {
    const c = contacts.find(c => c.id === id);
    return c ? c.name : "Unknown";
  };

  // Sort and take top 5 for brief list
  const recentInvoices = [...invoices].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  
  const filtered = recentInvoices.filter(
    (r) =>
      getContactName(r.contact).toLowerCase().includes(search.toLowerCase()) ||
      r.bill_id.toLowerCase().includes(search.toLowerCase())
  );

  const TABLE_COLUMNS = [
    { key: "bill_id", header: "Invoice ID" },
    { key: "contact", header: "Client", render: (val) => getContactName(val) },
    { key: "total_amount", header: "Amount", align: "right", render: (val) => `₹${parseFloat(val).toFixed(2)}` },
    { key: "invoice_date", header: "Date" },
    {
      key: "invoice_type",
      header: "Type",
      align: "center",
      render: (value) => (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#1E3A8A]/40 dark:text-[#93C5FD] uppercase tracking-wider">
          {value.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: "__actions",
      header: "Actions",
      align: "center",
      render: (_v, row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => router.push(`/${params.userId}/invoices`)}
            className="rounded-lg p-1.5 text-[#0EA5E9] hover:bg-[#F0F9FF] dark:hover:bg-[#082F49]/40 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Calculate Basic Chart Data (Revenue by Contact - Top 5)
  const revenueByContact = invoices.reduce((acc, inv) => {
    const name = getContactName(inv.contact);
    acc[name] = (acc[name] || 0) + parseFloat(inv.total_amount || 0);
    return acc;
  }, {});
  
  const chartData = Object.entries(revenueByContact)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
    
  const maxAmount = chartData.length > 0 ? Math.max(...chartData.map(d => d.amount)) : 1;

  return (
    <div className="space-y-6">
      {/* ── Page heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">
            Dashboard overview
          </h1>
          <p className="text-sm text-[#94A3B8] dark:text-[#6B7280] mt-0.5">
            Instant view of billing and contact details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => router.push(`/${params.userId}/invoices`)}
          >
            New Invoice
          </Btn>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.label} hover>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-[#6B7280]">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl lg:text-3xl font-bold text-[#0F172A] dark:text-[#E2E8F0] tracking-tight">
                  {card.value}
                </p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── CSS Basic Chart ── */}
        <Card header={<h2 className="font-semibold text-gray-900 dark:text-white">Top Customers by Revenue</h2>} className="lg:col-span-1">
          <div className="space-y-4 pt-2">
            {chartData.length > 0 ? (
              chartData.map((data, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate w-32">{data.name}</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">₹{data.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" 
                      style={{ width: `${(data.amount / maxAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <FileText className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No data to display</p>
              </div>
            )}
          </div>
        </Card>

        {/* ── Invoice table ── */}
        <div className="lg:col-span-2">
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
                    placeholder="Search recent..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                    className="w-full sm:w-48"
                  />
                  <Btn
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
                    onClick={fetchData}
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
                emptyMessage="No recent invoices."
              />
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-center bg-gray-50 dark:bg-gray-800/50 -mx-5 -mb-5 mt-5">
               <button onClick={() => router.push(`/${params.userId}/invoices`)} className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  View All Invoices &rarr;
               </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
