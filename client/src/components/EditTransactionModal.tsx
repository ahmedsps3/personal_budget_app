import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/const";

interface EditTransactionModalProps {
  transaction: {
    id: number;
    type: "income" | "expense";
    category: string;
    amount: number;
    description?: string;
    person?: string;
    transactionDate: Date | string;
  };
  onClose: () => void;
  onSave: (transaction: any) => void;
}

export default function EditTransactionModal({
  transaction,
  onClose,
  onSave,
}: EditTransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">(transaction.type);
  const [category, setCategory] = useState(transaction.category);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [description, setDescription] = useState(transaction.description || "");
  const [person, setPerson] = useState(transaction.person || "");
  const [date, setDate] = useState(
    typeof transaction.transactionDate === "string"
      ? transaction.transactionDate.split("T")[0]
      : new Date(transaction.transactionDate).toISOString().split("T")[0]
  );

  const categories =
    type === "income" ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
  const uniqueCategories = Array.from(new Set(categories.map((c) => c.name)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const updatedTransaction = {
      id: transaction.id,
      type,
      category,
      amount: parseFloat(amount),
      description,
      person,
      transactionDate: new Date(date),
    };

    onSave(updatedTransaction);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">تعديل المعاملة</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selection */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setType("income");
                  setCategory("");
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  type === "income"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                دخل
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("expense");
                  setCategory("");
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  type === "expense"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                مصروف
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التصنيف
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">اختر التصنيف</option>
                {uniqueCategories.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ (ر.س)
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            {/* Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الشخص المسؤول
              </label>
              <Input
                type="text"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="اسم الشخص"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التفاصيل
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أضف تفاصيل إضافية..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التاريخ
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                حفظ التغييرات
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
