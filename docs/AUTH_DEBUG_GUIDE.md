# Authentication Debug Guide - Teacher Dashboard "Create Subject" Issue

## Problem Summary
Teachers are logged in successfully (homepage shows their name and dashboard link), but when attempting to create a subject in the Teacher Dashboard, they receive an error message saying they are not logged in.

## Root Cause Analysis

The issue stems from a token persistence/retrieval problem. The authentication flow works as follows:

1. **Login Flow** (Working ✓):
   - User logs in via `AuthContext.login()`
   - Backend returns JWT token
   - Token is stored via `setToken(data.token)` in `utils/token.ts`
   - User object is stored in React state and localStorage
   - Homepage correctly displays user info from AuthContext

2. **Create Subject Flow** (Failing ✗):
   - User clicks "Create Subject" in Teacher Dashboard
   - `saveSubject()` function checks for token via `localStorage.getItem(TOKEN_KEY)`
   - If token is missing, shows error: "يجب تسجيل الدخول أولاً"
   - API call via `createCourseWithCurriculum()` → `authedFetch()` → `getToken()`

## Changes Made for Debugging

### 1. Enhanced Token Utilities (`utils/token.ts`)
Added comprehensive logging to track token operations:
- `getToken()`: Logs when token is retrieved (shows first 20 chars)
- `setToken()`: Logs when token is stored
- `clearToken()`: Logs when token is cleared

### 2. Enhanced TeacherDashboard (`components/TeacherDashboard.tsx`)
Added multi-layer authentication checks in `saveSubject()`:
- First checks if user exists in AuthContext
- Then checks if token exists in localStorage
- Logs detailed information about auth state
- Redirects to login if either check fails

Added logging in `useEffect` data loading:
- Logs user from context
- Logs token availability
- Helps identify when component loads without auth

### 3. Enhanced API Client (`services/api.ts`)
Added logging to `authedFetch()`:
- Logs token retrieval status
- Logs request URL
- Logs response status
- Helps track API authentication flow

## How to Test

### Step 1: Clear Browser State
```javascript
// Open browser console and run:
localStorage.clear();
sessionStorage.clear();
// Then refresh the page
```

### Step 2: Login as Teacher
1. Navigate to login page
2. Login with teacher credentials
3. **Check console logs** for:
   ```
   [setToken] Storing token: eyJhbGciOiJIUzI1NiIs...
   [setToken] Token stored successfully
   ```

### Step 3: Navigate to Teacher Dashboard
1. Click on "لوحة التحكم" (Dashboard) link
2. **Check console logs** for:
   ```
   [TeacherDashboard] useEffect triggered
   [TeacherDashboard] User from context: {id: "...", name: "...", role: "teacher"}
   [getToken] Retrieved token: EXISTS (eyJhbGciOiJIUzI1NiIs...)
   [TeacherDashboard] Token from localStorage: EXISTS
   ```

### Step 4: Attempt to Create Subject
1. Click "إنشاء مادة جديدة" (Create New Subject)
2. Fill in subject details
3. Click through steps 1, 2, 3
4. Click "حفظ المادة" (Save Subject)
5. **Check console logs** for:
   ```
   [saveSubject] User and token verified, proceeding with save
   [saveSubject] User role: teacher
   [getToken] Retrieved token: EXISTS (eyJhbGciOiJIUzI1NiIs...)
   [authedFetch] Token retrieved: EXISTS
   [authedFetch] URL: /api/v1/teacher/subjects
   [authedFetch] Response status: 200 (or 401 if auth fails)
   ```

## Expected Outcomes

### If Token is Present:
- All `[getToken]` logs should show "EXISTS"
- API call should proceed with Authorization header
- If backend returns 401, the issue is backend authentication
- If backend returns 200, subject should be created successfully

### If Token is Missing:
- `[getToken]` logs will show "MISSING"
- Error message will appear: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى"
- User will be redirected to login page
- This indicates token was never stored or was cleared

## Common Scenarios

### Scenario 1: Token Never Stored
**Symptoms**: Login succeeds but token logs show "MISSING"
**Cause**: Backend not returning token in response
**Solution**: Check backend `/auth/login` endpoint response format

### Scenario 2: Token Cleared After Login
**Symptoms**: Token exists after login but missing when creating subject
**Cause**: Token being cleared by another part of the application
**Solution**: Check for `clearToken()` calls or localStorage.clear()

### Scenario 3: Token Exists But API Returns 401
**Symptoms**: Token logs show "EXISTS" but API returns 401
**Cause**: Backend rejecting the token (expired, invalid, or wrong format)
**Solution**: Check backend JWT validation and token expiration

### Scenario 4: Wrong localStorage Key
**Symptoms**: Token stored but not retrieved
**Cause**: Mismatch between storage key and retrieval key
**Solution**: Verify TOKEN_KEY = "elmanassa_auth_token" is consistent

## Next Steps

Based on console logs, you can determine:

1. **If token is never stored**: Fix backend response or AuthContext.login()
2. **If token is stored but cleared**: Find where clearToken() is called
3. **If token exists but API fails**: Check backend authentication
4. **If everything works**: Remove debug logs and close issue

## Files Modified

- `utils/token.ts` - Added logging to token operations
- `components/TeacherDashboard.tsx` - Enhanced auth checks and logging
- `services/api.ts` - Added API request logging

## Rollback Instructions

If you want to remove the debug logging after fixing the issue:

1. Remove console.log statements from `utils/token.ts`
2. Remove console.log statements from `components/TeacherDashboard.tsx`
3. Remove console.log statements from `services/api.ts`
4. Keep the enhanced auth checks in `saveSubject()` (they improve error handling)
