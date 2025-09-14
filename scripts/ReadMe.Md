# DroomMarket Scripts

## MongoDB Setup

USE MONGODB REPLICA SET ELSE THE COMMANDS WILL FAIL AS IT USES TRANSACTIONS

## Chart Data Management Scripts

### Update Chart Data (update-chart-data.ts)

This script updates chart data for all coins in the database and migrates it from Redis cache to the database.

#### Features

- Fetches all tokens with CoinMarketCap IDs from the database
- Calls the chart API for each token to update the Redis cache
- Processes tokens in batches to avoid overwhelming the API
- Migrates the updated data to the database

#### Usage

```bash
npx ts-node scripts/update-chart-data.ts
```

#### Scheduling

You can schedule this script to run daily using a cron job:

```bash
# Run at 1:00 AM every day
0 1 * * * cd /path/to/DroomMarket && npx ts-node scripts/update-chart-data.ts >> /var/log/chart-update.log 2>&1
```

### Cache to Database Migration (cache-to-db.ts)

This script migrates chart data from Redis cache to the database.

#### Features

- Fetches all chart data from Redis cache
- Formats it for database storage
- Updates existing records or creates new ones
- Tracks migration progress

#### Usage

```bash
npx ts-node scripts/cache-to-db.ts
```

This script is also called automatically by the update-chart-data.ts script.

## Tampermonkey Scripts

### DroomMarket Twitter Feed (x.com.live.js)

This Tampermonkey script replaces the Market Activity section on Binance's trading page with a Twitter feed fetched from DroomMarket's API.

#### Features

- Displays latest tweets from the DroomMarket API
- Shows tweet author, content, likes, and retweets
- Auto-refreshes every minute
- Removes unnecessary Binance branding elements
- Uses base64 encoded images to bypass Content-Security-Policy restrictions

#### Installation

1. Install the Tampermonkey browser extension
2. Create a new script in Tampermonkey
3. Copy the contents of `x.com.live.js` into the script editor
4. Save the script

#### Configuration

You can modify the following variables at the top of the script:

- `API_URL`: The URL to fetch tweets from (defaults to https://droommarket.com/api/tweets)
- `REFRESH_INTERVAL`: How often to refresh tweets in milliseconds (default: 60000 ms = 1 minute)
- `TWEETS_TO_DISPLAY`: Maximum number of tweets to display (default: 10)

#### API Endpoint

The script expects the API to return an array of tweet objects with the following structure:

```json
[
  {
    "text": "Tweet content",
    "created_at": "2023-01-01T12:00:00Z",
    "favorite_count": 42,
    "retweet_count": 10,
    "user": {
      "name": "User Name",
      "screen_name": "username",
      "profile_image_url": "https://example.com/profile.jpg"
    }
  }
]
```