# Teacher Dashboard Authentication - Test Checklist

## Pre-Test Setup
- [ ] Clear browser localStorage and sessionStorage
- [ ] Open browser developer console (F12)
- [ ] Ensure backend is running
- [ ] Ensure frontend dev server is running

## Test 1: Login Flow
- [ ] Navigate to login page
- [ ] Enter teacher credentials
- [ ] Click login button
- [ ] **Verify**: Console shows `[setToken] Storing token:`
- [ ] **Verify**: Console shows `[setToken] Token stored successfully`
- [ ] **Verify**: Homepage displays teacher name
- [ ] **Verify**: "لوحة التحكم" (Dashboard) link is visible
- [ ] **Verify**: "تسجيل الخروج" (Logout) button is visible

## Test 2: Dashboard Access
- [ ] Click "لوحة التحكم" (Dashboard) link
- [ ] **Verify**: Console shows `[TeacherDashboard] User from context:` with user data
- [ ] **Verify**: Console shows `[TeacherDashboard] Token from localStorage: EXISTS`
- [ ] **Verify**: Dashboard loads successfully
- [ ] **Verify**: Teacher's subjects are displayed (if any)

## Test 3: Create Subject - Step 1 (Subject Info)
- [ ] Click "إنشاء مادة جديدة" (Create New Subject) button
- [ ] Modal opens successfully
- [ ] Enter subject name: "اختبار المادة"
- [ ] Enter subject description: "وصف تجريبي"
- [ ] Select an icon
- [ ] Click "التالي" (Next) button
- [ ] **Verify**: Modal advances to Step 2

## Test 4: Create Subject - Step 2 (Levels)
- [ ] Verify default level "المستوى 1" is present
- [ ] Click "إضافة مستوى" (Add Level) button
- [ ] Rename first level to "المستوى الأول"
- [ ] Click "التالي" (Next) button
- [ ] **Verify**: Modal advances to Step 3

## Test 5: Create Subject - Step 3 (Lectures)
- [ ] Click "+ محاضرة" (Add Lecture) for first level
- [ ] Enter lecture title: "المحاضرة الأولى"
- [ ] Enter video URL (optional)
- [ ] Click "حفظ المادة" (Save Subject) button
- [ ] **Verify**: Console shows `[saveSubject] User and token verified, proceeding with save`
- [ ] **Verify**: Console shows `[saveSubject] User role: teacher`
- [ ] **Verify**: Console shows `[getToken] Retrieved token: EXISTS`
- [ ] **Verify**: Console shows `[authedFetch] Token retrieved: EXISTS`
- [ ] **Verify**: Console shows `[authedFetch] URL: /api/v1/teacher/subjects`
- [ ] **Verify**: Console shows `[authedFetch] Response status:` (check status code)

## Expected Results

### Success Case (Status 200/201):
- [ ] Console shows `[saveSubject] API response:` with created subject data
- [ ] Toast notification: "تم إنشاء المادة بنجاح ✨"
- [ ] Modal closes automatically
- [ ] New subject appears in dashboard list

### Auth Failure Case (Status 401):
- [ ] Console shows `[authedFetch] Response status: 401`
- [ ] Toast notification: "انتهت صلاحية الجلسة"
- [ ] User redirected to login page

### Token Missing Case:
- [ ] Console shows `[getToken] Retrieved token: MISSING`
- [ ] Toast notification: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى"
- [ ] User redirected to login page

## Troubleshooting

### If "يجب تسجيل الدخول أولاً" appears:
1. Check console for `[getToken]` logs
2. If token is MISSING:
   - Check if `[setToken]` was called during login
   - Check if token was cleared between login and create
3. If token EXISTS:
   - Check `[authedFetch] Response status:`
   - If 401, backend is rejecting the token
   - Check backend logs for JWT validation errors

### If API call fails with network error:
1. Verify backend is running
2. Check CORS configuration
3. Verify API_BASE URL in environment variables

### If modal doesn't open:
1. Check browser console for JavaScript errors
2. Verify React state is updating correctly
3. Check if `showCreateModal` state is being set

## Post-Test Cleanup
- [ ] Delete test subject if created
- [ ] Clear console logs
- [ ] Document any issues found
- [ ] Update issue tracker with results
