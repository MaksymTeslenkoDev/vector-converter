const fsp = require('node:fs').promises;
const path = require('path');

async function migrate({ pool, log, migrationsPath }) {
  try {
    log.info('Starting migration process...');

    const [migrationTable] = await pool.query('SHOW TABLES LIKE "migration"');
    if (migrationTable.length === 0) {
      await createMigrationTable(pool, log);
    }

    const migrations = await loadMigrations(migrationsPath);

    const [appliedMigrations] = await pool.query('SELECT num FROM migration');
    const migrated = appliedMigrations.reduce((acc, { num }) => {
      acc[num] = true;
      return acc;
    }, {});

    for (const item of migrations) {
      if (migrated[item.num]) {
        continue;
      }
      await replay(pool, log, item);
    }

    log.info('Migration process completed.');
  } catch (e) {
    log.error('Error while doing migrations');
  }
}

async function createMigrationTable(pool, log) {
  log.info("Migration table doesn't exist, creating...");
  await pool.execute(`
    CREATE TABLE migration (
      num INT(6) NOT NULL UNIQUE,
      executedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function loadMigrations(migrationsPath) {
  const files = await fsp.readdir(migrationsPath, { withFileTypes: true });
  const migrations = [];

  for (let file of files) {
    const { name } = file;
    if (file.isFile() && !name.endsWith('.sql')) continue;
    const idx = name.indexOf('-');
    if (idx < 0) throw new Error('Wrong migration file name');

    const num = parseInt(name.substring(0, idx), 10);
    if (isNaN(num)) {
      throw new Error(`Invalid migration number in file: ${file}`);
    }

    migrations.push({
      num,
      upFilePath: path.resolve(migrationsPath, name),
    });
  }

  migrations.sort((a, b) => {
    if (a.num === b.num) {
      throw new Error(`Duplicate migration number ${a.num}`);
    }
    return a.num - b.num;
  });

  return migrations;
}

async function replay(pool, log, migration) {
  log.info(`Executing migration ${migration.num}`);

  const migrationSql = await fsp.readFile(migration.upFilePath, 'utf8');
  const sanitizedSql = removeSqlComments(migrationSql);

  await pool.query(sanitizedSql);
  await pool.execute(
    'INSERT INTO migration (num, executedAt) VALUES (?, NOW())',
    [migration.num],
  );

  log.info(`Migration ${migration.num} applied successfully.`);
}

function removeSqlComments(sql) {
  return sql.replace(/--(.*?)$/gm, '').trim();
}

module.exports = migrate;
