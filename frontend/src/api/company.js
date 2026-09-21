import API from "./client.js";

export const getAllCompanies = () => API.get("/api/companies");
export const getCompanyById = (id) => API.get(`/api/companies/${id}`);
export const getCompanyRoadmaps = async (companyId) => {
  try {
    return await API.get(`/api/companies/${companyId}/roadmaps`);
  } catch (err) {
    if (err.response?.status === 404) {
      return await API.get(`/api/companies/${companyId}/roadmap`);
    }
    throw err;
  }
};
export const getCompanyRoadmap = getCompanyRoadmaps;
export const createCompanyRoadmap = (companyId, data) => API.post(`/api/companies/${companyId}/roadmaps`, data);
