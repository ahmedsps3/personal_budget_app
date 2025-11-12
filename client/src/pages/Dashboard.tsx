import { useState } from "react"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LogOut, TrendingUp, TrendingDown, PieChart, Calendar } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import TransactionsPage from "./Transactions";
import StatsPage from "./Stats";
import BudgetPage from "./Budget";
import ReportsPage from "./Reports";
import RecurringTransactionsPage from "./RecurringTransactions";

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: transactions = [] } = trpc.transactions.getAll.useQuery();
  
  const totalIncome = transactions
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;

  const handleLogout = () => {
    localStorage.removeItem("budgetAppLoggedIn");
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="Logo" className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              <span className="hidden sm:inline">معاملات</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">إحصائيات</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">ميزانية</span>
            </TabsTrigger>
            <TabsTrigger value="recurring" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">متكررة</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">تقارير</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الدخل</p>
                    <p className="text-3xl font-bold text-green-700 mt-2">{totalIncome.toFixed(2)} ر.س</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي المصروفات</p>
                    <p className="text-3xl font-bold text-red-700 mt-2">{totalExpenses.toFixed(2)} ر.س</p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-red-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">الرصيد</p>
                    <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                      {balance.toFixed(2)} ر.س
                    </p>
                  </div>
                  <PieChart className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">الخطوات التالية</h2>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة معاملة جديدة
                </Button>
                <p className="text-sm text-gray-600">
                  ابدأ بإضافة معاملاتك الأولى لتتمكن من تتبع دخلك ومصروفاتك بشكل دقيق.
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <TransactionsPage />
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <StatsPage />
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget">
            <BudgetPage />
          </TabsContent>

          {/* Recurring Transactions Tab */}
          <TabsContent value="recurring">
            <RecurringTransactionsPage />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportsPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
