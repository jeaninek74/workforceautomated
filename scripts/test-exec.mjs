import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) { console.log('No DATABASE_URL'); process.exit(1); }

const conn = await mysql.createConnection(url);

try {
  const result = await conn.execute(
    'INSERT INTO executions (userId, type, status, input, startedAt, createdAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
    [1, 'single', 'running', 'test input']
  );
  console.log('Raw mysql2 result[0]:', JSON.stringify(result[0]));
  console.log('insertId:', result[0].insertId);
  
  // Clean up
  await conn.execute('DELETE FROM executions WHERE id = ?', [result[0].insertId]);
  console.log('Cleaned up test row');
} catch (err) {
  console.error('Error:', err.message);
}

await conn.end();
