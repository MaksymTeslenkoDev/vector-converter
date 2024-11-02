const fs = require('node:fs');
const path = require('path');

async function migrate(pool, log) {
  log.info('Starting migration process...');

  const [migrationTable] = await pool.query('SHOW TABLES LIKE "migration"');
  if (migrationTable.length === 0) {
    await createMigrationTable(pool, log);
  }

  const migrations = await loadMigrations(log);

  const [appliedMigrations] = await pool.query('SELECT num FROM migration');
  const migrated = appliedMigrations.reduce((acc, { num }) => {
    acc[num] = true;
    return acc;
  }, {});

  for (const item of migrations) {
    if (migrated[item.num]) {
      log.info(`Migration ${item.num} already applied. Skipping.`);
      continue;
    }
    await replay(pool, log, item);
  }

  log.info('Migration process completed.');
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

function loadMigrations(log) {
  return new Promise((resolve, reject) => {
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    fs.readdir(migrationsDir, (err, files) => {
      if (err) {
        log.error('Error reading migrations directory:', err);
        return reject(err);
      }

      try {
        const migrations = files
          .filter((file) => file.endsWith('.sql'))
          .map((file) => {
            let idx = file.indexOf('-');
            if (idx === -1) idx = file.indexOf('.');

            const num = parseInt(file.substring(0, idx), 10);
            if (isNaN(num)) {
              throw new Error(`Invalid migration number in file: ${file}`);
            }

            return {
              num,
              upFilePath: path.resolve(migrationsDir, file),
            };
          });

        migrations.sort((a, b) => {
          if (a.num === b.num) {
            throw new Error(`Duplicate migration number ${a.num}`);
          }
          return a.num - b.num;
        });

        resolve(migrations);
      } catch (e) {
        log.error('Error processing migrations:', e);
        reject(e);
      }
    });
  });
}

async function replay(pool, log, migration) {
  log.info(`Executing migration ${migration.num}`);

  const migrationSql = await readFileAsync(migration.upFilePath, 'utf8');
  const sanitizedSql = removeSqlComments(migrationSql);

  await pool.query(sanitizedSql);
  await pool.execute(
    'INSERT INTO migration (num, executedAt) VALUES (?, NOW())',
    [migration.num],
  );

  log.info(`Migration ${migration.num} applied successfully.`);
}

function readFileAsync(filePath, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, encoding, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function removeSqlComments(sql) {
  return sql.replace(/--(.*?)$/gm, '').trim();
}

module.exports = migrate;
