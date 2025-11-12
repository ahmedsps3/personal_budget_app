import { Card } from "@/components/ui/card";
import { BarChart, PieChart as PieChartIcon } from "lucide-react";
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

  // Generate colors for pie chart
  const colors = [
    "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e",
    "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
    "#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"
  ];

  const generatePieChart = (data: Record<string, number>, colors: string[]) => {
    const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
    const total = entries.reduce((sum, [, val]) => sum + val, 0);
    
    let currentAngle = 0;
    const slices = entries.map(([label, value], index) => {
      const percentage = (value / total) * 100;
      const sliceAngle = (value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;
      const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        label,
        value,
        percentage,
        color: colors[index % colors.length],
        pathData,
      };
    });

    return slices;
  };

  const expenseSlices = generatePieChart(stats.expensesByCategory, colors);
  const incomeSlices = generatePieChart(stats.incomeByCategory, colors);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المصروفات</h3>
          {Object.keys(stats.expensesByCategory).length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>لا توجد بيانات</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pie Chart */}
              <div className="flex justify-center">
                <svg viewBox="0 0 100 100" className="w-48 h-48">
                  {expenseSlices.map((slice, idx) => (
                    <path
                      key={idx}
                      d={slice.pathData}
                      fill={slice.color}
                      stroke="white"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {expenseSlices.map((slice, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="text-gray-700">{slice.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{slice.value.toFixed(2)} ر.س</span>
                      <span className="text-gray-500">({slice.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Income Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع الدخل</h3>
          {Object.keys(stats.incomeByCategory).length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>لا توجد بيانات</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pie Chart */}
              <div className="flex justify-center">
                <svg viewBox="0 0 100 100" className="w-48 h-48">
                  {incomeSlices.map((slice, idx) => (
                    <path
                      key={idx}
                      d={slice.pathData}
                      fill={slice.color}
                      stroke="white"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {incomeSlices.map((slice, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="text-gray-700">{slice.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{slice.value.toFixed(2)} ر.س</span>
                      <span className="text-gray-500">({slice.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Bar Charts - Alternative View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses by Category - Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">المصروفات حسب التصنيف</h3>
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

        {/* Income by Category - Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الدخل حسب التصنيف</h3>
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
