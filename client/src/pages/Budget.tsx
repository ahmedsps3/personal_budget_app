import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Save, TrendingDown } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function BudgetPage() {
  const [budget, setBudget] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: currentBudget } = trpc.budget.get.useQuery(month);
  const { data: transactions = [] } = trpc.transactions.getAll.useQuery();
  const setBudgetMutation = trpc.budget.set.useMutation();

  // Calculate current month expenses
  const currentMonthExpenses = transactions
    .filter((t: any) => {
      const transDate = new Date(t.transactionDate);
      const [year, monthStr] = month.split("-");
      return (
        t.type === "expense" &&
        transDate.getFullYear() === parseInt(year) &&
        transDate.getMonth() === parseInt(monthStr) - 1
      );
    })
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const budgetAmount = currentBudget?.amount || 0;
  const remainingBudget = budgetAmount - currentMonthExpenses;
  const budgetPercentage = budgetAmount > 0 ? (currentMonthExpenses / budgetAmount) * 100 : 0;

  const handleSaveBudget = () => {
    if (budget) {
      setBudgetMutation.mutate(
        { month, amount: parseFloat(budget) },
        {
          onSuccess: () => {
            setBudget("");
            alert("تم حفظ الميزانية بنجاح");
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Set Budget Form */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">تحديد الميزانية الشهرية</h2>

        <div className="space-y-4">
          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الشهر
            </label>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Budget Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الميزانية الشهرية (ر.س)
            </label>
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="أدخل المبلغ"
              className="w-full"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveBudget}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            disabled={!budget || setBudgetMutation.isPending}
          >
            <Save className="w-5 h-5" />
            {setBudgetMutation.isPending ? "جاري الحفظ..." : "حفظ الميزانية"}
          </Button>
        </div>
      </Card>

      {/* Budget Status */}
      {budgetAmount > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">حالة الميزانية</h3>

          <div className="space-y-4">
            {/* Budget Progress */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">الإنفاق</span>
                <span className="text-sm font-bold text-gray-900">
                  {currentMonthExpenses.toFixed(2)} / {budgetAmount.toFixed(2)} ر.س
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    budgetPercentage > 100
                      ? "bg-red-600"
                      : budgetPercentage > 75
                      ? "bg-yellow-500"
                      : "bg-green-600"
                  }`}
                  style={{
                    width: `${Math.min(budgetPercentage, 100)}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {budgetPercentage.toFixed(1)}% من الميزانية
              </p>
            </div>

            {/* Remaining Budget */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">الرصيد المتبقي</span>
                <span
                  className={`text-lg font-bold ${
                    remainingBudget >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {remainingBudget.toFixed(2)} ر.س
                </span>
              </div>
            </div>

            {/* Warning Messages */}
            {budgetPercentage > 100 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">تجاوزت الميزانية</h4>
                  <p className="text-sm text-red-800 mt-1">
                    لقد تجاوزت الميزانية المحددة بمقدار {Math.abs(remainingBudget).toFixed(2)} ر.س
                  </p>
                </div>
              </div>
            )}

            {budgetPercentage > 75 && budgetPercentage <= 100 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">تحذير الميزانية</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    لقد استهلكت {budgetPercentage.toFixed(1)}% من ميزانيتك الشهرية
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">معلومات الميزانية</h3>
            <p className="text-sm text-blue-800">
              عند تحديد ميزانية شهرية، سيتم إخطارك عند الاقتراب من الحد المسموح به. يمكنك تعديل الميزانية في أي وقت.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
