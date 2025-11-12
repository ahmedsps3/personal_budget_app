import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddTransactionModal from "@/components/AddTransactionModal";
import { trpc } from "@/lib/trpc";

export default function TransactionsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: transactions = [], isLoading, refetch } = trpc.transactions.getAll.useQuery();
  const createMutation = trpc.transactions.create.useMutation();
  const deleteMutation = trpc.transactions.delete.useMutation();

  const filteredTransactions = transactions.filter((t: any) =>
    t.category.includes(searchTerm) ||
    t.description?.includes(searchTerm) ||
    t.person?.includes(searchTerm)
  );

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
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          معاملة جديدة
        </Button>
      </div>

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
            <Card key={transaction.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{transaction.category}</p>
                <p className="text-sm text-gray-500">{transaction.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-lg font-bold ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
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
                    onClick={() => setEditingId(transaction.id)}
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
    </div>
  );
}
