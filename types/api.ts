/**
 * API Type Definitions
 * Centralized types for all API requests and responses
 */

// ═══════════════════════════════════════════════════════════
// Base API Response Types
// ═══════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
    data?: T;
    error?: ApiError;
    message?: string;
    success?: boolean;
}

export interface ApiError {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

// ═══════════════════════════════════════════════════════════
// Backend Entity Types (from backend DTOs)
// ═══════════════════════════════════════════════════════════

export interface BackendLecture {
    id: string | number;
    title: string;
    duration?: string;
    durationSeconds?: number;
    videoUrl?: string;
    mediaFileId?: string;
    videoFileId?: string;
    documentFileIds?: string[];
    sortOrder?: number;
    isPreview?: boolean;
    mediaFiles?: BackendMediaFile[];
}

export interface BackendMediaFile {
    id: string;
    fileType: 'video' | 'document' | 'image' | string;
    originalFileName: string;
    fileUrl?: string;
    fileSize?: number;
    mimeType?: string;
    createdAt?: string;
}

export interface BackendLevel {
    id: string | number;
    title?: string;
    name?: string;
    sortOrder?: number;
    lectures?: BackendLecture[];
}

export interface BackendSubject {
    id: string | number;
    guidId?: string;
    title?: string;
    name?: string;
    description?: string;
    category?: string;
    level?: string;
    language?: string;
    price?: number;
    duration?: number;
    icon?: string;
    imageUrl?: string;
    rating?: number;
    studentsCount?: number;
    status?: 'published' | 'Published' | 'draft' | 'Draft' | string;
    createdAt?: string;
    updatedAt?: string;
    instructorId?: number;
    instructorName?: string;
    levels?: BackendLevel[];
    curriculumSections?: BackendCurriculumSection[];
}

export interface BackendCurriculumSection {
    id?: string | number;
    title?: string;
    name?: string;
    sortOrder?: number;
    lectures?: BackendLecture[];
}

// ═══════════════════════════════════════════════════════════
// Teacher Dashboard Types
// ═══════════════════════════════════════════════════════════

export interface TeacherStats {
    totalSubjects: number;
    totalStudents: number;
    totalLectures: number;
    publishedCount: number;
    draftCount?: number;
    totalRevenue?: number;
    recentActivities?: BackendActivity[];
}

export interface BackendActivity {
    id?: string | number;
    description?: string;
    text?: string;
    time?: string;
    createdAt?: string;
    type?: 'enrollment' | 'completion' | 'payment' | 'review' | string;
}

export interface TeacherStudent {
    id: string | number;
    name: string;
    email?: string;
    avatar?: string;
    avatarUrl?: string;
    phoneNumber?: string;
    enrollmentDate?: string;
    progress?: number;
    completedLectures?: number;
    totalLectures?: number;
}

// ═══════════════════════════════════════════════════════════
// Student Types
// ═══════════════════════════════════════════════════════════

export interface StudentProgress {
    totalCourses: number;
    completedLectures: number;
    totalLectures: number;
    averageProgress: number;
    hoursSpent?: number;
}

export interface StudentEnrollment {
    id: string | number;
    subjectId: string | number;
    subjectTitle?: string;
    subjectName?: string;
    studentId?: string | number;
    studentName?: string;
    enrolledAt?: string;
    progress?: number;
    completedLectures?: number;
    totalLectures?: number;
    lastAccessedAt?: string;
    imageUrl?: string;
}

export interface StudentCourse {
    id: string | number;
    title?: string;
    name?: string;
    description?: string;
    imageUrl?: string;
    instructorName?: string;
    progress?: number;
    completedLectures?: number;
    totalLectures?: number;
    lastAccessedAt?: string;
    enrolledAt?: string;
    levels?: BackendLevel[];
    curriculumSections?: BackendCurriculumSection[];
}

export interface LectureDetail {
    id: string | number;
    title: string;
    description?: string;
    duration?: string;
    durationSeconds?: number;
    videoUrl?: string;
    mediaFileId?: string;
    sortOrder?: number;
    isCompleted?: boolean;
    watchedSeconds?: number;
    totalSeconds?: number;
    transcript?: string;
    attachments?: BackendMediaFile[];
}

export interface WatchProgressData {
    watchedSeconds: number;
    totalSeconds: number;
    isCompleted?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Order & Payment Types
// ═══════════════════════════════════════════════════════════

export interface Order {
    id: string | number;
    subjectId?: string | number;
    subjectTitle?: string;
    studentId?: string | number;
    studentName?: string;
    amount: number;
    currency?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded' | string;
    paymentMethod?: string;
    paymentProvider?: string;
    transactionId?: string;
    createdAt?: string;
    updatedAt?: string;
    couponCode?: string;
    discountAmount?: number;
    finalAmount?: number;
}

export interface CouponValidation {
    valid: boolean;
    code?: string;
    discountType?: 'percentage' | 'fixed' | string;
    discountValue?: number;
    maxDiscount?: number;
    minAmount?: number;
    message?: string;
}

export interface PaymentInitiation {
    paymentKey?: string;
    iframeUrl?: string;
    redirectUrl?: string;
    orderId?: string | number;
    amount?: number;
    currency?: string;
}

export interface CreateOrderRequest {
    subjectId: string;
    paymentMethod: string;
    couponCode?: string;
    billingFullName: string;
    billingEmail: string;
    billingPhone?: string;
}

// ═══════════════════════════════════════════════════════════
// Admin Types
// ═══════════════════════════════════════════════════════════

export interface AdminStats {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    totalOrders: number;
    totalRevenue: number;
    recentEnrollments?: number;
    pendingApprovals?: number;
}

export interface AdminUser {
    id: string | number;
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin' | string;
    phoneNumber?: string;
    bio?: string;
    avatarUrl?: string;
    isActive?: boolean;
    createdAt?: string;
    lastLoginAt?: string;
}

export interface AdminCourse extends BackendSubject {
    teacherId?: string | number;
    teacherName?: string;
    enrollmentsCount?: number;
}

export interface Enrollment {
    id: string | number;
    studentId: string | number;
    studentName?: string;
    subjectId: string | number;
    subjectTitle?: string;
    subjectName?: string;
    enrolledAt?: string;
    status?: 'active' | 'completed' | 'cancelled' | string;
}

// ═══════════════════════════════════════════════════════════
// AI Types
// ═══════════════════════════════════════════════════════════

export interface AIConversation {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    messages?: AIMessage[];
}

export interface AIMessage {
    id?: string | number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
    createdAt?: string;
}

export interface SendAIMessageRequest {
    message: string;
    conversationId?: string;
}

// ═══════════════════════════════════════════════════════════
// Testimonial Types
// ═══════════════════════════════════════════════════════════

export interface Testimonial {
    id: string | number;
    userName?: string;
    studentName?: string;
    name?: string;
    role?: string;
    jobTitle?: string;
    avatarUrl?: string;
    avatar?: string;
    text?: string;
    content?: string;
    rating?: number;
    courseName?: string;
    course?: string;
    createdAt?: string;
}

// ═══════════════════════════════════════════════════════════
// Contact Form Types
// ═══════════════════════════════════════════════════════════

export interface ContactMessage {
    name: string;
    email: string;
    type: string;
    subject: string;
    message: string;
    phone?: string;
}

// ═══════════════════════════════════════════════════════════
// Stats Types
// ═══════════════════════════════════════════════════════════

export interface PlatformStats {
    totalStudents: number;
    totalCourses: number;
    totalTeachers: number;
    totalLectures?: number;
    totalHours?: number;
    satisfactionRate?: number;
}

// ═══════════════════════════════════════════════════════════
// API Error Types
// ═══════════════════════════════════════════════════════════

export interface ApiErrorWithStatus extends Error {
    status?: number;
    response?: ApiResponse<unknown>;
    code?: string;
}

// ═══════════════════════════════════════════════════════════
// Type Guards
// ═══════════════════════════════════════════════════════════

export function isApiError(error: unknown): error is ApiError {
    return typeof error === 'object' && error !== null && 'message' in error;
}

export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
    return typeof value === 'object' && value !== null && ('data' in value || 'error' in value);
}

export function hasStatus(error: unknown): error is { status: number } {
    return typeof error === 'object' && error !== null && 'status' in error && typeof (error as { status: unknown }).status === 'number';
}

export function isPaginatedResponse<T>(value: unknown): value is PaginatedResponse<T> {
    return (
        typeof value === 'object' &&
        value !== null &&
        'items' in value &&
        Array.isArray((value as { items: unknown }).items) &&
        'total' in value &&
        'page' in value &&
        'perPage' in value
    );
}
