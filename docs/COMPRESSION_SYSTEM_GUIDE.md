# Compression-Focused File Upload & Storage System

## Overview

This document describes the enhanced compression-focused file upload and storage system for Elmanassa. The system automatically compresses videos and documents before storage, significantly reducing disk space usage while maintaining quality.

## Architecture

### Components

1. **MediaService** - Core compression and storage logic
2. **MediaController** - REST API endpoints for file operations
3. **MediaFile Model** - Database entity for file metadata
4. **CompressionSettingsDto** - Configurable compression parameters

### Data Flow

```
User Upload
    ↓
MediaController.UploadFile()
    ↓
MediaService.UploadAndCompressAsync()
    ├─ Save to temp file
    ├─ Detect file type (video/document)
    ├─ Compress (FFmpeg for video, GZip for documents)
    ├─ Extract metadata (video duration, resolution)
    ├─ Save to /uploads/{type}/
    └─ Store metadata in PostgreSQL
    ↓
Return MediaFileDto with compression stats
```

## Features

### Video Compression

**Technology**: FFmpeg with H.265 (HEVC) codec

**Default Settings**:
- Codec: `libx265` (H.265)
- Quality (CRF): `28` (0-51 scale, lower = better quality)
- Max Height: `720p` (configurable)
- Preset: `medium` (ultrafast → veryslow)
- Audio: AAC 128kbps
- Typical Reduction: **50-70%** disk space savings

**Supported Input Formats**:
- MP4, AVI, MOV, MKV, WebM, FLV

**Output Format**: MP4 (H.265 + AAC)

### Document Compression

**Technology**: GZip compression (System.IO.Compression)

**Supported Formats**:
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT

**Compression Level**: Optimal (best compression ratio)

**Typical Reduction**: **60-80%** disk space savings

### Security Features

1. **Path Traversal Prevention**
   - All file paths validated against upload directory
   - Prevents `../` directory escape attacks
   - Uses `Path.GetFullPath()` for normalization

2. **Command Injection Prevention**
   - FFmpeg arguments properly escaped
   - Platform-specific escaping (Windows vs Unix)
   - No shell execution (`UseShellExecute = false`)

3. **File Name Sanitization**
   - Removes invalid path characters
   - Strips special characters that could cause injection
   - Replaces spaces with underscores
   - Generates GUID-based storage names

4. **File Validation**
   - Content-type verification
   - File extension validation
   - File size limits (500MB per file, 1GB batch)
   - Temp file cleanup on failure

## API Endpoints

### Upload Single File

```http
POST /api/v1/media/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Parameters:
- file: IFormFile (required)
- subjectId: Guid? (optional)
- lectureId: Guid? (optional)

Response:
{
  "success": true,
  "data": {
    "id": "guid",
    "originalFileName": "lecture.mp4",
    "storedFileName": "guid.mp4",
    "fileType": "video",
    "compressionType": "video_transcoded",
    "originalSize": 500000000,
    "compressedSize": 150000000,
    "compressionRatio": 70.0,
    "duration": 3600,
    "width": 1920,
    "height": 1080,
    "createdAt": "2024-03-25T10:30:00Z"
  }
}
```

### Upload Batch Files

```http
POST /api/v1/media/upload/batch
Authorization: Bearer {token}
Content-Type: multipart/form-data

Parameters:
- files: List<IFormFile> (required)
- subjectId: Guid? (optional)
- lectureId: Guid? (optional)

Response:
{
  "success": true,
  "data": [
    { /* MediaUploadResultDto */ },
    { /* MediaUploadResultDto */ }
  ]
}
```

### Get Compression Statistics

```http
GET /api/v1/media/stats
Authorization: Bearer {token}
Roles: admin

Response:
{
  "success": true,
  "data": {
    "totalFiles": 150,
    "totalOriginalSize": 5000000000,
    "totalCompressedSize": 1500000000,
    "overallCompressionRatio": 70.0,
    "formattedTotalOriginal": "4.66 GB",
    "formattedTotalCompressed": "1.40 GB",
    "spaceSaved": 3500000000,
    "formattedSpaceSaved": "3.26 GB",
    "byFileType": [
      {
        "fileType": "video",
        "count": 100,
        "originalSize": 4000000000,
        "compressedSize": 1000000000,
        "compressionRatio": 75.0
      },
      {
        "fileType": "document",
        "count": 50,
        "originalSize": 1000000000,
        "compressedSize": 500000000,
        "compressionRatio": 50.0
      }
    ]
  }
}
```

### Get Media File

```http
GET /api/v1/media/{id}
Response: MediaFileDto
```

### Get Media by Subject

```http
GET /api/v1/media/subject/{subjectId}
Response: List<MediaFileDto>
```

### Get Media by Lecture

```http
GET /api/v1/media/lecture/{lectureId}
Response: List<MediaFileDto>
```

### Download File

```http
GET /api/v1/media/download/{id}
Response: File download (original filename)
```

### Stream Video

```http
GET /api/v1/media/stream/{id}
Headers: Range: bytes=0-1024 (optional, for HTTP range requests)
Response: Video stream with range support
```

### Delete Media File

```http
DELETE /api/v1/media/{id}
Authorization: Bearer {token}
Roles: admin, teacher
```

## Database Schema

### MediaFile Table

```sql
CREATE TABLE "MediaFiles" (
    "Id" uuid PRIMARY KEY,
    "OriginalFileName" varchar(500) NOT NULL,
    "StoredFileName" varchar(255) NOT NULL,
    "FileType" varchar(50) NOT NULL,
    "CompressionType" varchar(50) NOT NULL,
    "OriginalSize" bigint NOT NULL,
    "CompressedSize" bigint NOT NULL,
    "FilePath" varchar(1000) NOT NULL,
    "ThumbnailPath" varchar(255),
    "Duration" int,
    "Width" int,
    "Height" int,
    "SubjectId" uuid FOREIGN KEY,
    "LectureId" uuid FOREIGN KEY,
    "CreatedAt" timestamp NOT NULL
);
```

### Relationships

- **MediaFile → Subject**: Optional (nullable FK)
- **MediaFile → Lecture**: Optional (nullable FK)
- **Cascade Delete**: When Subject/Lecture deleted, associated MediaFiles are deleted

## Configuration

### Compression Settings (Customizable)

```csharp
var settings = new CompressionSettingsDto
{
    VideoCodec = "libx265",           // libx265 or libx264
    VideoCrf = 28,                    // 18-51 (lower = better quality)
    VideoMaxHeight = 720,             // 360-2160
    VideoPreset = "medium",           // ultrafast to veryslow
    CompressDocuments = true          // Enable/disable document compression
};

var result = await mediaService.UploadAndCompressAsync(
    stream, fileName, fileSize, contentType,
    subjectId, lectureId, settings);
```

### FFmpeg Installation

**Windows**:
```powershell
winget install FFmpeg
# or download from https://ffmpeg.org/download.html
```

**macOS**:
```bash
brew install ffmpeg
```

**Linux**:
```bash
sudo apt-get install ffmpeg
```

**Docker**:
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
RUN apt-get update && apt-get install -y ffmpeg
```

## File Organization

```
/uploads/
├── videos/
│   ├── {guid}.mp4
│   ├── {guid}.mp4
│   └── ...
├── documents/
│   ├── {guid}.pdf.gz
│   ├── {guid}.docx.gz
│   └── ...
└── others/
    └── ...
```

## Error Handling

### Compression Failures

If compression fails, the system automatically:
1. Logs the error with details
2. Falls back to storing the original file
3. Sets `compressionType = "none"`
4. Returns success with original file metadata

### Temp File Cleanup

- Temp files are always deleted in the `finally` block
- Failed compression outputs are cleaned up
- Orphaned files are logged for manual cleanup

### Validation Errors

```json
{
  "success": false,
  "error": "حجم الملف يتجاوز الحد المسموح",
  "errorCode": "FILE_TOO_LARGE"
}
```

## Performance Considerations

### Video Compression

- **Processing Time**: 1-5 minutes per 1GB (depends on preset)
- **CPU Usage**: High (use `medium` preset for balance)
- **Memory**: ~500MB-1GB per concurrent compression
- **Recommendation**: Use background job queue for large files

### Document Compression

- **Processing Time**: <1 second per 100MB
- **CPU Usage**: Low
- **Memory**: Minimal
- **Recommendation**: Synchronous processing is fine

### Optimization Tips

1. **Use `fast` preset** for real-time uploads (slightly larger files)
2. **Use `slow` preset** for batch processing (smaller files)
3. **Reduce CRF** (e.g., 24) for higher quality (larger files)
4. **Increase CRF** (e.g., 32) for smaller files (lower quality)
5. **Implement background job queue** for large batches

## Monitoring & Logging

### Log Levels

- **Information**: Successful uploads, compression stats
- **Warning**: Compression failures, fallback to original
- **Error**: System errors, FFmpeg failures

### Example Logs

```
[INFO] File uploaded successfully: lecture.mp4 | Original: 500000000B | Compressed: 150000000B | Ratio: 70%
[WARN] Video compression failed, storing original: FFmpeg error message
[ERROR] Error uploading and compressing file: lecture.mp4
```

## Troubleshooting

### FFmpeg Not Found

**Error**: `FFmpeg not found in system PATH`

**Solution**:
1. Install FFmpeg
2. Add to system PATH
3. Restart application

### Compression Timeout

**Error**: `Process did not exit within timeout`

**Solution**:
1. Increase timeout in `CompressVideoAsync()`
2. Use faster preset
3. Reduce video resolution

### Disk Space Issues

**Error**: `Not enough space to store compressed file`

**Solution**:
1. Check `/uploads` directory size
2. Implement cleanup policy for old files
3. Use external storage (S3, Azure Blob)

### Permission Denied

**Error**: `Access to path denied`

**Solution**:
1. Check `/uploads` directory permissions
2. Ensure app pool identity has write access
3. Check temp directory permissions

## Best Practices

1. **Always validate file types** before processing
2. **Set reasonable file size limits** (500MB recommended)
3. **Monitor disk space** and implement cleanup policies
4. **Use background jobs** for large file batches
5. **Test FFmpeg installation** before deployment
6. **Log all compression operations** for auditing
7. **Implement retry logic** for transient failures
8. **Use CDN** for video delivery to reduce bandwidth

## Future Enhancements

1. **Thumbnail Generation**: Auto-generate video thumbnails
2. **Adaptive Bitrate**: Multiple quality versions for streaming
3. **Async Processing**: Background job queue (Hangfire/Quartz)
3. **Cloud Storage**: S3/Azure Blob integration
4. **Transcoding Profiles**: Preset compression profiles
5. **Progress Tracking**: WebSocket updates during compression
6. **Batch Optimization**: Parallel compression with resource limits

## References

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [H.265 Codec Guide](https://en.wikipedia.org/wiki/High_Efficiency_Video_Coding)
- [GZip Compression](https://en.wikipedia.org/wiki/Gzip)
- [ASP.NET Core File Upload](https://docs.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads)
