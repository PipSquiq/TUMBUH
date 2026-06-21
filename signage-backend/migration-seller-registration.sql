-- =============================================
-- MIGRATION: Fitur Pendaftaran Penjual
-- Tanggal: 2026-06-21
-- Deskripsi: Menambahkan tabel seller_payments
--            dan kolom isSeller di tabel users
-- =============================================

-- 1. Tambah kolom isSeller ke tabel users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS "isSeller" boolean DEFAULT false NOT NULL;

-- 2. Buat tabel seller_payments
CREATE TABLE IF NOT EXISTS public.seller_payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type character varying(20) NOT NULL,
    provider character varying(100),
    "accountNumber" character varying(100),
    "accountName" character varying(150),
    "userId" uuid,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT seller_payments_pkey PRIMARY KEY (id),
    CONSTRAINT fk_seller_payments_user FOREIGN KEY ("userId") 
        REFERENCES public.users(id) ON DELETE CASCADE
);

-- 3. Index untuk mempercepat query berdasarkan userId
CREATE INDEX IF NOT EXISTS idx_seller_payments_userId 
ON public.seller_payments ("userId");

-- 4. (OPSIONAL) Set isSeller = true untuk user yang SUDAH punya produk
-- Jalankan ini jika ingin migrasi otomatis user lama yang sudah jual produk
UPDATE public.users 
SET "isSeller" = true 
WHERE id IN (
    SELECT DISTINCT "sellerId" 
    FROM public.products 
    WHERE "sellerId" IS NOT NULL
);

-- =============================================
-- VERIFIKASI (Jalankan setelah migration)
-- =============================================

-- Cek kolom isSeller sudah ada di users
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'isSeller';

-- Cek tabel seller_payments sudah dibuat
-- SELECT * FROM information_schema.tables 
-- WHERE table_name = 'seller_payments';

-- Cek user yang sudah jadi penjual
-- SELECT id, username, "isSeller" FROM public.users WHERE "isSeller" = true;
