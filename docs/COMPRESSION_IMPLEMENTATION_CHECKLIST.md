# Compression System Implementation Checklist

## Pre-Deployment Setup

### 1. FFmpeg Installation

- [ ] **Windows Development**
  ```powershell
  winget install FFmpeg
  # Verify: ffmpeg -version
  ```

- [ ] **macOS Development**
  ```bash
  brew install ffmpeg
  # Verify: ffmpeg -version
  ```

- [ ] **Linux Development**
  ```bash
  sudo apt-get update && apt-get install -y ffmpeg
  # Verify: ffmpeg -version
  ```

- [ ] **Docker Production**
  ```dockerfile
  FROM mcr.microsoft.com/dotnet/aspnet:8.0
  RUN apt-get update && apt-get install -y ffmpeg
  ```

- [ ] **Verify ffprobe is available**
  ```bash
  ffprobe -version
  ```

### 2. Database Migration

- [ ] Create EF Core migration
  ```bash
  cd elmanassa_backend/elmanassa
  dotnet ef migrations add AddMediaFileCompressionEnhancements
  ```

- [ ] Review migration file for correctness

- [ ] Apply migration to development database
  ```bash
  dotnet ef database update
  ```

- [ ] Verify MediaFile table structure in PostgreSQL
  ```sql
  SELECT * FROM "MediaFiles" LIMIT 1;
  ```

### 3. File System Setup

- [ ] Create `/uploads` directory structure
  ```bash
  mkdir -p uploads/videos
  mkdir -p uploads/documents
  mkdir -p uploads/others
  ```

- [ ] Set appropriate permissions
  ```bash
  # Linux/macOS
  chmod 755 uploads
  chmod 755 uploads/videos
  chmod 755 uploads/documents
  chmod 755 uploads/others
  
  # Windows: Ensure app pool identity has write access
  ```

- [ ] Verify temp directory is writable
  ```bash
  # Linux/macOS
  ls -la /tmp
  
  # Windows
  echo %TEMP%
  ```

### 4. Code Updates

- [ ] Update `MediaService.cs` with enhanced security
  - [ ] Path traversal validation
  - [ ] Command injection prevention
  - [ ] File name sanitization
  - [ ] Compression stats method

- [ ] Update `MediaFileDto.cs` with new DTOs
  - [ ] `CompressionStatsDto`
  - [ ] `FileTypeStatsDto`

- [ ] Update `MediaController.cs`
  - [ ] Add `/stats` endpoint
  - [ ] Verify all endpoints have proper authorization

- [ ] Verify `Program.cs` has `IMediaService` registered
  ```csharp
  builder.Services.AddScoped<IMediaService, MediaService>();
  ```

### 5. Configuration

- [ ] Review `appsettings.json`
  ```json
  {
    "Logging": {
      "LogLevel": {
        "elmanassa.Services.MediaService": "Information"
      }
    }
  }
  ```

- [ ] Set appropriate request size limits in `Program.cs`
  ```csharp
  builder.Services.Configure<FormOptions>(options =>
  {
      options.MultipartBodyLengthLimit = 524288000; // 500MB
  });
  ```

## Testing

### 6. Unit Tests

- [ ] Test video compression
  ```csharp
  [Test]
  public async Task UploadAndCompressAsync_WithValidVideo_CompressesSuccessfully()
  {
      // Arrange
      var videoStream = new MemoryStream(/* test video bytes */);
      
      // Act
      var result = await _mediaService.UploadAndCompressAsync(
          videoStream, "test.mp4", videoStream.Length, "video/mp4");
      
      // Assert
      Assert.IsTrue(result.Success);
      Assert.IsNotNull(result.MediaFile);
      Assert.AreEqual("video_transcoded", result.MediaFile.CompressionType);
  }
  ```

- [ ] Test document compression
  ```csharp
  [Test]
  public async Task UploadAndCompressAsync_WithPDF_CompressesSuccessfully()
  {
      // Arrange
      var pdfStream = new MemoryStream(/* test PDF bytes */);
      
      // Act
      var result = await _mediaService.UploadAndCompressAsync(
          pdfStream, "test.pdf", pdfStream.Length, "application/pdf");
      
      // Assert
      Assert.IsTrue(result.Success);
      Assert.AreEqual("gzipped", result.MediaFile.CompressionType);
  }
  ```

- [ ] Test path traversal prevention
  ```csharp
  [Test]
  public void IsValidFilePath_WithTraversalAttempt_ReturnsFalse()
  {
      // Arrange
      var basePath = "/uploads";
      var maliciousPath = "/uploads/../../../etc/passwd";
      
      // Act
      var result = _mediaService.IsValidFilePath(basePath, maliciousPath);
      
      // Assert
      Assert.IsFalse(result);
  }
  ```

- [ ] Test file name sanitization
  ```csharp
  [Test]
  public void SanitizeFileName_WithSpecialCharacters_RemovesThemSafely()
  {
      // Arrange
      var fileName = "test<script>.mp4";
      
      // Act
      var result = _mediaService.SanitizeFileName(fileName);
      
      // Assert
      Assert.IsFalse(result.Contains("<"));
      Assert.IsFalse(result.Contains(">"));
  }
  ```

### 7. Integration Tests

- [ ] Test single file upload endpoint
  ```bash
  curl -X POST http://localhost:5000/api/v1/media/upload \
    -H "Authorization: Bearer {token}" \
    -F "file=@test.mp4"
  ```

- [ ] Test batch upload endpoint
  ```bash
  curl -X POST http://localhost:5000/api/v1/media/upload/batch \
    -H "Authorization: Bearer {token}" \
    -F "files=@test1.mp4" \
    -F "files=@test2.pdf"
  ```

- [ ] Test compression stats endpoint
  ```bash
  curl -X GET http://localhost:5000/api/v1/media/stats \
    -H "Authorization: Bearer {admin-token}"
  ```

- [ ] Test file download
  ```bash
  curl -X GET http://localhost:5000/api/v1/media/download/{id} \
    -o downloaded_file
  ```

- [ ] Test video streaming with range requests
  ```bash
  curl -X GET http://localhost:5000/api/v1/media/stream/{id} \
    -H "Range: bytes=0-1024" \
    -o video_chunk.mp4
  ```

### 8. Performance Tests

- [ ] Test 100MB video compression
  - [ ] Measure compression time
  - [ ] Verify compression ratio (target: 50-70%)
  - [ ] Check memory usage

- [ ] Test 50MB document compression
  - [ ] Measure compression time (target: <1 second)
  - [ ] Verify compression ratio (target: 60-80%)

- [ ] Test batch upload with 10 files
  - [ ] Verify all files compress successfully
  - [ ] Check database entries are created

- [ ] Test concurrent uploads
  - [ ] Upload 5 files simultaneously
  - [ ] Verify no file corruption
  - [ ] Check resource usage

### 9. Security Tests

- [ ] Test file type validation
  - [ ] Attempt to upload .exe as .mp4
  - [ ] Verify rejection

- [ ] Test file size limits
  - [ ] Attempt to upload 600MB file (limit: 500MB)
  - [ ] Verify rejection

- [ ] Test authorization
  - [ ] Attempt upload without token
  - [ ] Attempt upload as student (not teacher/admin)
  - [ ] Verify 401/403 responses

- [ ] Test path traversal
  - [ ] Attempt filename: `../../../etc/passwd`
  - [ ] Verify safe storage

- [ ] Test command injection
  - [ ] Attempt filename with shell metacharacters
  - [ ] Verify safe handling

## Deployment

### 10. Staging Environment

- [ ] Deploy code changes to staging
  ```bash
  dotnet publish -c Release
  ```

- [ ] Run database migrations on staging
  ```bash
  dotnet ef database update --environment Staging
  ```

- [ ] Verify FFmpeg is installed on staging server
  ```bash
  ssh staging-server "ffmpeg -version"
  ```

- [ ] Test all endpoints on staging
  - [ ] Upload single file
  - [ ] Upload batch files
  - [ ] Download file
  - [ ] Stream video
  - [ ] Get compression stats

- [ ] Monitor logs for errors
  ```bash
  tail -f /var/log/elmanassa/app.log
  ```

- [ ] Verify disk usage
  ```bash
  du -sh /uploads
  ```

### 11. Production Environment

- [ ] Create backup of production database
  ```bash
  pg_dump elmanassa > backup_$(date +%Y%m%d).sql
  ```

- [ ] Create backup of production uploads
  ```bash
  tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /uploads
  ```

- [ ] Deploy code to production
  ```bash
  dotnet publish -c Release
  ```

- [ ] Run database migrations on production
  ```bash
  dotnet ef database update --environment Production
  ```

- [ ] Verify FFmpeg on production
  ```bash
  ffmpeg -version
  ffprobe -version
  ```

- [ ] Test critical endpoints
  - [ ] Upload file
  - [ ] Download file
  - [ ] Stream video

- [ ] Monitor application logs
  ```bash
  tail -f /var/log/elmanassa/app.log | grep -i "error\|warning"
  ```

- [ ] Monitor disk usage
  ```bash
  df -h /uploads
  ```

- [ ] Monitor CPU/Memory during uploads
  ```bash
  top -p $(pgrep -f "dotnet")
  ```

## Post-Deployment

### 12. Monitoring & Maintenance

- [ ] Set up disk space alerts
  - [ ] Alert when `/uploads` reaches 80% capacity
  - [ ] Alert when `/uploads` reaches 95% capacity

- [ ] Set up error monitoring
  - [ ] Monitor FFmpeg failures
  - [ ] Monitor compression timeouts
  - [ ] Monitor database errors

- [ ] Create cleanup policy
  - [ ] Delete files older than 90 days (if applicable)
  - [ ] Archive old files to cold storage
  - [ ] Monitor orphaned files

- [ ] Set up performance monitoring
  - [ ] Track average compression time
  - [ ] Track compression success rate
  - [ ] Track disk space saved

- [ ] Create runbooks
  - [ ] FFmpeg not found troubleshooting
  - [ ] Disk space emergency procedures
  - [ ] Database recovery procedures

### 13. Documentation

- [ ] Update API documentation
  - [ ] Add compression stats endpoint
  - [ ] Document compression settings
  - [ ] Add example requests/responses

- [ ] Update deployment guide
  - [ ] Add FFmpeg installation steps
  - [ ] Add file system setup steps
  - [ ] Add troubleshooting section

- [ ] Create operational guide
  - [ ] Monitoring procedures
  - [ ] Backup procedures
  - [ ] Recovery procedures

- [ ] Update team wiki
  - [ ] Compression system overview
  - [ ] Common issues and solutions
  - [ ] Performance tuning tips

## Rollback Plan

### 14. Rollback Procedures

If issues occur in production:

- [ ] **Immediate Actions**
  1. Stop accepting new uploads
  2. Revert to previous application version
  3. Disable compression in settings (set `CompressDocuments = false`)

- [ ] **Database Rollback**
  ```bash
  # Revert to previous migration
  dotnet ef database update <PreviousMigrationName>
  ```

- [ ] **File System Rollback**
  ```bash
  # Restore from backup
  tar -xzf uploads_backup_$(date +%Y%m%d).tar.gz -C /
  ```

- [ ] **Verification**
  - [ ] Verify application starts successfully
  - [ ] Verify database connection works
  - [ ] Verify file uploads work (without compression)
  - [ ] Verify no data loss

## Sign-Off

- [ ] Development Lead: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

## Notes

```
[Space for implementation notes and issues encountered]
```
