import api from "../lib/api";

export const categoriesService = {
  list: (type?: string) => api.get(type ? `/categories?type=${type}` : "/categories"),
  create: (type: string, name: string) => api.post("/categories", { type, name, description: name }),
  delete: (id: string) => api.delete(`/categories/${id}`)
};
