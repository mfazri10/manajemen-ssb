import { pgTable, text, timestamp, boolean, varchar, integer, serial, unique, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  label: varchar('label', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  label: varchar('label', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const roleUsers = pgTable('role_users', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (t) => [
  unique().on(t.userId, t.roleId)
]);

export const permissionRoles = pgTable('permission_roles', {
  id: serial('id').primaryKey(),
  permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (t) => [
  unique().on(t.permissionId, t.roleId)
]);

export const menus = pgTable('menus', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  route: varchar('route', { length: 255 }),
  icon: varchar('icon', { length: 255 }),
  parentId: integer('parent_id'),
  orderNo: integer('order_no').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const akademi = pgTable('akademi', {
  id: text('id').primaryKey(),
  nama: varchar('nama', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  // Jenis produk: akademi | gor | futsal | badminton | gym | yoga | pilates | lainnya
  type: varchar('type', { length: 30 }).default('akademi').notNull(),
  logoUrl: text('logo_url'),
  alamat: text('alamat'),
  noHp: varchar('no_hp', { length: 20 }),
  email: varchar('email', { length: 100 }),
  website: varchar('website', { length: 200 }),
  paket: varchar('paket', { length: 20 }).default('gratis').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tracking langganan / free trial per akademi
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  akademiId: text('akademi_id').notNull().references(() => akademi.id, { onDelete: 'cascade' }),
  // plan: trial | starter | growth | pro
  plan: varchar('plan', { length: 20 }).default('trial').notNull(),
  // status: active | expired | cancelled
  status: varchar('status', { length: 20 }).default('active').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),  // null = tidak ada batas (paket permanent)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Jawaban survey pemilihan produk saat onboarding
export const userOnboardingSurvey = pgTable('user_onboarding_survey', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // Jenis produk yang dipilih user (ssb | akademi_badminton | venue_futsal | gym | dll)
  productType: varchar('product_type', { length: 30 }).notNull(),
  // Simpan semua jawaban survey dalam format fleksibel
  rawAnswers: jsonb('raw_answers'),
  isCompleted: boolean('is_completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
}, (t) => [
  unique().on(t.userId),  // 1 user hanya boleh 1 survey
]);

// Tracking progress checklist onboarding per user (UX progressive disclosure)
export const onboardingProgress = pgTable('onboarding_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // step: profile | siswa | jadwal | spp | done
  step: varchar('step', { length: 50 }).notNull(),
  completed: boolean('completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
}, (t) => [
  unique().on(t.userId, t.step),  // 1 user, 1 step, 1 record
]);

export const userAkademis = pgTable('user_akademis', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  akademiId: text('akademi_id').notNull().references(() => akademi.id, { onDelete: 'cascade' }),
  isDefault: boolean('is_default').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.userId, t.akademiId)
]);

// ============================================================
// RELATIONS
// ============================================================
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  roleUsers: many(roleUsers),
  sessions: many(sessions),
  accounts: many(accounts),
  userAkademis: many(userAkademis),
  onboardingSurvey: many(userOnboardingSurvey),
  onboardingProgress: many(onboardingProgress),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  roleUsers: many(roleUsers),
  permissionRoles: many(permissionRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  permissionRoles: many(permissionRoles),
}));

export const roleUsersRelations = relations(roleUsers, ({ one }) => ({
  user: one(users, { fields: [roleUsers.userId], references: [users.id] }),
  role: one(roles, { fields: [roleUsers.roleId], references: [roles.id] }),
}));

export const permissionRolesRelations = relations(permissionRoles, ({ one }) => ({
  permission: one(permissions, { fields: [permissionRoles.permissionId], references: [permissions.id] }),
  role: one(roles, { fields: [permissionRoles.roleId], references: [roles.id] }),
}));

export const menusRelations = relations(menus, ({ one, many }) => ({
  parent: one(menus, { fields: [menus.parentId], references: [menus.id], relationName: 'subMenu' }),
  subMenus: many(menus, { relationName: 'subMenu' }),
}));

export const akademiRelations = relations(akademi, ({ many }) => ({
  userAkademis: many(userAkademis),
  subscriptions: many(subscriptions),
}));

export const userAkademisRelations = relations(userAkademis, ({ one }) => ({
  user: one(users, { fields: [userAkademis.userId], references: [users.id] }),
  akademi: one(akademi, { fields: [userAkademis.akademiId], references: [akademi.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  akademi: one(akademi, { fields: [subscriptions.akademiId], references: [akademi.id] }),
}));

export const userOnboardingSurveyRelations = relations(userOnboardingSurvey, ({ one }) => ({
  user: one(users, { fields: [userOnboardingSurvey.userId], references: [users.id] }),
}));

export const onboardingProgressRelations = relations(onboardingProgress, ({ one }) => ({
  user: one(users, { fields: [onboardingProgress.userId], references: [users.id] }),
}));

// ============================================================
// AFFILIATE PROGRAM
// ============================================================
import { numeric, inet, index } from 'drizzle-orm/pg-core';

export const affiliates = pgTable('affiliates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  kodeReferral: varchar('kode_referral', { length: 20 }).notNull().unique(),
  tier: varchar('tier', { length: 20 }).notNull().default('starter'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  // Komisi override individual (null = ikuti tier default)
  komisiFlatIdr: numeric('komisi_flat_idr', { precision: 12, scale: 2 }),
  komisiPctY1: numeric('komisi_pct_y1', { precision: 5, scale: 2 }),
  komisiPctY2: numeric('komisi_pct_y2', { precision: 5, scale: 2 }),
  // Info bank pencairan
  namaBank: varchar('nama_bank', { length: 50 }),
  nomorRekening: varchar('nomor_rekening', { length: 30 }),
  atasNama: varchar('atas_nama', { length: 100 }),
  // Statistik agregat
  totalKlik: integer('total_klik').notNull().default(0),
  totalReferral: integer('total_referral').notNull().default(0),
  totalKomisi: numeric('total_komisi', { precision: 14, scale: 2 }).notNull().default('0'),
  saldoTersedia: numeric('saldo_tersedia', { precision: 14, scale: 2 }).notNull().default('0'),
  saldoPending: numeric('saldo_pending', { precision: 14, scale: 2 }).notNull().default('0'),
  catatanAdmin: text('catatan_admin'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('idx_affiliates_user_id').on(t.userId),
  index('idx_affiliates_kode').on(t.kodeReferral),
  index('idx_affiliates_tier').on(t.tier),
  index('idx_affiliates_status').on(t.status),
]);

export const affiliateLinks = pgTable('affiliate_links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  affiliateId: text('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'cascade' }),
  nama: varchar('nama', { length: 100 }).notNull().default('Link Utama'),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  targetUrl: text('target_url').notNull().default('/register'),
  utmSource: varchar('utm_source', { length: 50 }).default('affiliate'),
  utmMedium: varchar('utm_medium', { length: 50 }).default('referral'),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  aktif: boolean('aktif').notNull().default(true),
  totalKlik: integer('total_klik').notNull().default(0),
  totalKonversi: integer('total_konversi').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_aff_links_affiliate').on(t.affiliateId),
  index('idx_aff_links_slug').on(t.slug),
]);

export const affiliateVisits = pgTable('affiliate_visits', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  affiliateId: text('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'cascade' }),
  linkId: text('link_id').references(() => affiliateLinks.id, { onDelete: 'set null' }),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  referrerUrl: text('referrer_url'),
  converted: boolean('converted').notNull().default(false),
  convertedAt: timestamp('converted_at'),
  visitedAt: timestamp('visited_at').defaultNow().notNull(),
}, (t) => [
  index('idx_aff_visits_affiliate').on(t.affiliateId),
  index('idx_aff_visits_converted').on(t.converted),
]);

export const affiliateReferrals = pgTable('affiliate_referrals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  affiliateId: text('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'restrict' }),
  linkId: text('link_id').references(() => affiliateLinks.id, { onDelete: 'set null' }),
  visitId: text('visit_id').references(() => affiliateVisits.id, { onDelete: 'set null' }),
  akademiId: text('akademi_id').notNull().references(() => akademi.id, { onDelete: 'restrict' }),
  // Nilai pembayaran langganan yang memicu komisi
  paymentAmount: numeric('payment_amount', { precision: 12, scale: 2 }).notNull(),
  paymentBulanKe: integer('payment_bulan_ke').notNull().default(1),
  // Rincian komisi
  komisiFlat: numeric('komisi_flat', { precision: 12, scale: 2 }).notNull().default('0'),
  komisiPctEarned: numeric('komisi_pct_earned', { precision: 12, scale: 2 }).notNull().default('0'),
  komisiTotal: numeric('komisi_total', { precision: 12, scale: 2 }).notNull().default('0'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  catatan: text('catatan'),
  conversionAt: timestamp('conversion_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_aff_referrals_affiliate').on(t.affiliateId),
  index('idx_aff_referrals_akademi').on(t.akademiId),
  index('idx_aff_referrals_status').on(t.status),
]);

export const affiliatePayouts = pgTable('affiliate_payouts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  affiliateId: text('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'restrict' }),
  jumlah: numeric('jumlah', { precision: 12, scale: 2 }).notNull(),
  metode: varchar('metode', { length: 30 }).notNull().default('transfer_bank'),
  status: varchar('status', { length: 20 }).notNull().default('requested'),
  buktiTransfer: text('bukti_transfer'),
  referensiBiaya: varchar('referensi_biaya', { length: 100 }),
  catatan: text('catatan'),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  paidAt: timestamp('paid_at'),
}, (t) => [
  index('idx_aff_payouts_affiliate').on(t.affiliateId),
  index('idx_aff_payouts_status').on(t.status),
]);

export const affiliatePayoutItems = pgTable('affiliate_payout_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  payoutId: text('payout_id').notNull().references(() => affiliatePayouts.id, { onDelete: 'cascade' }),
  referralId: text('referral_id').notNull().references(() => affiliateReferrals.id, { onDelete: 'restrict' }),
  jumlah: numeric('jumlah', { precision: 12, scale: 2 }).notNull(),
});

// === AFFILIATE RELATIONS ===
export const affiliatesRelations = relations(affiliates, ({ one, many }) => ({
  user: one(users, { fields: [affiliates.userId], references: [users.id] }),
  links: many(affiliateLinks),
  visits: many(affiliateVisits),
  referrals: many(affiliateReferrals),
  payouts: many(affiliatePayouts),
}));

export const affiliateLinksRelations = relations(affiliateLinks, ({ one, many }) => ({
  affiliate: one(affiliates, { fields: [affiliateLinks.affiliateId], references: [affiliates.id] }),
  visits: many(affiliateVisits),
  referrals: many(affiliateReferrals),
}));

export const affiliateVisitsRelations = relations(affiliateVisits, ({ one }) => ({
  affiliate: one(affiliates, { fields: [affiliateVisits.affiliateId], references: [affiliates.id] }),
  link: one(affiliateLinks, { fields: [affiliateVisits.linkId], references: [affiliateLinks.id] }),
}));

export const affiliateReferralsRelations = relations(affiliateReferrals, ({ one, many }) => ({
  affiliate: one(affiliates, { fields: [affiliateReferrals.affiliateId], references: [affiliates.id] }),
  link: one(affiliateLinks, { fields: [affiliateReferrals.linkId], references: [affiliateLinks.id] }),
  visit: one(affiliateVisits, { fields: [affiliateReferrals.visitId], references: [affiliateVisits.id] }),
  akademi: one(akademi, { fields: [affiliateReferrals.akademiId], references: [akademi.id] }),
  payoutItems: many(affiliatePayoutItems),
}));

export const affiliatePayoutsRelations = relations(affiliatePayouts, ({ one, many }) => ({
  affiliate: one(affiliates, { fields: [affiliatePayouts.affiliateId], references: [affiliates.id] }),
  items: many(affiliatePayoutItems),
}));

export const affiliatePayoutItemsRelations = relations(affiliatePayoutItems, ({ one }) => ({
  payout: one(affiliatePayouts, { fields: [affiliatePayoutItems.payoutId], references: [affiliatePayouts.id] }),
  referral: one(affiliateReferrals, { fields: [affiliatePayoutItems.referralId], references: [affiliateReferrals.id] }),
}));
