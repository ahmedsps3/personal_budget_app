# دليل النشر على Railway

## المتطلبات
- حساب على [Railway.app](https://railway.app)
- حساب على GitHub
- Node.js 18+ (محلياً للتطوير)

## خطوات النشر على Railway

### 1. رفع المشروع على GitHub

```bash
# تهيئة Git (إذا لم يتم بالفعل)
git init
git add .
git commit -m "Initial commit: Personal Budget App"

# إضافة المستودع البعيد
git remote add origin https://github.com/ahmedsps3/personal_budget_app.git
git branch -M main
git push -u origin main
```

### 2. ربط Railway مع GitHub

1. اذهب إلى [Railway.app](https://railway.app)
2. سجل الدخول بحسابك
3. اضغط على **"New Project"**
4. اختر **"Deploy from GitHub"**
5. اختر المستودع `personal_budget_app`
6. اضغط **"Deploy"**

### 3. إعداد المتغيرات البيئية على Railway

بعد النشر، اذهب إلى **Variables** وأضف:

```
DATABASE_URL=mysql://user:password@host:port/database_name
JWT_SECRET=your_secret_key
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_api_key
VITE_APP_TITLE=تطبيق مصروف البيت
VITE_APP_LOGO=/logo.svg
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id
NODE_ENV=production
PORT=3000
```

### 4. إعداد قاعدة البيانات

#### الخيار 1: استخدام Railway MySQL

1. في لوحة تحكم Railway، اضغط **"+ New"**
2. اختر **"Database"** → **"MySQL"**
3. سيتم إنشاء `DATABASE_URL` تلقائياً
4. انسخها إلى متغيرات التطبيق

#### الخيار 2: استخدام قاعدة بيانات خارجية

استخدم بيانات اعتماد قاعدة البيانات الخاصة بك في `DATABASE_URL`

### 5. تشغيل الهجرات

بعد ربط قاعدة البيانات، قم بتشغيل الهجرات:

```bash
# محلياً
pnpm db:push

# أو عبر Railway CLI
railway run pnpm db:push
```

### 6. الوصول إلى التطبيق

بعد النشر الناجح، ستحصل على رابط مثل:
```
https://personal-budget-app-production.up.railway.app
```

## التحديثات المستقبلية

بعد كل تحديث محلي:

```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

سيتم النشر تلقائياً على Railway!

## استكشاف الأخطاء

### المشكلة: خطأ في قاعدة البيانات
- تأكد من أن `DATABASE_URL` صحيح
- تحقق من أن قاعدة البيانات قابلة للوصول

### المشكلة: الصفحة لا تحمل
- تحقق من السجلات في Railway: **Logs** tab
- تأكد من أن جميع المتغيرات البيئية مضبوطة

### المشكلة: خطأ في البناء
- تأكد من أن `pnpm-lock.yaml` موجود
- تحقق من أن جميع المتغيرات البيئية المطلوبة موجودة

## الدعم

للمزيد من المعلومات:
- [توثيق Railway](https://docs.railway.app)
- [توثيق تطبيقنا](./README.md)
