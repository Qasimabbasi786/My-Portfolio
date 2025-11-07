# Database Migration Instructions

## Issue: Display Order Column Missing

The error "Failed to update some developer orders" occurs because the `display_order` column hasn't been added to the `developers` table in your Supabase database yet.

## Solution: Apply the Migration

The migration file already exists at: `supabase/migrations/20251104170000_add_display_order_to_developers.sql`

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire content from `supabase/migrations/20251104170000_add_display_order_to_developers.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

Or manually run:

```bash
supabase db execute -f supabase/migrations/20251104170000_add_display_order_to_developers.sql
```

## What This Migration Does

1. ✅ Adds the `display_order` column to the `developers` table
2. ✅ Sets a default value of 0 for the column
3. ✅ Creates an index for performance optimization
4. ✅ Automatically assigns display_order values to existing developers based on their creation date

## After Running the Migration

Once the migration is applied, the developer reordering functionality in the Admin Panel will work perfectly. The enhanced error logging will also help identify any future database issues.

## Verification

After applying the migration, you should be able to:
- Drag and drop developers in the Admin Panel to reorder them
- See the order persist across page refreshes
- No longer see the "Failed to update some developer orders" error

## Note

The same `display_order` column for the `projects` table was already added in a previous migration (`20251018152658_add_display_order_to_projects.sql`), so project ordering should already be working.
