import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const client = await pool.connect();
  console.log("Running database migration...");
  try {
    // Create enums (idempotent)
    await client.query(`DO $$ BEGIN CREATE TYPE role AS ENUM ('user', 'admin', 'manager'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await client.query(`DO $$ BEGIN CREATE TYPE plan AS ENUM ('starter', 'professional', 'enterprise'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await client.query(`DO $$ BEGIN CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'draft'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await client.query(`DO $$ BEGIN CREATE TYPE exec_status AS ENUM ('pending', 'running', 'success', 'failed', 'escalated', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await client.query(`DO $$ BEGIN CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await client.query(`DO $$ BEGIN CREATE TYPE connector_type AS ENUM ('overlay', 'readonly', 'write_back'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);

    // Users
    await client.query(`CREATE TABLE IF NOT EXISTS users (
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
    );`);

    // Agents
    await client.query(`CREATE TABLE IF NOT EXISTS agents (
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
    );`);
    await client.query(`CREATE INDEX IF NOT EXISTS agents_user_idx ON agents(user_id);`);
    // Add riskLevel and escalationEnabled columns if they don't exist (for existing deployments)
    await client.query(`ALTER TABLE agents ADD COLUMN IF NOT EXISTS agent_risk_level risk_level DEFAULT 'medium';`);
    await client.query(`ALTER TABLE agents ADD COLUMN IF NOT EXISTS escalation_enabled BOOLEAN DEFAULT true NOT NULL;`);

    // Teams
    await client.query(`CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      member_agent_ids JSONB,
      execution_order JSONB,
      governance_rules JSONB,
      execution_mode VARCHAR(32) DEFAULT 'sequential' NOT NULL,
      confidence_threshold REAL DEFAULT 0.7 NOT NULL,
      is_active BOOLEAN DEFAULT true NOT NULL,
      total_executions INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);
    // Add execution_mode column if it doesn't exist (for existing deployments)
    await client.query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS execution_mode VARCHAR(32) DEFAULT 'sequential' NOT NULL;`);
    // Add branching_rules column if it doesn't exist (for existing deployments)
    await client.query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS branching_rules JSONB;`);

    // Executions
    await client.query(`CREATE TABLE IF NOT EXISTS executions (
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
    );`);
    await client.query(`CREATE INDEX IF NOT EXISTS executions_user_idx ON executions(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS executions_agent_idx ON executions(agent_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS executions_created_idx ON executions(created_at DESC);`);

    // Audit logs - drop and recreate with all required columns
    await client.query(`DROP TABLE IF EXISTS audit_logs CASCADE;`);
    await client.query(`CREATE TABLE audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      execution_id INTEGER REFERENCES executions(id) ON DELETE SET NULL,
      agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
      action VARCHAR(128) NOT NULL,
      entity_type VARCHAR(64),
      entity_id VARCHAR(64),
      details JSONB,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);
    await client.query(`CREATE INDEX IF NOT EXISTS audit_user_idx ON audit_logs(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_logs(created_at DESC);`);

    // Drop and recreate governance_settings with correct columns
    await client.query(`DROP TABLE IF EXISTS governance_settings CASCADE;`);
    await client.query(`CREATE TABLE governance_settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      global_confidence_threshold REAL DEFAULT 0.75 NOT NULL,
      global_escalation_threshold REAL DEFAULT 0.5 NOT NULL,
      require_approval_for_write_back BOOLEAN DEFAULT true NOT NULL,
      max_concurrent_executions INTEGER DEFAULT 5 NOT NULL,
      auto_escalate_high_risk BOOLEAN DEFAULT true NOT NULL,
      notify_on_escalation BOOLEAN DEFAULT true NOT NULL,
      retention_days INTEGER DEFAULT 365 NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);

    // KPI definitions - drop and recreate to ensure all columns exist
    await client.query(`DROP TABLE IF EXISTS kpi_results CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS kpi_definitions CASCADE;`);
    await client.query(`CREATE TABLE kpi_definitions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      formula TEXT,
      data_source VARCHAR(64),
      unit VARCHAR(32),
      target_value REAL,
      threshold_warning REAL,
      threshold_critical REAL,
      chart_type VARCHAR(32) DEFAULT 'line',
      is_active BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);

    // KPI results
    await client.query(`CREATE TABLE kpi_results (
      id SERIAL PRIMARY KEY,
      kpi_id INTEGER NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
      value REAL NOT NULL,
      calculated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      metadata JSONB
    );`);

    // Metrics snapshots
    await client.query(`CREATE TABLE IF NOT EXISTS metrics_snapshots (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      snapshot_date TIMESTAMP DEFAULT NOW() NOT NULL,
      automation_rate REAL,
      escalation_rate REAL,
      avg_processing_time_ms REAL,
      human_override_rate REAL,
      avg_confidence_score REAL,
      hours_saved REAL,
      cost_savings REAL,
      total_executions INTEGER,
      successful_executions INTEGER,
      failed_executions INTEGER,
      escalated_executions INTEGER
    );`);
    await client.query(`CREATE INDEX IF NOT EXISTS metrics_user_idx ON metrics_snapshots(user_id);`);

    // Integration connectors
    await client.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'integration_type') THEN
        CREATE TYPE integration_type AS ENUM ('google_drive', 'slack', 'rest_api', 'webhook', 'database');
      END IF;
    END $$;`);
    await client.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'integration_status') THEN
        CREATE TYPE integration_status AS ENUM ('active', 'inactive', 'error');
      END IF;
    END $$;`);
    await client.query(`CREATE TABLE IF NOT EXISTS integrations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      type integration_type NOT NULL,
      status integration_status DEFAULT 'active' NOT NULL,
      credentials JSONB,
      config JSONB,
      last_tested_at TIMESTAMP,
      last_used_at TIMESTAMP,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);
    await client.query(`CREATE INDEX IF NOT EXISTS integrations_user_idx ON integrations(user_id);`);
    await client.query(`CREATE TABLE IF NOT EXISTS agent_integrations (
      id SERIAL PRIMARY KEY,
      agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      integration_id INTEGER NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
      permissions JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);

    // Notification settings
    await client.query(`CREATE TABLE IF NOT EXISTS notification_settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      escalation_email_enabled BOOLEAN DEFAULT false NOT NULL,
      escalation_email TEXT,
      slack_webhook_enabled BOOLEAN DEFAULT false NOT NULL,
      slack_webhook_url TEXT,
      notify_on_high_risk BOOLEAN DEFAULT true NOT NULL,
      notify_on_critical_risk BOOLEAN DEFAULT true NOT NULL,
      notify_on_low_confidence BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);

    // Escalation reviews (matching schema exactly)
    await client.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
        CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
      END IF;
    END $$;`);
    await client.query(`CREATE TABLE IF NOT EXISTS escalation_reviews (
      id SERIAL PRIMARY KEY,
      execution_id INTEGER NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
      reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status review_status DEFAULT 'pending' NOT NULL,
      decision_comment TEXT,
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);
    await client.query(`CREATE INDEX IF NOT EXISTS escalation_reviews_exec_idx ON escalation_reviews(execution_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS escalation_reviews_reviewer_idx ON escalation_reviews(reviewer_id);`);

    // Schedules (matching schema exactly)
    await client.query(`CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
      team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
      cron_expression VARCHAR(100) NOT NULL,
      input_text TEXT,
      output_format VARCHAR(50) DEFAULT 'bullet_points',
      enabled BOOLEAN DEFAULT true NOT NULL,
      last_run_at TIMESTAMP,
      next_run_at TIMESTAMP,
      total_runs INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);
    await client.query(`CREATE INDEX IF NOT EXISTS schedules_user_idx ON schedules(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS schedules_agent_idx ON schedules(agent_id);`);

    // Encryption keys
    await client.query(`CREATE TABLE IF NOT EXISTS encryption_keys (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      public_key TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);

    // Recovery keys
    await client.query(`CREATE TABLE IF NOT EXISTS recovery_keys (
      id VARCHAR(36) PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      last_used_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true NOT NULL
    );`);

    // Backup metadata
    await client.query(`CREATE TABLE IF NOT EXISTS backup_metadata (
      id VARCHAR(36) PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      data_type VARCHAR(50) NOT NULL,
      backup_date TIMESTAMP DEFAULT NOW() NOT NULL,
      encrypted_size INTEGER NOT NULL,
      checksum VARCHAR(64) NOT NULL,
      storage_location TEXT NOT NULL,
      is_verified BOOLEAN DEFAULT true NOT NULL,
      expires_at TIMESTAMP NOT NULL
    );`);

    // Encrypted backups
    await client.query(`CREATE TABLE IF NOT EXISTS encrypted_backups (
      backup_id VARCHAR(36) PRIMARY KEY REFERENCES backup_metadata(id) ON DELETE CASCADE,
      encrypted_data TEXT NOT NULL,
      nonce VARCHAR(255) NOT NULL
    );`);

    // Add output_preferences column to users (for existing deployments)
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS output_preferences TEXT;`);
    // Add is_active column to users (for existing deployments - required for account deactivation feature)
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;`);
    // Add is_active column to agents (for existing deployments)
    await client.query(`ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;`);

    // SSO config table
    await client.query(`CREATE TABLE IF NOT EXISTS sso_config (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      enabled BOOLEAN DEFAULT false NOT NULL,
      provider VARCHAR(64),
      entity_id TEXT,
      sso_url TEXT,
      certificate TEXT,
      attribute_mapping JSONB,
      force_sso BOOLEAN DEFAULT false NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);

    // Status checks table
    await client.query(`CREATE TABLE IF NOT EXISTS status_checks (
      id SERIAL PRIMARY KEY,
      service VARCHAR(64) NOT NULL,
      status VARCHAR(32) NOT NULL,
      response_time_ms INTEGER,
      checked_at TIMESTAMP DEFAULT NOW() NOT NULL
    );`);

    // Status incidents table
    await client.query(`CREATE TABLE IF NOT EXISTS status_incidents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      severity VARCHAR(32) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'resolved',
      started_at TIMESTAMP DEFAULT NOW() NOT NULL,
      resolved_at TIMESTAMP
    );`);

    console.log("Database migration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
