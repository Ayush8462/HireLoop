import API from "./client";

export const sendChatMessage = async (message, history = [], userRole = "guest") => {
  const response = await API.post("/api/chatbot/chat", {
    message,
    history,
    user_role: userRole,
  });
  return response.data;
};

export const getChatbotSuggestions = async () => {
  const response = await API.get("/api/chatbot/suggestions");
  return response.data;
};

export const getChatbotStats = async () => {
  const response = await API.get("/api/chatbot/stats");
  return response.data;
};
