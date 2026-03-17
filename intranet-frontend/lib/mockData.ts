export type Employee = {
  apiId?: number;
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  location: string;
  status: "Active" | "Remote" | "On Leave";
};

export type Ticket = {
  apiId?: number;
  id: string;
  title: string;
  status: "Open" | "In Progress" | "Resolved" | "Waiting";
  priority: "Low" | "Medium" | "High" | "Critical";
  requester: string;
  assignee: string;
  updated: string;
  category: string;
};

export type DocumentItem = {
  apiId?: number;
  id: string;
  title: string;
  category: string;
  department: string;
  owner: string;
  updated: string;
  access: "Public" | "Internal" | "Restricted";
};

export const employees: Employee[] = [];

export const tickets: Ticket[] = [];

export const documents: DocumentItem[] = [];
