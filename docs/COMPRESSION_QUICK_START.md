# Compression System - Quick Start Guide

**For**: Developers integrating the compression system  
**Time**: 5 minutes to understand, 30 minutes to deploy

---

## What You Need to Know (30 seconds)

The compression system automatically:
1. **Compresses videos** using FFmpeg H.265 (50-70% smaller)
2. **Compresses documents** using GZip (60-80% smaller)
3. **Tracks statistics** for admin dashboard
4. **Falls back** to original file if compression fails
5. **Prevents attacks** with path traversal and command injection protection

---

## Installation (5 minutes)

### 1. Install FFmpeg

**Windows**:
```powershell
winget install FFmpeg
```

**macOS**:
```bash
brew install ffmpeg
```

**Ubuntu/Debian**:
```bash
sudo apt-get install ffmpeg
```

### 2. Create Uploads Directory

```bash
mkdir -p /var/uploads
chmod 755 /var/uploads
```

### 3. Update Database

```bash
cd elmanassa_backend/elmanassa
dotnet ef migrations add AddMediaFileCompression
dotnet ef database update
```

### 4. Configure Settings

Add to `appsettings.json`:
```json
{
  "CompressionSettings": {
    "VideoCodec": "libx265",
    "VideoCrf": 28,
    "VideoMaxHeight": 720,
    "VideoPreset": "medium",
    "CompressDocuments": true
  }
}
```

---

## API Usage (5 minutes)

### Upload Single File

```bash
curl -X POST http://localhost:5000/api/v1/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@video.mp4" \
  -F "subjectId=550e8400-e29b-41d4-a716-446655440000"
```

**Response**:
```json
{
  "success": true,
  "mediaFile": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "originalFileName": "video.mp4",
    "storedFileName": "video_compressed.mp4",
    "fileType": "video",
    "compressionType": "video_transcoded",
    "originalSize": 1073741824,
    "compressedSize": 322122547,
    "compressionRatio": 70.0,
    "filePath": "/uploads/videos/video_compressed.mp4",
    "duration": 3600,
    "width": 1920,
    "height": 1080,
    "createdAt": "2026-03-25T10:30:00Z"
  }
}
```

### Get Compression Statistics

```bash
curl -X GET http://localhost:5000/api/v1/media/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response**:
```json
{
  "totalFiles": 150,
  "totalOriginalSize": 107374182400,
  "totalCompressedSize": 32212254720,
  "overallCompressionRatio": 70.0,
  "formattedTotalOriginal": "100 GB",
  "formattedTotalCompressed": "30 GB",
  "spaceSaved": 75161927680,
  "formattedSpaceSaved": "70 GB",
  "byFileType": [
    {
      "fileType": "video",
      "count": 100,
      "originalSize": 100000000000,
      "compressedSize": 30000000000,
      "compressionRatio": 70.0
    },
    {
      "fileType": "document",
      "count": 50,
      "originalSize": 7374182400,
      "compressedSize": 2212254720,
      "compressionRatio": 70.0
    }
  ]
}
```

### Download File

```bash
curl -X GET http://localhost:5000/api/v1/media/download/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_file.mp4
```

### Stream Video

```bash
curl -X GET http://localhost:5000/api/v1/media/stream/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Range: bytes=0-1048575"
```

---

## Supported File Types

### Videos (Compressed with FFmpeg H.265)
- MP4, AVI, MOV, MKV, WebM, FLV
- Output: MP4 (H.265 + AAC)
- Typical reduction: 50-70%

### Documents (Compressed with GZip)
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- Output: Original format + .gz
- Typical reduction: 60-80%

---

## Configuration Options

### Video Compression Settings

```json
{
  "CompressionSettings": {
    "VideoCodec": "libx265",           // Codec: libx265 or libx264
    "VideoCrf": 28,                    // Quality: 0-51 (lower = better)
    "VideoMaxHeight": 720,             // Resolution: 480, 720, 1080
    "VideoPreset": "medium",           // Speed: ultrafast, fast, medium, slow
    "CompressDocuments": true          // Enable document compression
  }
}
```

### Preset Recommendations

| Preset | Speed | Quality | Use Case |
|--------|-------|---------|----------|
| ultrafast | 10x | Lower | Real-time streaming |
| fast | 5x | Medium | Quick uploads |
| medium | 1x | Good | Default (balanced) |
| slow | 0.5x | High | Archive/storage |

### CRF Recommendations

| CRF | Quality | File Size | Use Case |
|-----|---------|-----------|----------|
| 18-22 | High | Large | High-quality archive |
| 23-28 | Medium | Medium | Default (balanced) |
| 29-35 | Lower | Small | Low-bandwidth streaming |

---

## Error Handling

### Common Errors

**"FFmpeg not found"**
- Ensure FFmpeg is installed: `ffmpeg -version`
- Check PATH environment variable
- Restart application after installing FFmpeg

**"Invalid file path detected"**
- File path is outside `/uploads` directory
- Check file permissions
- Verify upload directory exists

**"Compression failed, using original file"**
- Check logs for detailed error
- Verify temp directory has write permissions
- Ensure sufficient disk space

**"Unauthorized"**
- Missing or invalid JWT token
- Token expired (refresh required)
- Insufficient permissions (admin required for stats)

---

## Monitoring & Troubleshooting

### Check Compression Status

```bash
# View recent uploads
SELECT * FROM "MediaFiles" 
ORDER BY "CreatedAt" DESC 
LIMIT 10;

# Check compression ratios
SELECT 
  "FileType",
  COUNT(*) as count,
  SUM("OriginalSize") as total_original,
  SUM("CompressedSize") as total_compressed,
  ROUND(100.0 * (1 - SUM("CompressedSize")::float / SUM("OriginalSize")), 2) as ratio
FROM "MediaFiles"
GROUP BY "FileType";

# Find failed compressions
SELECT * FROM "MediaFiles" 
WHERE "CompressionType" = 'none' 
AND "FileType" IN ('video', 'document');
```

### Monitor Disk Usage

```bash
# Check uploads directory size
du -sh /var/uploads

# Check available space
df -h /var/uploads

# Find largest files
find /var/uploads -type f -exec ls -lh {} \; | sort -k5 -hr | head -20
```

### View Application Logs

```bash
# Real-time logs
tail -f /var/log/elmanassa/app.log

# Filter compression logs
grep "Compression" /var/log/elmanassa/app.log

# Filter errors
grep "ERROR" /var/log/elmanassa/app.log
```

---

## Performance Tips

### Optimize for Speed
```json
{
  "VideoCodec": "libx265",
  "VideoCrf": 32,
  "VideoMaxHeight": 480,
  "VideoPreset": "fast"
}
```

### Optimize for Quality
```json
{
  "VideoCodec": "libx265",
  "VideoCrf": 22,
  "VideoMaxHeight": 1080,
  "VideoPreset": "slow"
}
```

### Optimize for Balance (Default)
```json
{
  "VideoCodec": "libx265",
  "VideoCrf": 28,
  "VideoMaxHeight": 720,
  "VideoPreset": "medium"
}
```

---

## Testing

### Test Upload

```bash
# Create test video (10 seconds)
ffmpeg -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 \
  -f lavfi -i sine=frequency=1000:duration=10 \
  -pix_fmt yuv420p test_video.mp4

# Upload
curl -X POST http://localhost:5000/api/v1/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_video.mp4" \
  -F "subjectId=550e8400-e29b-41d4-a716-446655440000"
```

### Test Document

```bash
# Create test PDF
echo "Test Document" | enscript -B -p - | ps2pdf - test_doc.pdf

# Upload
curl -X POST http://localhost:5000/api/v1/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_doc.pdf" \
  -F "subjectId=550e8400-e29b-41d4-a716-446655440000"
```

### Test Stats Endpoint

```bash
curl -X GET http://localhost:5000/api/v1/media/stats \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  | jq .
```

---

## Next Steps

1. **Read Full Documentation**: See `COMPRESSION_SYSTEM_GUIDE.md`
2. **Review Implementation**: Check `COMPRESSION_IMPLEMENTATION_CHECKLIST.md`
3. **Deploy to Production**: Follow `COMPRESSION_MIGRATION_REFERENCE.md`
4. **Monitor Performance**: Use queries in `COMPRESSION_QUICK_REFERENCE.md`

---

## Support

For issues or questions:
1. Check logs: `/var/log/elmanassa/app.log`
2. Review troubleshooting: `COMPRESSION_QUICK_REFERENCE.md`
3. Check database: Use monitoring queries above
4. Contact: Backend team

---

## Summary

✅ Install FFmpeg  
✅ Create uploads directory  
✅ Run database migrations  
✅ Configure settings  
✅ Test with sample files  
✅ Monitor compression stats  

**You're ready to go!**
