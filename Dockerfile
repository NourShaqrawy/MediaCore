# ============================
# 1) Build Stage
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

# تثبيت المكتبات الأساسية
RUN apk add --no-cache python3 make g++

# نسخ ملفات المشروع
COPY package*.json ./
COPY prisma ./prisma

# تثبيت dependencies
RUN npm install

# توليد Prisma Client
RUN npx prisma generate

# نسخ باقي المشروع
COPY . .

# بناء NestJS
RUN npm run build


# ============================
# 2) Production Stage
# ============================
FROM node:20-alpine AS production

WORKDIR /app

# تثبيت المكتبات الأساسية
RUN apk add --no-cache python3 make g++

# نسخ فقط الملفات الضرورية من مرحلة البناء
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY entry.sh ./entry.sh

# إعطاء صلاحيات للتشغيل
RUN chmod +x entry.sh

# المنفذ الافتراضي
EXPOSE 3000

# تشغيل التطبيق عبر entry.sh
CMD ["./entry.sh"]
