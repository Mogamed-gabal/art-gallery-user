# ANASYA3QUB — Angular storefront

واجهة المستخدم العامة لموقع الفنان ANASYA3QUB، مبنية باستخدام Angular 20 وTypeScript وSCSS.

## التشغيل المحلي

المتطلبات: Node.js 20+ وnpm.

```bash
npm install
npm start
```

ثم افتح:

```text
http://localhost:4200
```

## عنوان الـ API

الخدمات مربوطة حاليًا مباشرة على:

```text
http://localhost:5000/api/v1
```

وهو مضبوط داخل:

```text
src/app/core/services/api.services.ts
```

إذا كان الـ Backend يعمل على جهاز مختلف، عدّل `API_BASE_URL` إلى عنوانه.

## المسارات الموجودة

- `/` الصفحة الرئيسية.
- `/artworks` معرض الأعمال والفلاتر.
- `/artworks/:id` تفاصيل العمل.
- `/checkout?artworkId=:id` الشراء المباشر.

## ملاحظات الربط

يجب أن يسمح الـ Backend بطلبات CORS من `http://localhost:4200`. إذا ظهر خطأ CORS، أضف هذا الأصل إلى إعدادات NestJS.

قسم الكورسات يتوقع endpoint عام:

```text
GET /api/v1/courses
```

وإن لم يكن endpoint جاهزًا بعد، ستظل الصفحة تعمل وتخفي القسم عند فشل تحميله بعد ضبط الخدمة حسب الـ Controller الفعلي.

## البناء للإنتاج

```bash
npm run build
```

النسخة النهائية ستظهر داخل `dist/anasya3qub`.
