import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, float, tinyint, bigint, json } from 'drizzle-orm/mysql-core';

const url = process.env.DATABASE_URL;
if (!url) { console.log('No DATABASE_URL'); process.exit(1); }

// Define a minimal executions table
const executions = mysqlTable('executions', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  type: mysqlEnum('type', ['single', 'team']).notNull().default('single'),
  status: mysqlEnum('status', ['pending', 'running', 'completed', 'failed', 'escalated', 'canceled']).notNull().default('pending'),
  input: text('input').notNull(),
  startedAt: timestamp('startedAt'),
  createdAt: timestamp('createdAt').defaultNow(),
});

const conn = await mysql.createConnection(url);
const db = drizzle(conn);

try {
  // Test without $returningId()
  const result1 = await db.insert(executions).values({
    userId: 1,
    type: 'single',
    status: 'running',
    input: 'test input drizzle',
    startedAt: new Date(),
  });
  console.log('Without $returningId() - result type:', typeof result1);
  console.log('Without $returningId() - result:', JSON.stringify(result1));
  console.log('result1[0]?.insertId:', result1[0]?.insertId);
  
  // Get the ID from the raw result
  const rawId = result1[0]?.insertId;
  console.log('Raw insertId:', rawId);
  
  // Clean up
  if (rawId) {
    await conn.execute('DELETE FROM executions WHERE id = ?', [rawId]);
    console.log('Cleaned up test row');
  }
  
  // Test with $returningId()
  const result2 = await db.insert(executions).values({
    userId: 1,
    type: 'single',
    status: 'running',
    input: 'test input drizzle 2',
    startedAt: new Date(),
  }).$returningId();
  console.log('\nWith $returningId() - result:', JSON.stringify(result2));
  console.log('result2[0]?.id:', result2[0]?.id);
  
  // Clean up
  if (result2[0]?.id) {
    await conn.execute('DELETE FROM executions WHERE id = ?', [result2[0].id]);
    console.log('Cleaned up test row 2');
  }
} catch (err) {
  console.error('Error:', err.message);
}

await conn.end();
