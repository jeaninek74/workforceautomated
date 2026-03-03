import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "./schema.js";
import { sql } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool, { schema });

async function migrate() {
  console.log("Running database migration...");
  try {
    // Create enums first
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('user', 'admin', 'manager');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE plan AS ENUM ('starter', 'professional', 'enterprise');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'draft');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE exec_status AS ENUM ('pending', 'running', 'success', 'failed', 'escalated', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE connector_type AS ENUM ('overlay', 'readonly', 'write_back');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Create tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(320) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role role DEFAULT 'user' NOT NULL,
        plan plan DEFAULT 'starter' NOT NULL,
        stripe_customer_id VARCHAR(64),
        stripe_subscription_id VARCHAR(64),
        is_active BOOLEAN DEFAULT true NOT NULL,
        email_verified BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_signed_in TIMESTAMP
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        role VARCHAR(255),
        capabilities JSONB,
        permissions JSONB,
        connector_type connector_type DEFAULT 'readonly',
        confidence_threshold REAL DEFAULT 0.75 NOT NULL,
        escalation_threshold REAL DEFAULT 0.5 NOT NULL,
        system_prompt TEXT,
        status agent_status DEFAULT 'draft' NOT NULL,
        last_executed_at TIMESTAMP,
        total_executions INTEGER DEFAULT 0 NOT NULL,
        avg_confidence REAL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS agents_user_idx ON agents(user_id);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        member_agent_ids JSONB,
        execution_order JSONB,
        governance_rules JSONB,
        confidence_threshold REAL DEFAULT 0.7 NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        total_executions INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS executions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
        team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        type VARCHAR(32) DEFAULT 'single' NOT NULL,
        status exec_status DEFAULT 'pending' NOT NULL,
        input TEXT,
        output TEXT,
        confidence_score REAL,
        risk_level risk_level,
        escalated BOOLEAN DEFAULT false NOT NULL,
        escalation_reason TEXT,
        processing_time_ms INTEGER,
        token_count INTEGER,
        metadata JSONB,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS executions_user_idx ON executions(user_id);
      CREATE INDEX IF NOT EXISTS executions_agent_idx ON executions(agent_id);
      CREATE INDEX IF NOT EXISTS executions_created_idx ON executions(created_at DESC);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(64),
        entity_id VARCHAR(64),
        ip_address VARCHAR(64),
        user_agent TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS audit_user_idx ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_logs(created_at DESC);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS governance_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        confidence_threshold REAL DEFAULT 0.75 NOT NULL,
        risk_threshold risk_level DEFAULT 'medium',
        auto_escalate BOOLEAN DEFAULT true NOT NULL,
        require_human_review BOOLEAN DEFAULT false NOT NULL,
        audit_retention_days INTEGER DEFAULT 90 NOT NULL,
        allowed_connectors JSONB,
        blocked_capabilities JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS kpi_definitions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        formula TEXT,
        target_value REAL,
        unit VARCHAR(64),
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log("Database migration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

migrate().catch(console.error);
