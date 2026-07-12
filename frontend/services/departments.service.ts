import api from "../lib/api";

export const departmentsService = {
  list: () => api.get("/departments"),
  create: (name: string, headEmployeeId: string) => api.post("/departments", { name, headEmployeeId }),
  delete: (id: string) => api.delete(`/departments/${id}`)
};
