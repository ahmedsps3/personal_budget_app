import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Repeat2 } from "lucide-react";
import RecurringTransactionModal from "@/components/RecurringTransactionModal";
import { trpc } from "@/lib/trpc";

export default function RecurringTransactionsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: recurringTransactions = [], refetch } = trpc.recurringTransactions.getAll.useQuery();

  const createRecurringMutation = trpc.recurringTransactions.create.useMutation();
  const updateRecurringMutation = trpc.recurringTransactions.update.useMutation();

  const handleAddRecurring = (transaction: any) => {
    createRecurringMutation.mutate(transaction, {
      onSuccess: () => {
        refetch();
        setShowAddModal(false);
      },
    });
  };

  const handleDeleteRecurring = (id: number) => {
    if (confirm("هل تريد حذف هذه المعاملة المتكررة؟")) {
      updateRecurringMutation.mutate(
        { id, isActive: false },
        {
          onSuccess: () => {
            refetch();
          },
        }
      );
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      monthly: "شهري",
      quarterly: "ربع سنوي",
      yearly: "سنوي",
    };
    return labels[frequency] || frequency;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المعاملات المتكررة</h1>
          <p className="text-gray-600 mt-1">
            أنشئ معاملات دورية تُطبق تلقائياً كل شهر أو سنة
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          معاملة متكررة جديدة
        </Button>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Repeat2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">كيفية عمل المعاملات المتكررة</h3>
            <p className="text-sm text-blue-800 mt-1">
              عند إنشاء معاملة متكررة، سيتم تطبيقها تلقائياً في التاريخ المحدد كل شهر أو سنة.
              يمكنك تعديل أو حذف المعاملات المتكررة في أي وقت.
            </p>
          </div>
        </div>
      </Card>

      {/* Recurring Transactions List */}
      {!recurringTransactions || recurringTransactions.length === 0 ? (
        <Card className="p-12 text-center">
          <Repeat2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">لا توجد معاملات متكررة حتى الآن</p>
          <p className="text-gray-400 text-sm mt-2">
            ابدأ بإنشاء معاملة متكررة لتوفير الوقت والجهد
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recurringTransactions.map((transaction: any) => (
            <Card key={transaction.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {transaction.category}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {getFrequencyLabel(transaction.frequency)}
                  </p>
                </div>
                <span
                  className={`text-2xl font-bold ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {transaction.amount.toFixed(2)} ر.س
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                {transaction.person && (
                  <p>
                    <span className="font-medium">الشخص:</span> {transaction.person}
                  </p>
                )}
                {transaction.description && (
                  <p>
                    <span className="font-medium">التفاصيل:</span>{" "}
                    {transaction.description}
                  </p>
                )}
                <p>
                  <span className="font-medium">تاريخ البداية:</span>{" "}
                  {new Date(transaction.startDate).toLocaleDateString("ar-SA")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-blue-600 hover:text-blue-700"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  تعديل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteRecurring(transaction.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  حذف
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Recurring Transaction Modal */}
      {showAddModal && (
        <RecurringTransactionModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddRecurring}
        />
      )}
    </div>
  );
}
