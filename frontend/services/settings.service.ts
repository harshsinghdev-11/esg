import api from "../lib/api";

export const settingsService = {
  getConfig: () => api.get("/settings/esg-configuration"),
  updateConfig: (data: any) => api.patch("/settings/esg-configuration", data)
};
