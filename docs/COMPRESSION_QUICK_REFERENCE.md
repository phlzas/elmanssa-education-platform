# Compression System - Quick Reference

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/media/upload` | teacher, admin | Upload single file |
| POST | `/api/v1/media/upload/batch` | teacher, admin | Upload multiple files |
| GET | `/api/v1/media/{id}` | public | Get file metadata |
| GET | `/api/v1/media/subject/{subjectId}` | public | List files by subject |
| GET | `/api/v1/media/lecture/{lectureId}` | public | List files by lecture |
| GET | `/api/v1/media/download/{id}` | public | Download file |
| GET | `/api/v1/media/stream/{id}` | public | Stream video |
| DELETE | `/api/v1/media/{id}` | teacher, admin | Delete file |
| GET | `/api/v1/media/stats` | admin | Compression statistics |

## Compression Settings

```csharp
// Default settings
var settings = new CompressionSettingsDto
{
    VideoCodec = "libx265",        // H.265 codec
    VideoCrf = 28,                 // Quality (18-51, lower=better)
    VideoMaxHeight = 720,          // Resolution
    VideoPreset = "medium",        // Speed (ultrafast-veryslow)
    CompressDocuments = true       // Enable document compression
};

// High quality (larger files)
settings.VideoCrf = 24;            // Better quality
settings.VideoPreset = "slow";     // Slower, better compression

// Fast compression (smaller files)
settings.VideoCrf = 32;            // Lower quality
settings.VideoPreset = "fast";     // Faster processing
```

## File Size Limits

- **Single file**: 500 MB
- **Batch upload**: 1 GB total
- **Temp file**: 5 GB

## Supported File Types

### Videos
- MP4, AVI, MOV, MKV, WebM, FLV
- Output: MP4 (H.265 + AAC)

### Documents
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- Output: Original format + .gz

## Typical Compression Ratios

| File Type | Ratio | Time (per GB) |
|-----------|-------|---------------|
| Video (H.265) | 50-70% | 1-5 min |
| Document (GZip) | 60-80% | <1 sec |

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `NO_FILE` | No file provided | Provide a file |
| `FILE_TOO_LARGE` | Exceeds size limit | Use smaller file |
| `UNSUPPORTED_FILE_TYPE` | Invalid file type | Use supported format |
| `UPLOAD_FAILED` | General upload error | Check logs |
| `STATS_ERROR` | Stats retrieval failed | Check database |

## Common Issues & Solutions

### FFmpeg Not Found
```bash
# Install FFmpeg
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Linux
winget install FFmpeg        # Windows

# Verify
ffmpeg -version
```

### Compression Timeout
```csharp
// Increase timeout in CompressVideoAsync()
process.WaitForExitAsync(timeout: TimeSpan.FromMinutes(10));

// Or use faster preset
settings.VideoPreset = "fast";
```

### Disk Space Issues
```bash
# Check usage
du -sh /uploads

# Clean old files
find /uploads -type f -mtime +90 -delete
```

### Permission Denied
```bash
# Fix permissions
chmod 755 /uploads
chmod 755 /uploads/videos
chmod 755 /uploads/documents
```

## Monitoring Commands

```bash
# Watch compression logs
tail -f /var/log/elmanassa/app.log | grep -i "compress"

# Monitor disk usage
watch -n 5 'du -sh /uploads'

# Check FFmpeg process
ps aux | grep ffmpeg

# Monitor CPU/Memory
top -p $(pgrep -f "dotnet")
```

## Database Queries

```sql
-- Total compression stats
SELECT 
    COUNT(*) as total_files,
    SUM(original_size) as total_original,
    SUM(compressed_size) as total_compressed,
    ROUND(100.0 * (1 - SUM(compressed_size)::float / SUM(original_size)), 2) as compression_ratio
FROM "MediaFiles";

-- By file type
SELECT 
    file_type,
    COUNT(*) as count,
    SUM(original_size) as original_size,
    SUM(compressed_size) as compressed_size,
    ROUND(100.0 * (1 - SUM(compressed_size)::float / SUM(original_size)), 2) as ratio
FROM "MediaFiles"
GROUP BY file_type;

-- Recent uploads
SELECT 
    id, original_file_name, compression_type, 
    original_size, compressed_size, created_at
FROM "MediaFiles"
ORDER BY created_at DESC
LIMIT 10;

-- Failed compressions (fallback to original)
SELECT 
    id, original_file_name, file_type, created_at
FROM "MediaFiles"
WHERE compression_type = 'none'
ORDER BY created_at DESC;
```

## Testing with cURL

```bash
# Upload single file
curl -X POST http://localhost:5000/api/v1/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@video.mp4" \
  -F "subjectId=00000000-0000-0000-0000-000000000000"

# Upload batch
curl -X POST http://localhost:5000/api/v1/media/upload/batch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@video1.mp4" \
  -F "files=@document.pdf"

# Get stats
curl -X GET http://localhost:5000/api/v1/media/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Download file
curl -X GET http://localhost:5000/api/v1/media/download/{id} \
  -o downloaded_file

# Stream video with range
curl -X GET http://localhost:5000/api/v1/media/stream/{id} \
  -H "Range: bytes=0-1024" \
  -o chunk.mp4
```

## Performance Tuning

### For Speed
```csharp
settings.VideoPreset = "ultrafast";  // Fastest
settings.VideoCrf = 32;              // Lower quality
settings.VideoMaxHeight = 480;       // Lower resolution
```

### For Quality
```csharp
settings.VideoPreset = "slow";       // Slower, better compression
settings.VideoCrf = 24;              // Higher quality
settings.VideoMaxHeight = 1080;      // Higher resolution
```

### For Balance (Recommended)
```csharp
settings.VideoPreset = "medium";     // Default
settings.VideoCrf = 28;              // Default
settings.VideoMaxHeight = 720;       // Default
```

## Logging Levels

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "elmanassa.Services.MediaService": "Information",
      "elmanassa.Controllers.MediaController": "Information"
    }
  }
}
```

## Environment Variables

```bash
# Optional: Custom upload path
UPLOAD_PATH=/mnt/storage/uploads

# Optional: FFmpeg path
FFMPEG_PATH=/usr/local/bin/ffmpeg

# Optional: Temp directory
TEMP=/mnt/temp
```

## Backup & Recovery

```bash
# Backup database
pg_dump elmanassa > backup.sql

# Backup uploads
tar -czf uploads_backup.tar.gz /uploads

# Restore database
psql elmanassa < backup.sql

# Restore uploads
tar -xzf uploads_backup.tar.gz -C /
```

## Security Checklist

- [ ] FFmpeg installed and verified
- [ ] `/uploads` directory has correct permissions
- [ ] File size limits configured
- [ ] File type validation enabled
- [ ] Path traversal prevention active
- [ ] Command injection prevention active
- [ ] Temp files cleaned up
- [ ] Logs monitored for errors
- [ ] Disk space monitored
- [ ] Backups scheduled

## Performance Benchmarks

| Operation | Time | CPU | Memory |
|-----------|------|-----|--------|
| 100MB video (medium preset) | 2-3 min | 80-90% | 500MB |
| 50MB document | <1 sec | 10% | 50MB |
| Batch 10 files | 5-10 min | 60-80% | 1GB |
| Get stats (1000 files) | <100ms | 5% | 10MB |

## Useful Links

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [H.265 Codec Guide](https://en.wikipedia.org/wiki/High_Efficiency_Video_Coding)
- [ASP.NET Core File Upload](https://docs.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)
