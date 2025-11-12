import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddTransactionModal from "@/components/AddTransactionModal";
import EditTransactionModal from "@/components/EditTransactionModal";
import { trpc } from "@/lib/trpc";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/const";

export default function TransactionsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: transactions = [], isLoading, refetch } = trpc.transactions.getAll.useQuery();
  const createMutation = trpc.transactions.create.useMutation();
  const deleteMutation = trpc.transactions.delete.useMutation();
  const updateMutation = trpc.transactions.update.useMutation();

  // Get all unique categories
  const allCategories = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...DEFAULT_INCOME_CATEGORIES,
  ];
  const uniqueCategories = Array.from(new Set(allCategories.map((c) => c.name)));

  // Filter transactions
  const filteredTransactions = transactions.filter((t: any) => {
    // Search filter
    const matchesSearch =
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.person?.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType = filterType === "all" || t.type === filterType;

    // Category filter
    const matchesCategory = filterCategory === "all" || t.category === filterCategory;

    // Date range filter
    let matchesDateRange = true;
    if (startDate || endDate) {
      const transDate = new Date(t.transactionDate);
      if (startDate) {
        matchesDateRange = matchesDateRange && transDate >= new Date(startDate);
      }
      if (endDate) {
        matchesDateRange = matchesDateRange && transDate <= new Date(endDate);
      }
    }

    return matchesSearch && matchesType && matchesCategory && matchesDateRange;
  });

  const handleDelete = (id: number) => {
    if (confirm("هل تريد حذف هذه المعاملة؟")) {
      deleteMutation.mutate(id, {
        onSuccess: () => refetch(),
      });
    }
  };

  const handleAddTransaction = (transaction: any) => {
    createMutation.mutate(transaction, {
      onSuccess: () => {
        refetch();
        setShowAddModal(false);
      },
    });
  };

  const handleUpdateTransaction = (transaction: any) => {
    updateMutation.mutate(transaction, {
      onSuccess: () => {
        refetch();
        setEditingTransaction(null);
      },
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterCategory("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="بحث عن معاملة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            فلاتر
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 flex-1 sm:flex-none"
          >
            <Plus className="w-5 h-5" />
            معاملة جديدة
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النوع
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">الكل</option>
                <option value="income">دخل</option>
                <option value="expense">مصروف</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التصنيف
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">الكل</option>
                {uniqueCategories.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                من التاريخ
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                إلى التاريخ
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="text-sm"
            >
              مسح الفلاتر
            </Button>
          </div>
        </Card>
      )}

      {/* Transactions List */}
      {isLoading ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">جاري التحميل...</p>
        </Card>
      ) : filteredTransactions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">لا توجد معاملات حتى الآن</p>
          <p className="text-gray-400 text-sm mt-2">ابدأ بإضافة معاملة جديدة</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction: any) => (
            <Card
              key={transaction.id}
              className="p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{transaction.category}</p>
                <p className="text-sm text-gray-500">{transaction.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {transaction.person && `الشخص: ${transaction.person}`}
                  {transaction.person && transaction.transactionDate && " • "}
                  {new Date(transaction.transactionDate).toLocaleDateString("ar-SA")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-lg font-bold ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {transaction.amount.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => setEditingTransaction(transaction)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(transaction.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTransaction}
        />
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={handleUpdateTransaction}
        />
      )}
    </div>
  );
}
