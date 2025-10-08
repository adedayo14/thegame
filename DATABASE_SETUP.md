# Database Setup Instructions

## Setting up Vercel Postgres

1. **Go to your Vercel project dashboard**
   - Visit: https://vercel.com/adedayo14/thegame

2. **Navigate to Storage**
   - Click on the "Storage" tab in your project

3. **Create a Postgres Database**
   - Click "Create Database"
   - Select "Postgres"
   - Choose a region close to your users
   - Click "Create"

4. **Connect to your project**
   - Vercel will automatically add the database environment variables to your project
   - Variables added:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

5. **Deploy**
   - Push your code to GitHub (already done!)
   - Vercel will automatically redeploy with database support
   - The database table will be created automatically on first use

## Features

✅ **Permanent Storage** - Data persists across deployments
✅ **Individual Delete** - Delete specific trial entries
✅ **Bulk Delete** - Clear all entries at once
✅ **Auto-backup** - Vercel Postgres includes automatic backups
✅ **Scalable** - Handles thousands of game entries

## Admin Dashboard

Access: https://thegame-delta.vercel.app/admin
Password: `Eniola`

Features:
- View all game results
- Statistics by privilege group
- Average scores per group
- Delete individual entries (for trials)
- Clear all data
- Real-time data updates

## Trial Testing

1. Run your trials with test usernames (e.g., "test1", "test2")
2. After trials, go to admin dashboard
3. Click "Delete" on individual trial entries
4. Real participant data remains intact

## Database Schema

```sql
game_results table:
- id (primary key, auto-increment)
- username (varchar)
- total_score (integer)
- round_scores (integer array)
- network_privilege (boolean)
- opportunity_privilege (boolean)
- video_game_frequency (varchar)
- timestamp (timestamp)
```
