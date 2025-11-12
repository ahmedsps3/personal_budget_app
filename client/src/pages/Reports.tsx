import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const { data: transactions = [] } = trpc.transactions.getAll.useQuery();

  const monthlyData = useMemo(() => {
    const [year, month] = selectedMonth.split("-");
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const monthTransactions = transactions.filter((t: any) => {
      const transDate = new Date(t.transactionDate);
      return (
        transDate.getFullYear() === yearNum &&
        transDate.getMonth() === monthNum - 1
      );
    });

    const income = monthTransactions
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      transactions: monthTransactions,
    };
  }, [selectedMonth, transactions]);

  // Calculate previous months for comparison
  const previousMonths = useMemo(() => {
    const months: Record<string, { income: number; expenses: number }> = {};
    const [year, month] = selectedMonth.split("-");
    let currentYear = parseInt(year);
    let currentMonth = parseInt(month);

    for (let i = 0; i < 5; i++) {
      currentMonth--;
      if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
      }

      const monthStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
      const monthTransactions = transactions.filter((t: any) => {
        const transDate = new Date(t.transactionDate);
        return (
          transDate.getFullYear() === currentYear &&
          transDate.getMonth() === currentMonth - 1
        );
      });

      const income = monthTransactions
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      months[monthStr] = { income, expenses };
    }

    return months;
  }, [selectedMonth, transactions]);

  const handleDownloadReport = () => {
    const reportContent = `
تقرير الشهر: ${selectedMonth}
=====================================

ملخص المالي:
- إجمالي الدخل: ${monthlyData.income.toFixed(2)} ر.س
- إجمالي المصروفات: ${monthlyData.expenses.toFixed(2)} ر.س
- الرصيد: ${monthlyData.balance.toFixed(2)} ر.س

تفاصيل المعاملات:
${monthlyData.transactions
  .map(
    (t: any) =>
      `- ${t.category}: ${t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)} ر.س (${t.person || "غير محدد"})`
  )
  .join("\n")}
    `;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent)
    );
    element.setAttribute("download", `report-${selectedMonth}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">التقارير الشهرية</h2>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر الشهر
            </label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={handleDownloadReport}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto"
          >
            <Download className="w-5 h-5" />
            تحميل التقرير
          </Button>
        </div>
      </Card>

      {/* Report Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">تقرير الشهر</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600">إجمالي الدخل</p>
            <p className="text-2xl font-bold text-green-700 mt-2">
              {monthlyData.income.toFixed(2)} ر.س
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-gray-600">إجمالي المصروفات</p>
            <p className="text-2xl font-bold text-red-700 mt-2">
              {monthlyData.expenses.toFixed(2)} ر.س
            </p>
          </div>
          <div
            className={`p-4 rounded-lg border ${
              monthlyData.balance >= 0
                ? "bg-blue-50 border-blue-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className="text-sm text-gray-600">الفرق</p>
            <p
              className={`text-2xl font-bold mt-2 ${
                monthlyData.balance >= 0 ? "text-blue-700" : "text-red-700"
              }`}
            >
              {monthlyData.balance.toFixed(2)} ر.س
            </p>
          </div>
        </div>

        {/* Transactions Details */}
        {monthlyData.transactions.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">تفاصيل المعاملات</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {monthlyData.transactions.map((t: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{t.category}</p>
                    <p className="text-sm text-gray-600">{t.person || "غير محدد"}</p>
                  </div>
                  <span
                    className={`font-bold ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {t.amount.toFixed(2)} ر.س
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Comparison with Previous Months */}
      {Object.keys(previousMonths).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            مقارنة مع الأشهر السابقة
          </h3>
          <div className="space-y-3">
            {Object.entries(previousMonths)
              .reverse()
              .map(([month, data]) => (
                <div key={month} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{month}</span>
                    <span className="text-sm text-gray-600">
                      الفرق: {(data.income - data.expenses).toFixed(2)} ر.س
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">
                      دخل: {data.income.toFixed(2)} ر.س
                    </span>
                    <span className="text-red-600">
                      مصروفات: {data.expenses.toFixed(2)} ر.س
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
