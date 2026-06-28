import { pgTable, text, timestamp, boolean, varchar, integer, serial, unique } from 'drizzle-orm/pg-core';

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
}));

export const userAkademisRelations = relations(userAkademis, ({ one }) => ({
  user: one(users, { fields: [userAkademis.userId], references: [users.id] }),
  akademi: one(akademi, { fields: [userAkademis.akademiId], references: [akademi.id] }),
}));
