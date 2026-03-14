import { apiRequest } from "./client";

export function login(email: string, password: string) {
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export function signup(data: {
    name: string;
    email: string;
    password: string;
    role: string;
}) {
    return apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function signupTeacher(data: {
    name: string;
    email: string;
    password: string;
    nationalId: string;
    phoneNumber: string;
    yearsOfExperience: number;
    specialization: string;
    bio: string;
    cvUrl: string;
}) {
    return apiRequest("/auth/signup/teacher", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function checkEmail(email: string) {
    return apiRequest(`/auth/check-email?email=${encodeURIComponent(email)}`);
}
