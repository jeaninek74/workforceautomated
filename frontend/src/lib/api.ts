import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("wfa_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("wfa_token");
      localStorage.removeItem("wfa_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put("/api/auth/profile", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/api/auth/password", data),
};

// Agents
export const agentsApi = {
  list: (params?: { status?: string; search?: string }) =>
    api.get("/api/agents", { params }),
  get: (id: number) => api.get(`/api/agents/${id}`),
  create: (data: any) => api.post("/api/agents", data),
  update: (id: number, data: any) => api.put(`/api/agents/${id}`, data),
  delete: (id: number) => api.delete(`/api/agents/${id}`),
  generateFromJD: (jobDescription: string) =>
    api.post("/api/agents/generate-from-jd", { jobDescription }),
};

// Teams
export const teamsApi = {
  list: (params?: { status?: string }) => api.get("/api/teams", { params }),
  get: (id: number) => api.get(`/api/teams/${id}`),
  create: (data: any) => api.post("/api/teams", data),
  update: (id: number, data: any) => api.put(`/api/teams/${id}`, data),
  delete: (id: number) => api.delete(`/api/teams/${id}`),
};

// Executions
export const executionsApi = {
  list: (params?: { agentId?: number; teamId?: number; status?: string; limit?: number; page?: number }) =>
    api.get("/api/executions", { params }),
  get: (id: number) => api.get(`/api/executions/${id}`),
  create: (data: { agentId?: number; teamId?: number; input: string; type?: string }) =>
    api.post("/api/executions", data),
  cancel: (id: number) => api.post(`/api/executions/${id}/cancel`),
};

// Audit
export const auditApi = {
  list: (params?: {
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => api.get("/api/audit", { params }),
  export: (params?: any) => api.get("/api/audit/export", { params, responseType: "blob" }),
};

// Billing
export const billingApi = {
  getSubscription: () => api.get("/api/billing/subscription"),
  createCheckout: (data: { priceId: string; origin: string }) =>
    api.post("/api/billing/checkout", data),
  createPortal: (data: { origin: string }) => api.post("/api/billing/portal", data),
  getPlans: () => api.get("/api/billing/plans"),
};

// Metrics
export const metricsApi = {
  dashboard: () => api.get("/api/metrics/dashboard"),
  confidence: (params?: { period?: string }) =>
    api.get("/api/metrics/confidence", { params }),
  risk: () => api.get("/api/metrics/risk"),
  escalations: () => api.get("/api/metrics/escalations"),
  usage: (params?: { period?: string }) =>
    api.get("/api/metrics/usage", { params }),
};

// KPI
export const kpiApi = {
  list: () => api.get("/api/kpi"),
  create: (data: any) => api.post("/api/kpi", data),
  update: (id: number, data: any) => api.put(`/api/kpi/${id}`, data),
  delete: (id: number) => api.delete(`/api/kpi/${id}`),
};

// Governance
export const governanceApi = {
  getSettings: () => api.get("/api/governance/settings"),
  updateSettings: (data: any) => api.put("/api/governance/settings", data),
  getEscalations: () => api.get("/api/governance/escalations"),
  resolveEscalation: (id: number, notes: string) =>
    api.post(`/api/governance/escalations/${id}/resolve`, { notes }),
};
