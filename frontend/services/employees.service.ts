import api from "../lib/api";

export const employeesService = {
  list: () => api.get("/employees"),
  create: (fullName: string, email: string, role: string, departmentId: string) => 
    api.post("/employees", { fullName, email, role, departmentId, employeeCode: "EMP-" + Math.floor(Math.random() * 10000) }),
  delete: (id: string) => api.delete(`/employees/${id}`)
};
