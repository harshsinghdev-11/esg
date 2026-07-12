import api from "../lib/api";

function generateDepartmentCode(name: string) {
  const base = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase())
    .join("")
    .slice(0, 8);

  return base || `DEPT${Date.now().toString().slice(-4)}`;
}

export const departmentsService = {
  list: () => api.get("/departments"),
  create: (name: string, headEmployeeId?: string) =>
    api.post("/departments", { name, code: generateDepartmentCode(name), headEmployeeId: headEmployeeId || undefined }),
  delete: (id: string) => api.delete(`/departments/${id}`)
};
