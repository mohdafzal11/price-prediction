# Redis Migration Utility

This utility script helps migrate data from one Redis instance to another, preserving TTLs (expiration times) for all keys.

## Prerequisites

Before using this script, ensure you have the following dependencies installed:

```bash
npm install ioredis dotenv yargs
```

## Usage

```bash
node migrateRedis.js --source "redis://:password@host:port/db" --target "redis://:password@host:port/db" [options]
```

If no source is specified, the script will use the `REDIS_URL` from your environment variables.

## Options

- `--source`, `-s`: Source Redis connection string (default: uses REDIS_URL from .env)
- `--target`, `-t`: Target Redis connection string (required)
- `--pattern`, `-p`: Pattern to match keys (e.g., "coin_*", "price_*") (default: "*" for all keys)
- `--batch-size`, `-b`: Number of keys to process in each batch (default: 100)
- `--dry-run`, `-d`: Perform a dry run without actually writing data (default: false)
- `--flush-target`, `-f`: Flush the target Redis database before migration (default: false)
- `--help`, `-h`: Show help

## Examples

### Migrate all Redis data to a new instance

```bash
node migrateRedis.js --target "redis://:password@newhost:port/db"
```

### Migrate only specific keys (e.g., only coin data)

```bash
node migrateRedis.js --target "redis://:password@newhost:port/db" --pattern "coin_*"
```

### Perform a dry run to see what would be migrated

```bash
node migrateRedis.js --target "redis://:password@newhost:port/db" --dry-run
```

### Flush the target Redis and migrate with a larger batch size

```bash
node migrateRedis.js --target "redis://:password@newhost:port/db" --flush-target --batch-size 500
```

## Notes

- The script uses the `DUMP` and `RESTORE` Redis commands to preserve the exact data format and TTL
- It processes keys in batches to avoid overwhelming the Redis server
- For large datasets, consider increasing the batch size for better performance
- Always test with `--dry-run` first to ensure everything is set up correctly
