console.log('=== 所有 PostgreSQL 相關環境變數 ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
console.log('POSTGRES_DATABASE:', process.env.POSTGRES_DATABASE);
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);

console.log('\n=== 所有環境變數 ===');
Object.keys(process.env)
  .filter(key => key.includes('POSTGRES') || key.includes('DATABASE'))
  .forEach(key => {
    console.log(`${key}:`, process.env[key]);
  });