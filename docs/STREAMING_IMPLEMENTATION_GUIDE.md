# Chunked Video Streaming & Document Management Implementation

## Overview

This guide documents the implementation of chunked video streaming with Range Request support and on-the-fly document decompression for the Elmanassa education platform.

## Backend Implementation

### 1. Media Controller Endpoints

#### Video Streaming (`GET /api/v1/media/stream/{id}`)
- **Authentication**: Required (JWT Bearer token)
- **Features**:
  - HTTP 206 Partial Content responses for Range requests
  - 2MB chunk size by default
  - Supports browser seek bar buffering
  - Automatic token validation via query parameter for `<video>` tags

**Response Headers**:
```
Accept-Ranges: bytes
Content-Range: bytes {start}-{end}/{total}
Content-Length: {chunk-size}
Cache-Control: no-cache
```

#### Document Viewing (`GET /api/v1/media/view/{id}`)
- **Authentication**: Required
- **Features**:
  - On-the-fly GZip decompression
  - Inline display (Content-Disposition: inline)
  - Automatic MIME type detection
  - Supports PDF, Word, Excel, PowerPoint, Text

#### Document Download (`GET /api/v1/media/download/{id}`)
- **Authentication**: Required
- **Features**:
  - On-the-fly GZip decompression
  - Attachment download (Content-Disposition: attachment)
  - Original filename restoration

### 2. MediaService Compression

#### Video Compression
- **Codec**: H.265 (libx265) or H.264 (libx264)
- **Quality**: CRF 18-51 (configurable)
- **Preset**: ultrafast to veryslow (default: medium)
- **Audio**: AAC 128kbps
- **Output**: MP4 with faststart flag for streaming

**FFmpeg ArgumentList Usage**:
```csharp
startInfo.ArgumentList.Add("-i");
startInfo.ArgumentList.Add(inputPath);
startInfo.ArgumentList.Add("-vf");
startInfo.ArgumentList.Add($"scale=-2:{height}");
// ... more arguments
```

**Benefits**:
- No shell injection vulnerabilities
- Automatic escaping for all platforms
- Cleaner code than string concatenation

#### Document Compression
- **Format**: GZip (.gz)
- **Compression Level**: Optimal
- **Decompression**: On-demand via GZipStream

### 3. Security Measures

#### Path Traversal Prevention
```csharp
private bool IsValidFilePath(string basePath, string filePath)
{
    var fullBasePath = Path.GetFullPath(basePath);
    var fullFilePath = Path.GetFullPath(filePath);
    return fullFilePath.StartsWith(fullBasePath, StringComparison.OrdinalIgnoreCase);
}
```

#### File Name Sanitization
```csharp
private string SanitizeFileName(string fileName)
{
    var sanitized = new string(fileName
        .Where(c => !InvalidPathChars.Contains(c))
        .ToArray());
    sanitized = Regex.Replace(sanitized, @"[^\w\s\-\.]", "");
    sanitized = Regex.Replace(sanitized, @"\s+", "_");
    return string.IsNullOrWhiteSpace(sanitized) ? "file" : sanitized;
}
```

#### Token Validation
- JWT tokens passed via query parameter for streaming endpoints
- Configured in `Program.cs` OnMessageReceived event
- Supports both Authorization header and query string

## Frontend Implementation

### 1. MediaGallery Component

**Features**:
- Tabbed interface (Videos / Documents)
- Responsive video player with custom controls
- Document list with file type icons
- Progress tracking and buffering visualization

**Props**:
```typescript
interface MediaGalleryProps {
  lectureId: string;
  lectureTitle?: string;
}
```

### 2. Video Player Controls

**Playback Controls**:
- Play/Pause toggle
- Seek bar with buffering visualization
- Volume control with mute button
- Playback speed (0.5x to 2x)
- Fullscreen toggle

**Keyboard Shortcuts** (HTML5 video):
- Space: Play/Pause
- Arrow keys: Seek
- M: Mute
- F: Fullscreen

### 3. Document Management

**Document Row Features**:
- File type icon with color coding
- File size display
- Compression ratio indicator
- View button (inline display)
- Download button (attachment)

**File Type Icons**:
- PDF: Red (#ef4444)
- Word: Blue (#3b82f6)
- Excel: Green (#22c55e)
- PowerPoint: Orange (#f97316)

### 4. API Client Functions

```typescript
// Get stream URL with token
getStreamUrl(id: string): string

// Get view URL for documents
getViewUrl(id: string): string

// Get download URL
getDownloadUrl(id: string): string

// Stream with progress tracking
getStreamWithProgress(id: string, options?: StreamOptions): Promise<Blob>

// Format utilities
formatFileSize(bytes: number): string
formatDuration(seconds?: number): string
```

## Configuration

### Backend (appsettings.json)

```json
{
  "CompressionSettings": {
    "VideoMaxHeight": 720,
    "VideoCrf": 23,
    "VideoPreset": "medium",
    "VideoCodec": "libx265",
    "CompressDocuments": true
  }
}
```

### Frontend (.env)

```
VITE_API_BASE=http://localhost:5000/api/v1
```

## Usage Examples

### Backend: Upload and Stream

```csharp
// Upload video
POST /api/v1/media/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [video.mp4]
lectureId: {guid}

// Stream with Range request
GET /api/v1/media/stream/{id}?token={token}
Range: bytes=0-2097151

// Response
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-2097151/104857600
Content-Length: 2097152
Accept-Ranges: bytes
```

### Frontend: Play Video

```typescript
import MediaGallery from '@/components/MediaGallery';

export function LecturePage() {
  return (
    <MediaGallery 
      lectureId="lecture-123"
      lectureTitle="Introduction to React"
    />
  );
}
```

## Performance Optimization

### Video Streaming
- **Chunk Size**: 2MB (configurable)
- **Buffering**: Browser handles via Range requests
- **Caching**: Cache-Control: no-cache (prevents stale chunks)
- **Compression**: H.265 reduces file size by 40-50%

### Document Decompression
- **On-demand**: Only decompressed when viewed/downloaded
- **Streaming**: GZipStream prevents memory bloat
- **Compression**: GZip reduces document size by 60-80%

### Frontend
- **Lazy Loading**: React.lazy() for MediaGallery
- **Progress Tracking**: Real-time buffering visualization
- **Responsive**: Adapts to container width

## Troubleshooting

### Video Won't Play
1. Check JWT token validity
2. Verify file exists at FilePath
3. Check FFmpeg compression succeeded
4. Inspect browser console for CORS errors

### Document Won't Decompress
1. Verify CompressionType is "gzipped"
2. Check file isn't corrupted
3. Ensure GZipStream is properly disposed
4. Check file permissions

### Slow Streaming
1. Increase chunk size (2MB default)
2. Check network bandwidth
3. Verify FFmpeg preset (faster = lower quality)
4. Monitor server CPU usage

## Security Checklist

- [x] Path traversal validation on all file operations
- [x] File name sanitization
- [x] JWT token validation before streaming
- [x] ArgumentList for FFmpeg (no shell injection)
- [x] File type validation
- [x] Size limits (500MB max)
- [x] Proper error handling (no path leakage)
- [x] CORS configured for streaming endpoints
- [x] Content-Disposition headers set correctly
- [x] Temp files cleaned up after processing

## Future Enhancements

1. **Adaptive Bitrate Streaming**: Multiple quality levels
2. **Thumbnail Generation**: Video preview images
3. **Subtitle Support**: SRT/VTT subtitle files
4. **Analytics**: Track viewing patterns
5. **Caching**: Redis for frequently accessed files
6. **CDN Integration**: Cloudflare or AWS CloudFront
7. **Watermarking**: Add student watermarks to videos
8. **DRM**: Digital rights management for premium content
