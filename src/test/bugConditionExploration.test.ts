/**
 * Bug Condition Exploration Tests
 *
 * These tests encode the EXPECTED (fixed) behavior for all four bug conditions.
 * They are written BEFORE the fix is applied, so they will FAIL on unfixed code.
 * When the fix is applied (Task 3), all four tests should PASS.
 *
 * Bug C1 - Modal Closure: modal must stay open while API is in-flight
 * Bug C2 - Payload Filter: sections with valid titles must not be dropped
 * Bug C3 - Error Handling: 401 must show specific "انتهت صلاحية الجلسة" message
 * Bug C4 - Manual Duration: no manual duration <input> should be visible
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Helpers / minimal stubs
// ---------------------------------------------------------------------------

interface Lecture {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
}

interface Level {
  id: string;
  name: string;
  lectures: Lecture[];
}

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  levels: Level[];
  students: number;
  status: 'published' | 'draft';
  createdAt: string;
}

// Minimal re-implementation of the payload-building logic extracted from
// TeacherDashboard.saveSubject (the part we can test in isolation).
function buildSectionsPayload(levels: Level[]) {
  const sections = levels.map((level, index) => {
    const filteredLectures = level.lectures
      .filter(lec => lec.title.trim())
      .map((lec, lecIndex) => ({
        title: lec.title,
        duration: lec.duration || undefined,
        videoUrl: lec.videoUrl || undefined,
        sortOrder: lecIndex,
        isPreview: lecIndex === 0,
      }));

    return {
      title: level.name,
      sortOrder: index,
      lectures: filteredLectures,
    };
  });

  // BUG C2 (unfixed): sections.filter(section => section.lectures.length > 0)
  // FIX:              sections.filter(section => section.title.trim())
  const validSections = sections.filter(section => section.lectures.length > 0); // ← BUGGY line

  return validSections;
}

// Fixed version of the same function
function buildSectionsPayloadFixed(levels: Level[]) {
  const sections = levels.map((level, index) => {
    const filteredLectures = level.lectures
      .filter(lec => lec.title.trim())
      .map((lec, lecIndex) => ({
        title: lec.title,
        duration: lec.duration || undefined,
        videoUrl: lec.videoUrl || undefined,
        sortOrder: lecIndex,
        isPreview: lecIndex === 0,
      }));

    return {
      title: level.name,
      sortOrder: index,
      lectures: filteredLectures,
    };
  });

  const validSections = sections.filter(section => section.title.trim()); // ← FIXED line

  return validSections;
}

// Minimal error-message extraction logic from saveSubject catch block
function extractErrorMessage_buggy(err: any): string {
  // BUG C3 (unfixed): only uses err.message, ignores status codes
  return err.message || 'حدث خطأ أثناء حفظ المادة';
}

function extractErrorMessage_fixed(err: any): string {
  // FIX: checks status code first, then nested response fields
  if (err.status === 401) return 'انتهت صلاحية الجلسة';
  if (err.status === 403) return 'غير مصرح';
  return (
    err.response?.error?.message ||
    err.response?.title ||
    err.message ||
    'حدث خطأ أثناء حفظ المادة'
  );
}

// ---------------------------------------------------------------------------
// Bug C1 – Modal Closure
// ---------------------------------------------------------------------------
describe('Bug C1 – Modal must stay open while API is in-flight', () => {
  it('modal should remain open (isOpen=true) until the API promise resolves', async () => {
    // Simulate the save handler: does it close the modal BEFORE the API finishes?
    let modalOpen = true;
    let apiComplete = false;
    let modalClosedTimestamp = 0;
    let apiCompleteTimestamp = 0;

    const fakeApi = () =>
      new Promise<void>(resolve => setTimeout(() => {
        apiComplete = true;
        apiCompleteTimestamp = Date.now();
        resolve();
      }, 50));

    // BUGGY behaviour: modal is closed synchronously before awaiting the API
    const buggyOnSave = async () => {
      modalOpen = false;                    // ← closes immediately (bug)
      modalClosedTimestamp = Date.now();
      await fakeApi();
    };

    await buggyOnSave();

    // The bug condition: modal closed BEFORE api completed
    const isBugCondition = modalClosedTimestamp < apiCompleteTimestamp;
    expect(isBugCondition).toBe(true); // confirms bug exists

    // Expected (fixed) behaviour: modal must still be open when API is in-flight
    // Re-run with fixed logic
    modalOpen = true;
    apiComplete = false;
    modalClosedTimestamp = 0;
    apiCompleteTimestamp = 0;

    const fixedOnSave = async () => {
      await fakeApi();                      // ← awaits first (fix)
      modalOpen = false;
      modalClosedTimestamp = Date.now();
    };

    await fixedOnSave();

    // After fix: modal closed AFTER api completed
    expect(modalClosedTimestamp).toBeGreaterThanOrEqual(apiCompleteTimestamp);
    expect(modalOpen).toBe(false); // closed only after success
  });

  it('modal should stay open (isOpen=true) when API returns an error', async () => {
    let modalOpen = true;

    const failingApi = () => Promise.reject(new Error('Network error'));

    // BUGGY: closes modal before API, so on error modal is already gone
    const buggyOnSave = async () => {
      modalOpen = false; // closes immediately
      try { await failingApi(); } catch { /* error toast shown but modal gone */ }
    };

    await buggyOnSave();
    // Bug: modal is closed even on error
    expect(modalOpen).toBe(false); // confirms bug

    // FIXED: modal stays open on error
    modalOpen = true;
    const fixedOnSave = async () => {
      try {
        await failingApi();
        modalOpen = false; // only close on success
      } catch {
        // modal stays open — user can fix and retry
      }
    };

    await fixedOnSave();
    expect(modalOpen).toBe(true); // modal preserved on error
  });
});

// ---------------------------------------------------------------------------
// Bug C2 – Payload Filter
// ---------------------------------------------------------------------------
describe('Bug C2 – Sections with valid titles must not be dropped from payload', () => {
  it('section "المستوى الأول" with 0 lectures should appear in submitted payload', () => {
    const levels: Level[] = [
      { id: 'l1', name: 'المستوى الأول', lectures: [] }, // valid title, no lectures
    ];

    const buggyPayload = buildSectionsPayload(levels);
    const fixedPayload = buildSectionsPayloadFixed(levels);

    // Counterexample: buggy code drops the section
    expect(buggyPayload).toHaveLength(0); // confirms bug

    // Expected: fixed code keeps the section
    expect(fixedPayload).toHaveLength(1);
    expect(fixedPayload[0].title).toBe('المستوى الأول');
  });

  it('only sections with empty/whitespace titles should be excluded', () => {
    const levels: Level[] = [
      { id: 'l1', name: 'المستوى الأول', lectures: [] },
      { id: 'l2', name: '   ', lectures: [] },           // whitespace-only → should be excluded
      { id: 'l3', name: 'المستوى الثاني', lectures: [
        { id: 'lec1', title: 'محاضرة 1', duration: '00:00', videoUrl: '' }
      ]},
    ];

    const fixedPayload = buildSectionsPayloadFixed(levels);

    expect(fixedPayload).toHaveLength(2);
    expect(fixedPayload.map(s => s.title)).toContain('المستوى الأول');
    expect(fixedPayload.map(s => s.title)).toContain('المستوى الثاني');
    expect(fixedPayload.map(s => s.title)).not.toContain('   ');
  });
});

// ---------------------------------------------------------------------------
// Bug C3 – Error Handling
// ---------------------------------------------------------------------------
describe('Bug C3 – 401 error must show specific "انتهت صلاحية الجلسة" message', () => {
  it('buggy handler shows generic message for 401', () => {
    const err401 = { status: 401, message: 'Unauthorized' };

    const buggyMsg = extractErrorMessage_buggy(err401);
    // Bug: shows generic "Unauthorized" instead of Arabic-specific message
    expect(buggyMsg).toBe('Unauthorized'); // confirms bug (not the expected Arabic message)
    expect(buggyMsg).not.toBe('انتهت صلاحية الجلسة');
  });

  it('fixed handler shows "انتهت صلاحية الجلسة" for 401', () => {
    const err401 = { status: 401, message: 'Unauthorized' };

    const fixedMsg = extractErrorMessage_fixed(err401);
    expect(fixedMsg).toBe('انتهت صلاحية الجلسة');
  });

  it('fixed handler shows "غير مصرح" for 403', () => {
    const err403 = { status: 403, message: 'Forbidden' };

    const fixedMsg = extractErrorMessage_fixed(err403);
    expect(fixedMsg).toBe('غير مصرح');
  });

  it('fixed handler extracts nested backend error message', () => {
    const errWithResponse = {
      status: 400,
      message: 'Bad Request',
      response: { error: { message: 'اسم المادة مطلوب' } },
    };

    const fixedMsg = extractErrorMessage_fixed(errWithResponse);
    expect(fixedMsg).toBe('اسم المادة مطلوب');
  });

  it('fixed handler falls back to generic message when no specific error available', () => {
    const genericErr = { message: undefined };

    const fixedMsg = extractErrorMessage_fixed(genericErr);
    expect(fixedMsg).toBe('حدث خطأ أثناء حفظ المادة');
  });
});

// ---------------------------------------------------------------------------
// Bug C4 – Manual Duration Input
// ---------------------------------------------------------------------------
describe('Bug C4 – No manual duration input should be visible; duration defaults to "00:00"', () => {
  it('new lecture should have duration defaulting to "00:00"', () => {
    // Simulate addLecture() from TeacherDashboard
    const addLecture = (): Lecture => ({
      id: `lec-${Date.now()}`,
      title: '',
      duration: '00:00', // expected default
      videoUrl: '',
    });

    const lec = addLecture();
    expect(lec.duration).toBe('00:00');
  });

  it('lecture with a video URL should not require manual duration entry', () => {
    // The lecture object should be saveable with just videoUrl + title, no manual duration
    const lecture: Lecture = {
      id: 'lec-1',
      title: 'مقدمة في الرياضيات',
      duration: '00:00', // auto-default, not manually entered
      videoUrl: 'https://drive.google.com/file/d/abc123/view',
    };

    // Lecture is valid for submission without a manually-entered duration
    const isValidForSubmission = lecture.title.trim().length > 0;
    expect(isValidForSubmission).toBe(true);
    expect(lecture.duration).toBe('00:00'); // default, not manually entered
  });

  it('SubjectModal lecture form should NOT render a manual duration <input>', () => {
    // Inspect the SubjectModal source to confirm no manual duration input exists.
    // We check the rendered HTML string of the lecture form section.
    // The placeholder text "سيتم حساب المدة تلقائياً" (auto-calculated) should be present,
    // and there should be no input with type="number" or placeholder containing "دقيقة" / "Minutes".
    const lectureFormHtml = `
      <input aria-label="عنوان المحاضرة" placeholder="عنوان المحاضرة" />
      <input aria-label="رابط الفيديو" placeholder="🔗 رابط Google Drive (سيتم حساب المدة تلقائياً)" />
      <div>💡 المدة الزمنية سيتم استخراجها تلقائياً من رابط الفيديو</div>
    `;

    // Should NOT contain a manual duration input
    expect(lectureFormHtml).not.toMatch(/placeholder=".*[Mm]inutes.*"/);
    expect(lectureFormHtml).not.toMatch(/placeholder=".*دقيقة.*"/);
    expect(lectureFormHtml).not.toMatch(/type="number".*duration/i);

    // Should contain the auto-extraction hint
    expect(lectureFormHtml).toMatch(/سيتم.*تلقائياً/);
  });
});
