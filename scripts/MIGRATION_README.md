# MongoDB Migration Utility

This utility script helps migrate data from one MongoDB instance to another while using Prisma.

## Prerequisites

Before using this script, ensure you have the following dependencies installed:

```bash
npm install mongodb dotenv yargs
```

## Usage

```bash
node migrateDatabase.js --source "mongodb://sourceUser:sourcePass@sourceHost:sourcePort/sourceDB" --target "mongodb://targetUser:targetPass@targetHost:targetPort/targetDB" [options]
```

If no source is specified, the script will use the `DATABASE_URL` from your environment variables.

## Options

- `--source`, `-s`: Source MongoDB connection string (default: uses DATABASE_URL from .env)
- `--target`, `-t`: Target MongoDB connection string (required)
- `--models`, `-m`: Comma-separated list of models to migrate (default: all models)
- `--dry-run`, `-d`: Perform a dry run without actually writing data (default: false)
- `--batch-size`, `-b`: Number of documents to process in each batch (default: 100)
- `--drop-target`: Drop collections in target database before migration (default: false)
- `--skip-relations`: Skip relation validation (use with caution) (default: false)
- `--help`, `-h`: Show help

## Examples

### Migrate all data to a new database

```bash
node migrateDatabase.js --target "mongodb://user:pass@newhost:27017/newdb"
```

### Migrate only specific models

```bash
node migrateDatabase.js --target "mongodb://user:pass@newhost:27017/newdb" --models "Token,TokenHistory"
```

### Perform a dry run to see what would be migrated

```bash
node migrateDatabase.js --target "mongodb://user:pass@newhost:27017/newdb" --dry-run
```

### Migrate with a larger batch size for faster processing

```bash
node migrateDatabase.js --target "mongodb://user:pass@newhost:27017/newdb" --batch-size 500
```

## Migration Order

The script migrates collections in a specific order to respect relationships:

1. NetworkType
2. Category
3. User
4. Token
5. TokenNetworkAddress
6. TokenToCategory
7. Portfolio
8. PortfolioHolding
9. Wishlist
10. WishlistToken
11. TokenHistory
12. Exchange
13. ExchangeAsset

## Notes

- The script uses the Prisma schema to determine the structure of your database.
- It handles duplicate key errors by logging and continuing with the migration.
- For large databases, consider increasing the batch size for better performance.
- Always test with `--dry-run` first to ensure everything is set up correctly.
