"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, RefreshCw, Search, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, FileText, Plus, Trash2 } from "lucide-react";
import { Btn, Card, InputField, Table, Select } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter, useParams } from "next/navigation";
import IncomeFormModal from "../components/IncomeFormModal";
import ExpenseFormModal from "../components/ExpenseFormModal";

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { accountId, userId } = params;

  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const { loading, setLoading } = useLoading();
  const toast = useToast();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");

  // Modals state
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [incomeFormData, setIncomeFormData] = useState({
    date: getTodayString(),
    category: "",
    account: accountId || "",
    amount: "",
    notes: "",
  });

  const [expenseFormData, setExpenseFormData] = useState({
    date: getTodayString(),
    category: "",
    account: accountId || "",
    amount: "",
    notes: "",
  });

  // Ensure default account preselection when accountId is available
  useEffect(() => {
    if (accountId) {
      setIncomeFormData((prev) => ({ ...prev, account: accountId }));
      setExpenseFormData((prev) => ({ ...prev, account: accountId }));
    }
  }, [accountId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accsRes, incRes, expRes] = await Promise.all([
        apiClient.get("/accounts/"),
        apiClient.get("/incomes/"),
        apiClient.get("/expenses/"),
      ]);

      if (accsRes.data.success) {
        const list = accsRes.data.data || [];
        setAccounts(list);
        const current = list.find((a) => String(a.id) === String(accountId));
        setAccount(current || null);
      }

      // Filter transactions for this specific account
      const incData = (incRes.data.data || [])
        .filter((t) => String(t.account) === String(accountId))
        .map((t) => ({ ...t, transaction_type: "income" }));

      const expData = (expRes.data.data || [])
        .filter((t) => String(t.account) === String(accountId))
        .map((t) => ({ ...t, transaction_type: "expense" }));

      // Merge and sort by date/time
      const merged = [...incData, ...expData].sort(
        (a, b) =>
          new Date(b.date + "T" + (b.created_at?.split("T")[1] || "00:00:00")) -
          new Date(a.date + "T" + (a.created_at?.split("T")[1] || "00:00:00"))
      );
      setTransactions(merged);
    } catch (err) {
      toast.error("Failed to load account details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchData();
    }
  }, [accountId]);

  // Compute stats for this account specifically
  const balanceNum = account ? parseFloat(account.balance || 0) : 0;
  const isPositive = balanceNum >= 0;
  const totalIncome = transactions
    .filter(t => t.transaction_type === "income")
    .reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
  const totalExpense = transactions
    .filter(t => t.transaction_type === "expense")
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  // Helper formats
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get distinct categories
  const allCategories = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.category)));
  }, [transactions]);

  // Filter logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.notes?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    const matchesType = filterType ? t.transaction_type === filterType : true;

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...incomeFormData,
        amount: parseFloat(incomeFormData.amount),
      };
      const res = await apiClient.post("/incomes/", payload);
      if (res.data.success) {
        toast.success("Income record created successfully.");
        setIncomeModalOpen(false);
        // Reset form
        setIncomeFormData({
          date: getTodayString(),
          category: "",
          account: accountId || "",
          amount: "",
          notes: "",
        });
        fetchData();
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        const firstKey = Object.keys(resp.errors)[0];
        toast.error(resp.errors[firstKey][0] || "Validation Error");
      } else {
        toast.error(resp?.message || "Failed to create income record");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...expenseFormData,
        amount: parseFloat(expenseFormData.amount),
      };
      const res = await apiClient.post("/expenses/", payload);
      if (res.data.success) {
        toast.success("Expense record created successfully.");
        setExpenseModalOpen(false);
        // Reset form
        setExpenseFormData({
          date: getTodayString(),
          category: "",
          account: accountId || "",
          amount: "",
          notes: "",
        });
        fetchData();
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        const firstKey = Object.keys(resp.errors)[0];
        toast.error(resp.errors[firstKey][0] || "Validation Error");
      } else {
        toast.error(resp?.message || "Failed to create expense record");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionDelete = async (id, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    setLoading(true);
    try {
      const endpoint = type === "income" ? `/incomes/${id}/` : `/expenses/${id}/`;
      await apiClient.delete(endpoint);
      toast.success(`${type === "income" ? "Income" : "Expense"} transaction deleted.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to delete transaction`);
      setLoading(false);
    }
  };

  // Table Columns
  const columns = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-600 dark:text-gray-300">{formatDate(row.date)}</span>
      )
    },
    {
      key: "transaction_type",
      header: "Type",
      render: (_, row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
            ${row.transaction_type === "income"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
            }`}
        >
          {row.transaction_type === "income" ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {row.transaction_type}
        </span>
      )
    },
    {
      key: "category",
      header: "Category",
      render: (_, row) => (
        <span className="capitalize text-gray-600 dark:text-gray-300">{row.category}</span>
      )
    },
    {
      key: "amount",
      header: "Amount",
      render: (_, row) => (
        <span className={`font-semibold ${row.transaction_type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {row.transaction_type === "income" ? "+" : "-"}{formatCurrency(row.amount)}
        </span>
      )
    },
    {
      key: "notes",
      header: "Notes",
      render: (_, row) => (
        <span className="text-xs text-gray-500 max-w-[300px] block truncate" title={row.notes}>
          {row.notes || "-"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (_, row) => (
        <button
          onClick={() => handleTransactionDelete(row.id, row.transaction_type)}
          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
          title="Delete Transaction"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/${userId}/accounts`)}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shadow-sm active:scale-[0.95]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {account ? account.name : "Account Details"}
            </h1>
            <p className="text-sm text-gray-500">Transaction history and ledger details for this account.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setIncomeFormData((prev) => ({ ...prev, account: accountId }));
              setIncomeModalOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-5 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            New Income
          </button>
          <button
            onClick={() => {
              setExpenseFormData((prev) => ({ ...prev, account: accountId }));
              setExpenseModalOpen(true);
            }}
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-5 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            New Expense
          </button>
        </div>
      </div>

      {/* ── STATS SUMMARY ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Net Balance Card */}
        <div className="relative overflow-hidden bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Net Balance</p>
            <h3 className={`text-2xl font-bold mt-1.5 ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {formatCurrency(balanceNum)}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 flex items-center justify-center">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        {/* Total Incomes Card */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Incomes</p>
            <h3 className="text-2xl font-bold mt-1.5 text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Expenses</p>
            <h3 className="text-2xl font-bold mt-1.5 text-rose-600 dark:text-rose-400">
              {formatCurrency(totalExpense)}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ── TRANSACTION LEDGER ── */}
      <Card
        header={
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Account Ledger</h2>
              <div className="flex items-center gap-2">
                <InputField
                  id="search-transactions"
                  type="search"
                  placeholder="Search ledger..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  className="w-48 sm:w-64"
                />
                <Btn variant="ghost" size="sm" onClick={fetchData} className="p-2">
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Btn>
              </div>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-dashed border-[#E2E8F0] dark:border-[#1F2937]">
              <Select
                id="filter-category"
                options={[
                  { value: "", label: "All Categories" },
                  ...allCategories.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }))
                ]}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              />
              <Select
                id="filter-type"
                options={[
                  { value: "", label: "All Types" },
                  { value: "income", label: "Income" },
                  { value: "expense", label: "Expense" }
                ]}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              />
            </div>
          </div>
        }
      >
        <div className="-mx-5 -mb-5">
          <Table
            columns={columns}
            data={filteredTransactions}
            loading={loading && transactions.length === 0}
            emptyMessage="No transactions found for this account."
            pagination={true}
            rowsPerPage={10}
            striped={true}
            hoverable={true}
          />
        </div>
      </Card>

      {/* Modals */}
      <IncomeFormModal
        open={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        accounts={accounts}
        formData={incomeFormData}
        setFormData={setIncomeFormData}
        handleSubmit={handleIncomeSubmit}
        loading={loading}
      />

      <ExpenseFormModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        accounts={accounts}
        formData={expenseFormData}
        setFormData={setExpenseFormData}
        handleSubmit={handleExpenseSubmit}
        loading={loading}
      />
    </div>
  );
}
