import { Card } from "@/components/ui/card";
import { BarChart, PieChart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export default function StatsPage() {
  const { data: transactions = [] } = trpc.transactions.getAll.useQuery();

  const stats = useMemo(() => {
    const expensesByCategory: Record<string, number> = {};
    const incomeByCategory: Record<string, number> = {};

    transactions.forEach((t: any) => {
      if (t.type === "expense") {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      } else {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      }
    });

    return { expensesByCategory, incomeByCategory };
  }, [transactions]);

  const totalExpenses = Object.values(stats.expensesByCategory).reduce((a, b) => a + b, 0);
  const totalIncome = Object.values(stats.incomeByCategory).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المصروفات</h3>
          {Object.keys(stats.expensesByCategory).length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>لا توجد بيانات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm font-bold text-gray-900">{amount.toFixed(2)} ر.س</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{
                          width: `${(amount / totalExpenses) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((amount / totalExpenses) * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* Income by Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع الدخل</h3>
          {Object.keys(stats.incomeByCategory).length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>لا توجد بيانات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.incomeByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm font-bold text-gray-900">{amount.toFixed(2)} ر.س</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(amount / totalIncome) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((amount / totalIncome) * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      {/* Summary */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص الإحصائيات</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">إجمالي المصروفات</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{totalExpenses.toFixed(2)} ر.س</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">إجمالي الدخل</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{totalIncome.toFixed(2)} ر.س</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">عدد المعاملات</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{transactions.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
