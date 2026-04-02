import {
  getAccessToken,
  getRefreshToken,
  setStoredUser,
  setTokens,
  logoutLocal,
  type CurrentUser,
} from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000"
    : "https://intranet-backend-sand.vercel.app");

const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
}

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data === "string" && data.trim()) return data;
    if (data?.detail && typeof data.detail === "string") return data.detail;
    if (data && typeof data === "object") {
      const firstEntry = Object.entries(data)[0];
      if (firstEntry) {
        const [field, value] = firstEntry;
        if (Array.isArray(value) && value.length > 0) {
          return `${field}: ${String(value[0])}`;
        }
        if (typeof value === "string") {
          return `${field}: ${value}`;
        }
      }
    }
  } catch {
    // Ignore JSON parse errors and fallback to plain text handling below.
  }

  try {
    const text = await response.text();
    if (text.trim()) return text;
  } catch {
    // Ignore and use fallback.
  }

  return fallback;
}

// --- Types ---

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  department: number | Department; // API might return ID or object depending on serializer. Usually ID on write, object on read if nested. Assuming ID for now based on typical Django format, or check serializers.
  department_name?: string; // Optional helper
  assignee: number | null; // ID of user
  assignee_name?: string | null;
  created_by: number; // ID of user
  creator_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  user_id?: number | null;
  name: string;
  email: string;
  username?: string | null;
  password?: string;
  position: string;
  department: string; // Just a string in backend model
  role: string;
}

export interface DocumentItem {
  id: number;
  title: string;
  file: string; // URL
  author: number;
  author_name?: string;
  department: number; // ID
  department_name?: string;
  current_version: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: number;
  document: number;
  file: string;
  version_number: number;
  uploaded_by: number;
  created_at: string;
}

// --- Auth & Base Fetch ---

export async function authFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const access = getAccessToken();

  const doFetch = async (token: string | null) => {
    const headersRaw = new Headers(init?.headers);
    if (token) {
      headersRaw.set("Authorization", `Bearer ${token}`);
    }

    const headers: Record<string, string> = {};
    headersRaw.forEach((value, key) => {
      headers[key] = value;
    });

    return fetch(buildUrl(path), {
      ...init,
      credentials: "omit", // or "include" if using cookies
      headers,
    });
  };

  const first = await doFetch(access);
  if (first.status !== 401) return first;

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    logoutLocal(); // Logout if refresh fails
    return first; // Let the caller handle 401 or redirect
  }

  return doFetch(refreshed);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const response = await fetch(buildUrl("/api/auth/refresh/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const currentAccess = data.access;
    setTokens({ access: currentAccess, refresh: data.refresh || refresh });
    return currentAccess;
  } catch {
    return null;
  }
}

async function requestJsonOrThrow<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

// --- Auth Methods ---

export async function login(params: {
  username: string;
  password: string;
}): Promise<CurrentUser> {
  // Use generic request, no auth token needed for login
  const response = await fetch(buildUrl("/api/auth/login/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data = await response.json();
  setTokens({ access: data.access, refresh: data.refresh });
  return fetchMe();
}

export async function fetchMe(): Promise<CurrentUser> {
  const response = await authFetch("/api/auth/profile/");
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const user = (await response.json()) as CurrentUser;
  setStoredUser(user);
  return user;
}

export function logout(): void {
  logoutLocal();
}

// --- Data Methods ---

// Departments
export async function getDepartments(): Promise<Department[]> {
  const response = await authFetch(buildUrl("/api/departments/"));
  if (!response.ok) throw new Error("Failed to fetch departments");
  return response.json();
}

export async function createDepartment(name: string, description?: string): Promise<Department> {
  const response = await authFetch(buildUrl("/api/departments/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  if (!response.ok) throw new Error("Failed to create department");
  return response.json();
}

export async function deleteDepartment(id: number): Promise<void> {
  const response = await authFetch(buildUrl(`/api/departments/${id}/`), {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete department");
}

// Employees
export async function getEmployees(): Promise<Employee[]> {
  const response = await authFetch("/api/employees/");
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to fetch employees"));
  }
  return response.json();
}

export async function createEmployee(data: Partial<Employee>): Promise<Employee> {
  const response = await authFetch("/api/employees/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to create employee"));
  }
  return response.json();
}

export async function deleteEmployee(id: number): Promise<void> {
  const response = await authFetch(`/api/employees/${id}/`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete employee");
}

export async function updateEmployeeRole(
  id: number,
  role: "admin" | "manager" | "employee",
): Promise<Employee> {
  const response = await authFetch(`/api/employees/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to update employee role"));
  }
  return response.json();
}

// Tickets
export async function getTickets(): Promise<Ticket[]> {
  const response = await authFetch("/api/tickets/");
  if (!response.ok) throw new Error("Failed to fetch tickets");
  return response.json();
}

export async function createTicket(data: { title: string; description: string; department: number }): Promise<Ticket> {
  const response = await authFetch("/api/tickets/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create ticket");
  return response.json();
}

export async function updateTicketStatus(id: number, status: "in_progress" | "closed"): Promise<Ticket> {
  const response = await authFetch(`/api/tickets/${id}/change-status/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update status");
  return response.json();
}

export async function assignTicket(id: number, assigneeId: number): Promise<Ticket> {
  const response = await authFetch(`/api/tickets/${id}/assign/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignee: assigneeId }),
  });
  if (!response.ok) throw new Error("Failed to assign ticket");
  return response.json();
}

export async function deleteTicket(id: number): Promise<void> {
  const response = await authFetch(`/api/tickets/${id}/`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete ticket");
}

// Documents
export async function getDocuments(): Promise<DocumentItem[]> {
  const response = await authFetch("/api/documents/");
  if (!response.ok) throw new Error("Failed to fetch documents");
  return response.json();
}

export async function createDocument(formData: FormData): Promise<DocumentItem> {
  const response = await authFetch("/api/documents/", {
    method: "POST",
    // Content-Type header excluded to let browser set boundary for multipart/form-data
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to create document");
  return response.json();
}

export async function deleteDocument(id: number): Promise<void> {
  const response = await authFetch(`/api/documents/${id}/`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete document");
}

export async function uploadDocumentVersion(id: number, formData: FormData): Promise<void> {
  const response = await authFetch(`/api/documents/${id}/upload-version/`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to upload version");
}

