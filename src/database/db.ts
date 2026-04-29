import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, leads, Lead, InsertLead, appointments, Appointment, InsertAppointment, integrations, Integration, InsertIntegration, eventLogs, EventLog, InsertEventLog } from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// LEADS QUERIES
// ============================================

export async function getLeadsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads);
}

export async function getLeadById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0];
}

export async function createLead(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const { userId, ...leadData } = data;
  const result = await db.insert(leads).values(leadData);
  return result;
}

export async function updateLead(id: number, userId: number, data: Partial<Lead>) {
  const db = await getDb();
  if (!db) return undefined;
  return db.update(leads).set(data).where(eq(leads.id, id));
}

// ============================================
// APPOINTMENTS QUERIES
// ============================================

export async function getAppointmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments);
}

export async function getAppointmentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result[0];
}

export async function createAppointment(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const { userId, ...appointmentData } = data;
  return db.insert(appointments).values(appointmentData);
}

export async function updateAppointment(id: number, userId: number, data: Partial<Appointment>) {
  const db = await getDb();
  if (!db) return undefined;
  return db.update(appointments).set(data).where(eq(appointments.id, id));
}

// ============================================
// AGENT CONFIG QUERIES (Placeholder)
// ============================================

export async function getAgentConfigByUserId(userId: number) {
  return { userId, systemPrompt: "", tone: "neutro" };
}

export async function createOrUpdateAgentConfig(userId: number, data: any) {
  return { success: true, data };
}

// ============================================
// INTEGRATION QUERIES
// ============================================

export async function getIntegrationByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(integrations).where(eq(integrations.userId, userId)).limit(1);
  return result[0];
}

export async function createOrUpdateIntegration(userId: number, data: Omit<InsertIntegration, 'userId'>) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await getIntegrationByUserId(userId);
  if (existing) {
    return db.update(integrations).set(data).where(eq(integrations.userId, userId));
  } else {
    return db.insert(integrations).values({ ...data, userId });
  }
}

// ============================================
// EVENT LOG QUERIES
// ============================================

export async function getEventLogsByLeadId(leadId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventLogs);
}

export async function createEventLog(data: InsertEventLog) {
  const db = await getDb();
  if (!db) return undefined;
  return db.insert(eventLogs).values(data);
}
