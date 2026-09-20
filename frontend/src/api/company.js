import API from "./client.js";

export const getAllCompanies = () => API.get("/api/companies");
export const getCompanyById = (id) => API.get(`/api/companies/${id}`);
export const getCompanyRoadmaps = (companyId) => API.get(`/api/companies/${companyId}/roadmaps`);
