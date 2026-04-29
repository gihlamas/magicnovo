import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
  decimal,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Leads table - stores customer/prospect information
 */
export const leads = mysqlTable(
  "leads",
  {
    id: int("id").autoincrement().primaryKey(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 320 }),
    status: mysqlEnum("status", ["frio", "morno", "quente"]).default("frio").notNull(),
    stage: mysqlEnum("stage", ["novo", "qualificado", "proposta", "negociado", "perdido"]).default("novo").notNull(),
    service: varchar("service", { length: 255 }),
    lastInteraction: timestamp("lastInteraction").defaultNow().notNull(),
    followUpCount: int("followUpCount").default(0).notNull(),
    nextFollowUp: timestamp("nextFollowUp"),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    phoneIdx: index("phone_idx").on(table.phone),
    statusIdx: index("status_idx").on(table.status),
    stageIdx: index("stage_idx").on(table.stage),
    nextFollowUpIdx: index("nextFollowUp_idx").on(table.nextFollowUp),
  })
);

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Sessions table - stores conversation context per lead
 */
export const sessions = mysqlTable(
  "sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    messages: json("messages").default([]).notNull(),
    context: json("context").default({}).notNull(),
    lastActivity: timestamp("lastActivity").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    phoneIdx: index("session_phone_idx").on(table.phone),
  })
);

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Appointments table - stores scheduled meetings/calls
 */
export const appointments = mysqlTable(
  "appointments",
  {
    id: int("id").autoincrement().primaryKey(),
    leadId: int("leadId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    scheduledAt: timestamp("scheduledAt").notNull(),
    duration: int("duration").default(30).notNull(), // in minutes
    status: mysqlEnum("status", ["agendado", "confirmado", "realizado", "cancelado"]).default("agendado").notNull(),
    type: mysqlEnum("type", ["chamada", "reuniao", "demo", "consulta"]).default("consulta").notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    leadIdIdx: index("appointment_leadId_idx").on(table.leadId),
    scheduledAtIdx: index("scheduledAt_idx").on(table.scheduledAt),
    statusIdx: index("appointment_status_idx").on(table.status),
  })
);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Integrations table - stores API credentials and configuration
 */
export const integrations = mysqlTable(
  "integrations",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", ["whatsapp", "openai", "perfex"]).notNull(),
    isActive: boolean("isActive").default(false).notNull(),
    credentials: json("credentials").notNull(), // encrypted in production
    config: json("config").default({}).notNull(),
    lastTested: timestamp("lastTested"),
    testStatus: mysqlEnum("testStatus", ["success", "failed", "pending"]).default("pending"),
    testMessage: text("testMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("integration_userId_idx").on(table.userId),
    typeIdx: index("integration_type_idx").on(table.type),
  })
);

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

/**
 * Event Logs table - stores all system events for auditing and debugging
 */
export const eventLogs = mysqlTable(
  "eventLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    phone: varchar("phone", { length: 20 }),
    type: mysqlEnum("type", [
      "message_received",
      "message_sent",
      "lead_created",
      "lead_updated",
      "appointment_created",
      "appointment_updated",
      "ai_response",
      "integration_tested",
      "followup_sent",
      "error",
    ]).notNull(),
    status: mysqlEnum("status", ["success", "error", "pending"]).default("pending").notNull(),
    payload: json("payload").notNull(),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    phoneIdx: index("eventLog_phone_idx").on(table.phone),
    typeIdx: index("eventLog_type_idx").on(table.type),
    statusIdx: index("eventLog_status_idx").on(table.status),
    createdAtIdx: index("eventLog_createdAt_idx").on(table.createdAt),
  })
);

export type EventLog = typeof eventLogs.$inferSelect;
export type InsertEventLog = typeof eventLogs.$inferInsert;

/**
 * MagicAds Configuration table - stores MagicAds integration settings
 */
export const magicadsConfig = mysqlTable(
  "magicadsConfig",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    apiKey: varchar("apiKey", { length: 255 }).notNull(),
    webhookUrl: varchar("webhookUrl", { length: 500 }),
    isActive: boolean("isActive").default(true).notNull(),
    leadsReceived: int("leadsReceived").default(0).notNull(),
    followUpsSent: int("followUpsSent").default(0).notNull(),
    lastSyncAt: timestamp("lastSyncAt"),
    lastSyncStatus: mysqlEnum("lastSyncStatus", ["success", "failed", "pending"]).default("pending"),
    syncErrorMessage: text("syncErrorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("magicads_userId_idx").on(table.userId),
  })
);

export type MagicAdsConfig = typeof magicadsConfig.$inferSelect;
export type InsertMagicAdsConfig = typeof magicadsConfig.$inferInsert;

/**
 * Relations
 */
export const leadsRelations = relations(leads, ({ many }) => ({
  appointments: many(appointments),
  sessions: many(sessions),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  lead: one(leads, {
    fields: [appointments.leadId],
    references: [leads.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  lead: one(leads, {
    fields: [sessions.phone],
    references: [leads.phone],
  }),
}));
