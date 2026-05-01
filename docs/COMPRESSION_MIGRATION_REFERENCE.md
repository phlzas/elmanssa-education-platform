# Compression System - Database Migration Reference

## EF Core Migration Command

```bash
cd elmanassa_backend/elmanassa
dotnet ef migrations add AddMediaFileCompressionEnhancements
dotnet ef database update
```

## Generated Migration (Expected Structure)

The migration will create/update the `MediaFiles` table with the following structure:

```sql
CREATE TABLE IF NOT EXISTS "MediaFiles" (
    "Id" uuid NOT NULL,
    "OriginalFileName" character varying(500) NOT NULL,
    "StoredFileName" character varying(255) NOT NULL,
    "FileType" character varying(50) NOT NULL,
    "CompressionType" character varying(50) NOT NULL,
    "OriginalSize" bigint NOT NULL,
    "CompressedSize" bigint NOT NULL,
    "FilePath" character varying(1000) NOT NULL,
    "ThumbnailPath" character varying(255),
    "Duration" integer,
    "Width" integer,
    "Height" integer,
    "SubjectId" uuid,
    "LectureId" uuid,
    "CreatedAt" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_MediaFiles" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_MediaFiles_Lectures_LectureId" FOREIGN KEY ("LectureId") 
        REFERENCES "Lectures" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_MediaFiles_Subjects_SubjectId" FOREIGN KEY ("SubjectId") 
        REFERENCES "Subjects" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_MediaFiles_LectureId" ON "MediaFiles" ("LectureId");
CREATE INDEX "IX_MediaFiles_SubjectId" ON "MediaFiles" ("SubjectId");
```

## Manual Migration (If Needed)

If you need to apply the migration manually:

```sql
-- Create MediaFiles table
CREATE TABLE IF NOT EXISTS "MediaFiles" (
    "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "OriginalFileName" varchar(500) NOT NULL,
    "StoredFileName" varchar(255) NOT NULL,
    "FileType" varchar(50) NOT NULL,
    "CompressionType" varchar(50) NOT NULL,
    "OriginalSize" bigint NOT NULL,
    "CompressedSize" bigint NOT NULL,
    "FilePath" varchar(1000) NOT NULL,
    "ThumbnailPath" varchar(255),
    "Duration" integer,
    "Width" integer,
    "Height" integer,
    "SubjectId" uuid REFERENCES "Subjects"("Id") ON DELETE CASCADE,
    "LectureId" uuid REFERENCES "Lectures"("Id") ON DELETE CASCADE,
    "CreatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_mediafiles_subject ON "MediaFiles"("SubjectId");
CREATE INDEX idx_mediafiles_lecture ON "MediaFiles"("LectureId");
CREATE INDEX idx_mediafiles_created ON "MediaFiles"("CreatedAt");
CREATE INDEX idx_mediafiles_type ON "MediaFiles"("FileType");
```

## Verification Queries

### Verify Table Structure
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'MediaFiles'
ORDER BY ordinal_position;
```

### Verify Indexes
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'MediaFiles';
```

### Verify Foreign Keys
```sql
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name = 'MediaFiles';
```

### Check Table Size
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename = 'MediaFiles';
```

## Rollback Procedure

If you need to rollback the migration:

```bash
# List all migrations
dotnet ef migrations list

# Rollback to previous migration
dotnet ef database update <PreviousMigrationName>

# Remove the migration
dotnet ef migrations remove
```

## Data Migration (If Upgrading Existing System)

If you're upgrading an existing system with files already stored:

```sql
-- Populate existing files (if any)
-- This is a template - adjust based on your existing data structure

INSERT INTO "MediaFiles" (
    "Id",
    "OriginalFileName",
    "StoredFileName",
    "FileType",
    "CompressionType",
    "OriginalSize",
    "CompressedSize",
    "FilePath",
    "CreatedAt"
)
SELECT
    gen_random_uuid(),
    'existing_file.mp4',
    'existing_file.mp4',
    'video',
    'none',
    0,
    0,
    '/uploads/videos/existing_file.mp4',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "MediaFiles" WHERE "FilePath" = '/uploads/videos/existing_file.mp4'
);
```

## Performance Optimization

### Add Composite Indexes for Common Queries
```sql
-- For queries filtering by subject and creation date
CREATE INDEX idx_mediafiles_subject_created 
ON "MediaFiles"("SubjectId", "CreatedAt" DESC);

-- For queries filtering by lecture and creation date
CREATE INDEX idx_mediafiles_lecture_created 
ON "MediaFiles"("LectureId", "CreatedAt" DESC);

-- For compression statistics queries
CREATE INDEX idx_mediafiles_filetype_created 
ON "MediaFiles"("FileType", "CreatedAt" DESC);
```

### Analyze Query Performance
```sql
-- Enable query analysis
EXPLAIN ANALYZE
SELECT * FROM "MediaFiles"
WHERE "SubjectId" = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY "CreatedAt" DESC;
```

## Backup Before Migration

```bash
# Backup database
pg_dump elmanassa > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz /uploads
```

## Post-Migration Verification

```bash
# Connect to database
psql -U postgres -d elmanassa

# Run verification queries
SELECT COUNT(*) as total_files FROM "MediaFiles";
SELECT file_type, COUNT(*) FROM "MediaFiles" GROUP BY file_type;
SELECT 
    SUM(original_size) as total_original,
    SUM(compressed_size) as total_compressed
FROM "MediaFiles";
```

## Troubleshooting Migration Issues

### Issue: Migration Fails with "Table Already Exists"
```bash
# Check if table exists
psql -U postgres -d elmanassa -c "\dt MediaFiles"

# If it exists, you may need to:
# 1. Drop the table (backup first!)
# 2. Re-run the migration
```

### Issue: Foreign Key Constraint Fails
```sql
-- Check if referenced tables exist
SELECT * FROM "Subjects" LIMIT 1;
SELECT * FROM "Lectures" LIMIT 1;

-- If they don't exist, create them first
-- Then re-run the migration
```

### Issue: Migration Timeout
```bash
# Increase timeout in appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;CommandTimeout=300;"
  }
}

# Then re-run migration
dotnet ef database update
```

## Migration Verification Checklist

- [ ] Table `MediaFiles` created successfully
- [ ] All columns present with correct data types
- [ ] Foreign keys to `Subjects` and `Lectures` created
- [ ] Indexes created for performance
- [ ] No data loss from existing records
- [ ] Application can connect to database
- [ ] API endpoints working correctly
- [ ] File uploads working end-to-end

## Rollback Checklist

- [ ] Database backup created
- [ ] Uploads directory backup created
- [ ] Previous migration identified
- [ ] Rollback command tested in development
- [ ] Rollback procedure documented
- [ ] Team notified of rollback plan

## Notes

```
[Space for migration notes and issues encountered]
```

## Related Documentation

- See `COMPRESSION_SYSTEM_GUIDE.md` for complete system documentation
- See `COMPRESSION_IMPLEMENTATION_CHECKLIST.md` for deployment steps
- See `COMPRESSION_QUICK_REFERENCE.md` for quick reference
