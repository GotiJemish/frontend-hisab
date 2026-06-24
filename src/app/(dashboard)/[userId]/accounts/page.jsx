"use client";

import { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, Trash2, Edit, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Filter, MoreVertical, ChevronRight, Coins } from "lucide-react";
import { Btn, Card, InputField, Table, Select } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/context/LoadingContext";

import { useRouter, useParams } from "next/navigation";
import AccountFormModal from "./components/AccountFormModal";
import IncomeFormModal from "./components/IncomeFormModal";
import ExpenseFormModal from "./components/ExpenseFormModal";

export default function AccountsPage() {
  const router = useRouter();
  const params = useParams();
  const [accounts, setAccounts] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");

  // Modals state
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const toast = useToast();

  const [accountFormData, setAccountFormData] = useState({
    name: "",
    initial_balance: "",
  });

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
    account: "",
    amount: "",
    notes: "",
  });

  const [expenseFormData, setExpenseFormData] = useState({
    date: getTodayString(),
    category: "",
    account: "",
    amount: "",
    notes: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, incRes, expRes] = await Promise.all([
        apiClient.get("/accounts/"),
        apiClient.get("/incomes/"),
        apiClient.get("/expenses/"),
      ]);

      if (accRes.data.success) {
        setAccounts(accRes.data.data || []);
      }
      const incData = (incRes.data.data || []).map(t => ({ ...t, transaction_type: "income" }));
      const expData = (expRes.data.data || []).map(t => ({ ...t, transaction_type: "expense" }));
      
      setIncomes(incRes.data.data || []);
      setExpenses(expRes.data.data || []);

      // Merge and sort transactions
      const merged = [...incData, ...expData].sort(
        (a, b) => new Date(b.date + "T" + (b.created_at?.split("T")[1] || "00:00:00")) - new Date(a.date + "T" + (a.created_at?.split("T")[1] || "00:00:00"))
      );
      setTransactions(merged);
    } catch (err) {
      toast.error("Failed to load accounts and transactions data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Summary stats
  const totalNetBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
  const totalIncome = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  // ---------------------------------
  // ACCOUNT CRUD
  // ---------------------------------
  const handleOpenAccountModal = (acc = null) => {
    if (acc) {
      setEditingAccount(acc);
      setAccountFormData({
        name: acc.name,
        initial_balance: acc.initial_balance,
      });
    } else {
      setEditingAccount(null);
      setAccountFormData({
        name: "",
        initial_balance: "",
      });
    }
    setAccountModalOpen(true);
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: accountFormData.name,
        initial_balance: parseFloat(accountFormData.initial_balance) || 0,
      };

      let res;
      if (editingAccount) {
        res = await apiClient.patch(`/accounts/${editingAccount.id}/`, { name: payload.name });
      } else {
        res = await apiClient.post("/accounts/", payload);
      }

      if (res.data.success) {
        toast.success(res.data.message || "Account saved successfully.");
        setAccountModalOpen(false);
        fetchData();
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        const firstKey = Object.keys(resp.errors)[0];
        toast.error(resp.errors[firstKey][0] || "Validation Error");
      } else {
        toast.error(resp?.message || "Failed to save account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this account? Doing so will delete all its income and expense transactions.")) return;
    setLoading(true);
    try {
      await apiClient.delete(`/accounts/${id}/`);
      toast.success("Account deleted successfully.");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
      setLoading(false);
    }
  };

  const handleAccountToggleActive = async (acc) => {
    setLoading(true);
    try {
      const res = await apiClient.patch(`/accounts/${acc.id}/`, {
        is_active: !acc.is_active,
      });
      if (res.data.success) {
        toast.success(res.data.message || `Account ${acc.is_active ? "deactivated" : "activated"} successfully.`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update account status");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------
  // TRANSACTION SUBMITS
  // ---------------------------------
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
          account: "",
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
          account: "",
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

  // ---------------------------------
  // FILTER LOGIC
  // ---------------------------------
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.notes?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase()) ||
      t.account_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesAccount = filterAccount ? t.account === filterAccount : true;
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    const matchesType = filterType ? t.transaction_type === filterType : true;

    return matchesSearch && matchesAccount && matchesCategory && matchesType;
  });

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
  const allCategories = Array.from(new Set(transactions.map(t => t.category)));


  // Transaction Ledger Columns
  const ledgerColumns = [
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
      key: "account_name",
      header: "Account",
      render: (_, row) => (
        <span className="font-medium text-gray-700 dark:text-gray-300">{row.account_name}</span>
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
        <span className="text-xs text-gray-500 max-w-[200px] block truncate" title={row.notes}>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts & Cash Flow</h1>
          <p className="text-sm text-gray-500">Create company accounts and track your income and expense streams dynamically.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIncomeModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-5 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            New Income
          </button>
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-5 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            New Expense
          </button>
          <Btn
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => handleOpenAccountModal()}
          >
            Add Account
          </Btn>
        </div>
      </div>

      {/* ── STATS SUMMARY ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Net Balance Card */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Net Balance</p>
            <h3 className={`text-2xl font-bold mt-1.5 ${totalNetBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {formatCurrency(totalNetBalance)}
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

      {/* ── ACCOUNTS LIST & DETAILS (Card Grid View) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Company Accounts</h2>
          <Btn variant="ghost" size="sm" onClick={fetchData} className="p-2">
            <RefreshCw className={`h-4 w-4 ${loading && accounts.length === 0 ? "animate-spin" : ""}`} />
          </Btn>
        </div>

        {accounts.length === 0 && !loading ? (
          <Card className="p-8 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Wallet className="h-10 w-10 text-slate-400 dark:text-slate-600 mb-3 opacity-60" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No accounts created yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click "Add Account" to set one up!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map((acc) => {
              const balanceNum = parseFloat(acc.balance || 0);
              return (
                <div
                  key={acc.id}
                  onClick={() => router.push(`/${params.userId}/accounts/${acc.id}`)}
                  className={`group relative bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-visible cursor-pointer ${
                    !acc.is_active ? "opacity-75 bg-slate-50/50 dark:bg-slate-900/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar initials badge */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold text-base select-none flex-shrink-0">
                        {getInitials(acc.name)}
                      </div>
                      <div>
                        {/* Account Name */}
                        <h3 className="font-semibold text-slate-900 dark:text-white text-base tracking-tight leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {acc.name}
                        </h3>
                        {/* Subtitle balance info */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <Wallet className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                          <span className={`font-semibold ${balanceNum >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {formatCurrency(balanceNum)}
                          </span>
                          {!acc.is_active && (
                            <span className="ml-1 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(activeDropdownId === acc.id ? null : acc.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {activeDropdownId === acc.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-20"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(null);
                              handleOpenAccountModal(acc);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2"
                          >
                            <Edit className="h-3.5 w-3.5 text-blue-500" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(null);
                              handleAccountToggleActive(acc);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 ${
                              acc.is_active ? "text-amber-600" : "text-emerald-600"
                            }`}
                          >
                            {acc.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(null);
                              handleAccountDelete(acc.id);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/80 my-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Coins className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span>Initial: <span className="font-semibold text-slate-700 dark:text-slate-350">{formatCurrency(parseFloat(acc.initial_balance || 0))}</span></span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${params.userId}/accounts/${acc.id}`);
                      }}
                      className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>See details</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TRANSACTION LEDGER ── */}
      <Card
        header={
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Transactions Ledger</h2>
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
              </div>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-dashed border-[#E2E8F0] dark:border-[#1F2937]">
              <Select
                id="filter-account"
                options={[
                  { value: "", label: "All Accounts" },
                  ...accounts.map(a => ({ value: a.id, label: a.name }))
                ]}
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
              />
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
            columns={ledgerColumns}
            data={filteredTransactions}
            loading={loading && transactions.length === 0}
            emptyMessage="No transactions found matching your criteria."
            pagination={true}
            rowsPerPage={10}
            striped={true}
            hoverable={true}
          />
        </div>
      </Card>

      {/* ── MODALS ── */}
      <AccountFormModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        editingAccount={editingAccount}
        formData={accountFormData}
        setFormData={setAccountFormData}
        handleSubmit={handleAccountSubmit}
        loading={loading}
      />

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
