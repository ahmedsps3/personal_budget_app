export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Budget App Constants
export const APP_PASSWORD = "2599423";

// Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES = [
  // Fixed expenses
  { name: "Sgk", group: "مصروفات ثابتة" },
  { name: "إيجار", group: "مصروفات ثابتة" },
  { name: "عائدات", group: "مصروفات ثابتة" },
  { name: "فواتير إنترنت - موبايل", group: "مصروفات ثابتة" },
  
  // Subscriptions
  { name: "اشتراكات مدفوعة", group: "اشتراكات" },
  
  // Courses and education
  { name: "كورسات ودروس - الشيخ", group: "كورسات ودروس" },
  { name: "كورسات ودروس - إرساء", group: "كورسات ودروس" },
  
  // Car expenses
  { name: "بنزين", group: "مصروفات سيارة" },
  { name: "مخالفات", group: "مصروفات سيارة" },
  { name: "تصليح", group: "مصروفات سيارة" },
  { name: "ضرائب", group: "مصروفات سيارة" },
  
  // Food and groceries
  { name: "طعام", group: "طعام" },
  { name: "سوبرماركت", group: "سوبرماركت" },
  
  // Transportation
  { name: "مواصلات", group: "مواصلات" },
];

// Default income categories
export const DEFAULT_INCOME_CATEGORIES = [
  { name: "راتب", group: "دخل" },
  { name: "دخل إضافي", group: "دخل" },
  { name: "مشاريع جانبية", group: "دخل" },
  { name: "مكافأة", group: "دخل" },
  { name: "استثمارات", group: "دخل" },
  { name: "أخري", group: "دخل" },
];
