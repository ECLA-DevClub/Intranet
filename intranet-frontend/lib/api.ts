import { documents, employees, tickets } from "./mockData";
import type { DocumentItem, Employee, Ticket } from "./mockData";
import {
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  logoutLocal,
  setStoredUser,
  setTokens,
  type CurrentUser,
} from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://intranet-prodd-production.up.railway.app";

const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");
const useMocks = normalizedBaseUrl.length === 0;

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
}

type TokenPairResponse = {
  access: string;
  refresh: string;
};

type RefreshResponse = {
  access: string;
};

type DepartmentApi = {
  id: number;
  name: string;
  description?: string;
};

type TicketApi = {
  id: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  department: number;
  assignee: number | null;
  assignee_name?: string | null;
  created_by: number;
  creator_name?: string;
  created_at: string;
  updated_at: string;
};

type EmployeeApi = {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  role: string;
};

type DocumentApi = {
  id: number;
  title: string;
  file: string;
  author: number;
  author_name?: string;
  department: number;
  current_version: number;
  created_at: string;
  updated_at: string;
};

let departmentsCache: DepartmentApi[] | null = null;
let departmentsCacheAt = 0;

function formatDateTimeRu(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getDepartmentsCached(): Promise<DepartmentApi[]> {
  // простое кэширование на 5 минут
  const now = Date.now();
  if (departmentsCache && now - departmentsCacheAt < 5 * 60 * 1000) {
    return departmentsCache;
  }
  const response = await authFetch("/api/departments/");
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const data = (await response.json()) as DepartmentApi[];
  departmentsCache = data;
  departmentsCacheAt = now;
  return data;
}

function mapDepartmentName(departments: DepartmentApi[], id: number): string {
  return departments.find((d) => d.id === id)?.name ?? `Dept #${id}`;
}

function mapTicket(api: TicketApi): Ticket {
  const status: Ticket["status"] =
    api.status === "open"
      ? "Open"
      : api.status === "in_progress"
        ? "In Progress"
        : "Resolved";

  return {
    apiId: api.id,
    id: `TCK-${api.id}`,
    title: api.title,
    status,
    priority: "Medium",
    requester: api.creator_name ?? "-",
    assignee: api.assignee_name ?? "-",
    updated: formatDateTimeRu(api.updated_at),
    category: "General",
  };
}

function mapEmployee(api: EmployeeApi): Employee {
  return {
    apiId: api.id,
    id: `EMP-${api.id}`,
    name: api.name,
    role: api.position || api.role || "-",
    department: api.department ?? "-",
    email: api.email ?? "-",
    location: "-",
    status: "Active",
  };
}

function mapDocument(api: DocumentApi, departments: DepartmentApi[]): DocumentItem {
  return {
    apiId: api.id,
    id: `DOC-${api.id}`,
    title: api.title,
    category: "-",
    department: mapDepartmentName(departments, api.department),
    owner: api.author_name ?? "-",
    updated: formatDateTimeRu(api.updated_at),
    access: "Internal",
  };
}

async function requestJsonOrThrow<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const message = text || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const data = await requestJsonOrThrow<RefreshResponse>(
      "/api/auth/token/refresh/",
      {
        method: "POST",
        body: JSON.stringify({ refresh }),
      },
    );
    const currentAccess = data.access;
    const existingRefresh = getRefreshToken();
    if (!existingRefresh) return null;

    setTokens({ access: currentAccess, refresh: existingRefresh });
    return currentAccess;
  } catch {
    return null;
  }
}

export async function authFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const access = getAccessToken();

  const doFetch = async (token: string | null) => {
    return fetch(buildUrl(path), {
      ...init,
      credentials: "omit",
      headers: {
        ...(init?.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  const first = await doFetch(access);
  if (first.status !== 401) return first;

  const refreshed = await refreshAccessToken();
  if (!refreshed) return first;

  return doFetch(refreshed);
}

export async function fetchMe(): Promise<CurrentUser> {
  const response = await authFetch("/api/auth/me/");
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const user = (await response.json()) as CurrentUser;
  setStoredUser(user);
  return user;
}

export async function login(params: {
  username: string;
  password: string;
}): Promise<CurrentUser> {
  const data = await requestJsonOrThrow<TokenPairResponse>("/api/auth/token/", {
    method: "POST",
    body: JSON.stringify(params),
  });

  setTokens({ access: data.access, refresh: data.refresh });
  return fetchMe();
}

export function logout(): void {
  logoutLocal();
}

export async function getEmployees(): Promise<Employee[]> {
  if (useMocks) {
    return employees;
  }

  try {
    const response = await authFetch("/api/employees/");
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const data = (await response.json()) as EmployeeApi[];
    return data.map(mapEmployee);
  } catch {
    return employees;
  }
}

export async function getTickets(): Promise<Ticket[]> {
  if (useMocks) {
    return tickets;
  }

  try {
    const response = await authFetch("/api/tickets/");
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const data = (await response.json()) as TicketApi[];
    return data.map(mapTicket);
  } catch {
    return tickets;
  }
}

export async function getDocuments(): Promise<DocumentItem[]> {
  if (useMocks) {
    return documents;
  }

  try {
    const [departments, docsResponse] = await Promise.all([
      getDepartmentsCached(),
      authFetch("/api/documents/"),
    ]);

    if (!docsResponse.ok) {
      throw new Error(`Request failed: ${docsResponse.status}`);
    }
    const data = (await docsResponse.json()) as DocumentApi[];
    return data.map((item) => mapDocument(item, departments));
  } catch {
    return documents;
  }
}

export async function createTicket(params: {
  title: string;
  description: string;
  department?: number;
}): Promise<Ticket> {
  const me = getStoredUser();
  const department = params.department ?? me?.department ?? null;
  if (!department) {
    throw new Error("Не удалось определить департамент пользователя");
  }

  const response = await authFetch("/api/tickets/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: params.title,
      description: params.description,
      department,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }

  const created = (await response.json()) as TicketApi;
  return mapTicket(created);
}

export async function deleteTicket(apiId: number): Promise<void> {
  const response = await authFetch(`/api/tickets/${apiId}/`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 204) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }
}

export async function createEmployee(params: {
  name: string;
  email: string;
  position: string;
  department: string;
  role: string;
}): Promise<Employee> {
  const response = await authFetch("/api/employees/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }

  const created = (await response.json()) as EmployeeApi;
  return mapEmployee(created);
}

export async function deleteEmployee(apiId: number): Promise<void> {
  const response = await authFetch(`/api/employees/${apiId}/`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 204) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }
}

export async function deleteDocument(apiId: number): Promise<void> {
  const response = await authFetch(`/api/documents/${apiId}/`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 204) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }
}
