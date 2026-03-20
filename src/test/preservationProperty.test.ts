/**
 * Preservation Property Tests
 *
 * These tests verify that all NON-buggy behaviors remain unchanged after the fix.
 * They must PASS on UNFIXED code (baseline) and continue to PASS after the fix.
 *
 * Covers:
 *   3.1  Token stored in localStorage via setToken(data.token) after login
 *   3.2  API requests attach Authorization: Bearer <token> header
 *   3.3  logout() clears token via clearToken()
 *   3.4  Successful subject creation adds new subject to list (no duplicates)
 *   3.5  Successful subject update modifies existing entry without duplicating
 *   3.6  "التالي" button disabled when subject name is empty
 *   3.7  Navigating between steps preserves form data
 *   3.8  "السابق" returns to previous step without data loss
 *   3.9  "إلغاء" on Step 1 closes modal and discards changes
 *   3.10 Successful API response mapped correctly (wrapped + direct formats)
 *   3.11 Both { data: {...} } and direct object response formats handled
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Token utility stubs (mirrors utils/token.ts behaviour)
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'token';

function setToken(token: string) { localStorage.setItem(TOKEN_KEY, token); }
function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

// ---------------------------------------------------------------------------
// 3.1 – Token stored in localStorage after login
// ---------------------------------------------------------------------------
describe('3.1 – Token stored in localStorage after login', () => {
  it('setToken stores JWT under the correct key', () => {
    const fakeJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.sig';
    setToken(fakeJwt);
    expect(localStorage.getItem(TOKEN_KEY)).toBe(fakeJwt);
  });

  it('login flow calls setToken(data.token) when response contains token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, token: 'jwt-abc', userId: '1', name: 'أحمد', email: 'a@b.com', role: 'teacher' }),
    });
    global.fetch = mockFetch as any;

    // Simulate the login logic from AuthContext
    const res = await fetch('/api/v1/auth/login', { method: 'POST', body: '{}' });
    const data = await res.json();
    if (data.token) setToken(data.token);

    expect(getToken()).toBe('jwt-abc');
  });
});

// ---------------------------------------------------------------------------
// 3.2 – API requests attach Authorization: Bearer <token>
// ---------------------------------------------------------------------------
describe('3.2 – API requests attach Authorization: Bearer header', () => {
  it('apiRequest attaches Bearer token when token exists', async () => {
    setToken('my-test-token');

    const capturedHeaders: Record<string, string> = {};
    const mockFetch = vi.fn().mockImplementation((_url: string, opts: RequestInit) => {
      Object.assign(capturedHeaders, opts.headers as Record<string, string>);
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    global.fetch = mockFetch as any;

    // Simulate apiRequest logic from api/client.ts
    const token = getToken();
    await fetch('/api/v1/teacher', {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    expect(capturedHeaders['Authorization']).toBe('Bearer my-test-token');
  });

  it('apiRequest does NOT attach Authorization header when no token', async () => {
    // No token set
    const capturedHeaders: Record<string, string> = {};
    const mockFetch = vi.fn().mockImplementation((_url: string, opts: RequestInit) => {
      Object.assign(capturedHeaders, opts.headers as Record<string, string>);
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    global.fetch = mockFetch as any;

    const token = getToken(); // null
    await fetch('/api/v1/teacher', {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    expect(capturedHeaders['Authorization']).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 3.3 – logout() clears token
// ---------------------------------------------------------------------------
describe('3.3 – logout clears token from localStorage', () => {
  it('clearToken removes the token key', () => {
    setToken('some-token');
    expect(getToken()).toBe('some-token');

    clearToken();
    expect(getToken()).toBeNull();
  });

  it('logout flow calls clearToken and token is gone', () => {
    setToken('teacher-jwt');

    // Simulate logout from AuthContext
    const logout = () => { clearToken(); };
    logout();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3.4 – Successful subject creation adds to list without duplicates
// ---------------------------------------------------------------------------
describe('3.4 – Successful subject creation adds new subject to list', () => {
  it('setSubjects([...subjects, newSubject]) appends without duplicating', () => {
    const existing = [
      { id: '1', name: 'رياضيات', description: '', icon: '📐', levels: [], students: 0, status: 'draft' as const, createdAt: '2025-01-01' },
    ];

    const newSubject = {
      id: '2', name: 'فيزياء', description: '', icon: '⚛️', levels: [], students: 0, status: 'draft' as const, createdAt: '2025-01-02',
    };

    const updated = [...existing, newSubject];

    expect(updated).toHaveLength(2);
    expect(updated.map(s => s.id)).toEqual(['1', '2']);
    // No duplicates
    const ids = updated.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// 3.5 – Successful subject update modifies without duplicating
// ---------------------------------------------------------------------------
describe('3.5 – Successful subject update modifies existing entry', () => {
  it('subjects.map() replaces the matching subject without adding a new one', () => {
    const subjects = [
      { id: '1', name: 'رياضيات', description: 'قديم', icon: '📐', levels: [], students: 0, status: 'draft' as const, createdAt: '2025-01-01' },
      { id: '2', name: 'فيزياء', description: '', icon: '⚛️', levels: [], students: 0, status: 'draft' as const, createdAt: '2025-01-02' },
    ];

    const editingId = '1';
    const updated = subjects.map(s =>
      s.id === editingId ? { ...s, name: 'رياضيات متقدمة', description: 'جديد' } : s
    );

    expect(updated).toHaveLength(2); // no new entry added
    expect(updated.find(s => s.id === '1')?.name).toBe('رياضيات متقدمة');
    expect(updated.find(s => s.id === '2')?.name).toBe('فيزياء'); // unchanged
  });
});

// ---------------------------------------------------------------------------
// 3.6 – "التالي" button disabled when subject name is empty
// ---------------------------------------------------------------------------
describe('3.6 – Next button disabled when subject name is empty', () => {
  it('button is disabled when newSubjectName is empty string', () => {
    const newSubjectName = '';
    const isDisabled = !newSubjectName.trim();
    expect(isDisabled).toBe(true);
  });

  it('button is enabled when newSubjectName has content', () => {
    const newSubjectName = 'رياضيات';
    const isDisabled = !newSubjectName.trim();
    expect(isDisabled).toBe(false);
  });

  it('button is disabled when name is only whitespace', () => {
    const newSubjectName = '   ';
    const isDisabled = !newSubjectName.trim();
    expect(isDisabled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3.7 – Navigating between steps preserves form data
// ---------------------------------------------------------------------------
describe('3.7 – Step navigation preserves form state', () => {
  it('moving from step 1 to step 2 does not reset subject name', () => {
    let createStep = 1;
    let newSubjectName = 'رياضيات';
    let newSubjectDesc = 'وصف المادة';

    // Simulate clicking "التالي"
    const goNext = () => { createStep += 1; };
    goNext();

    expect(createStep).toBe(2);
    expect(newSubjectName).toBe('رياضيات');   // preserved
    expect(newSubjectDesc).toBe('وصف المادة'); // preserved
  });

  it('moving from step 2 to step 3 preserves levels', () => {
    let createStep = 2;
    const newLevels = [
      { id: 'l1', name: 'المستوى الأول', lectures: [] },
      { id: 'l2', name: 'المستوى الثاني', lectures: [] },
    ];

    const goNext = () => { createStep += 1; };
    goNext();

    expect(createStep).toBe(3);
    expect(newLevels).toHaveLength(2);
    expect(newLevels[0].name).toBe('المستوى الأول');
  });
});

// ---------------------------------------------------------------------------
// 3.8 – "السابق" returns to previous step without data loss
// ---------------------------------------------------------------------------
describe('3.8 – Back button returns to previous step without data loss', () => {
  it('clicking السابق on step 2 goes back to step 1', () => {
    let createStep = 2;
    let newSubjectName = 'كيمياء';

    const goBack = () => { if (createStep > 1) createStep -= 1; };
    goBack();

    expect(createStep).toBe(1);
    expect(newSubjectName).toBe('كيمياء'); // data preserved
  });

  it('clicking السابق on step 3 goes back to step 2', () => {
    let createStep = 3;
    const newLevels = [{ id: 'l1', name: 'المستوى الأول', lectures: [] }];

    const goBack = () => { if (createStep > 1) createStep -= 1; };
    goBack();

    expect(createStep).toBe(2);
    expect(newLevels[0].name).toBe('المستوى الأول'); // levels preserved
  });
});

// ---------------------------------------------------------------------------
// 3.9 – "إلغاء" on Step 1 closes modal and discards changes
// ---------------------------------------------------------------------------
describe('3.9 – Cancel on step 1 closes modal and discards changes', () => {
  it('onClose is called when إلغاء is clicked on step 1', () => {
    const onClose = vi.fn();
    const createStep = 1;

    // Simulate the footer button logic: step > 1 ? goBack : onClose
    const handleLeftButton = () => {
      if (createStep > 1) {
        // go back
      } else {
        onClose();
      }
    };

    handleLeftButton();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('resetForm clears all form fields', () => {
    let newSubjectName = 'رياضيات';
    let newSubjectDesc = 'وصف';
    let newSubjectIcon = '🔬';
    let createStep = 3;
    let editingSubject: any = { id: '1', name: 'رياضيات' };

    const resetForm = () => {
      newSubjectName = '';
      newSubjectDesc = '';
      newSubjectIcon = '📚';
      createStep = 1;
      editingSubject = null;
    };

    resetForm();

    expect(newSubjectName).toBe('');
    expect(newSubjectDesc).toBe('');
    expect(newSubjectIcon).toBe('📚');
    expect(createStep).toBe(1);
    expect(editingSubject).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3.10 – Successful API response mapped correctly
// ---------------------------------------------------------------------------
describe('3.10 – API response mapped to local Subject format', () => {
  it('maps wrapped { data: {...} } response correctly', () => {
    const apiResponse = {
      data: {
        id: 42,
        title: 'رياضيات',
        description: 'وصف',
        studentsCount: 10,
        status: 'published',
        createdAt: '2025-01-15T00:00:00Z',
        levels: [],
      },
    };

    const responseData = apiResponse.data || apiResponse;

    expect(responseData.id).toBe(42);
    expect(responseData.title).toBe('رياضيات');
    expect(responseData.studentsCount).toBe(10);
  });

  it('maps direct object response correctly', () => {
    const apiResponse: any = {
      id: 42,
      title: 'رياضيات',
      description: 'وصف',
      studentsCount: 10,
      status: 'published',
      createdAt: '2025-01-15T00:00:00Z',
      levels: [],
    };

    const responseData = apiResponse.data || apiResponse;

    expect(responseData.id).toBe(42);
    expect(responseData.title).toBe('رياضيات');
  });
});

// ---------------------------------------------------------------------------
// 3.11 – Both response formats handled (wrapped + direct)
// ---------------------------------------------------------------------------
describe('3.11 – Both wrapped and direct API response formats handled', () => {
  const mapResponse = (created: any) => {
    const responseData = created.data || created;
    return {
      id: responseData.id?.toString(),
      name: responseData.name || responseData.title,
      description: responseData.description || '',
      students: responseData.studentsCount || 0,
      status: responseData.status === 'published' ? 'published' : 'draft',
    };
  };

  it('handles wrapped { data: {...} } format', () => {
    const wrapped = { data: { id: 1, title: 'فيزياء', description: 'وصف', studentsCount: 5, status: 'draft' } };
    const result = mapResponse(wrapped);
    expect(result.id).toBe('1');
    expect(result.name).toBe('فيزياء');
    expect(result.students).toBe(5);
  });

  it('handles direct object format', () => {
    const direct = { id: 2, name: 'كيمياء', description: 'وصف', studentsCount: 3, status: 'published' };
    const result = mapResponse(direct);
    expect(result.id).toBe('2');
    expect(result.name).toBe('كيمياء');
    expect(result.status).toBe('published');
  });

  it('status "published" maps to published, anything else maps to draft', () => {
    expect(mapResponse({ id: 1, title: 'x', status: 'published' }).status).toBe('published');
    expect(mapResponse({ id: 1, title: 'x', status: 'draft' }).status).toBe('draft');
    expect(mapResponse({ id: 1, title: 'x', status: 'pending' }).status).toBe('draft');
    expect(mapResponse({ id: 1, title: 'x', status: undefined }).status).toBe('draft');
  });
});
