import { migrate } from 'drizzle-orm/postgres-js/migrator';
import db from './db.config';

async function migrateData(): Promise<void> {
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrated Successfully');
  process.exit(0);
}

migrateData().catch((error) => {
  console.log(error);
  process.exit(0);
});
