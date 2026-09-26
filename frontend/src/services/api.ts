import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  register: (data: { name: string; phone: string; role: "donor" | "shelter" | "volunteer"; latitude: number; longitude: number; email?: string }) =>
    apiClient.post("/auth/register", data),
  login: (data: { phone: string; role: "donor" | "shelter" | "volunteer" }) =>
    apiClient.post("/auth/login", data),
};

export const donorService = {
  postSurplus: (data: { donor_id: number; food_name: string; servings: number; expiry_time: string }) =>
    apiClient.post("/donor/post-surplus", data),
  getActiveListings: () => apiClient.get("/donor/active-listings"),
};

export const shelterService = {
  claimFood: (donationId: number, data: { shelter_id: number; requested_servings: number }) =>
    apiClient.post(`/shelter/claim/${donationId}`, data),
};

export const volunteerService = {
  getAvailableTasks: () => apiClient.get("/volunteer/available-tasks"),
  getActiveTask: (volunteerId: number) => apiClient.get(`/volunteer/my-active-task/${volunteerId}`),
  acceptTask: (data: { volunteer_id: number; delivery_id: number }) =>
    apiClient.post("/volunteer/accept-task", data),
  verifyOtp: (data: { delivery_id: number; otp: string; step: "pickup" | "drop" }) =>
    apiClient.post("/volunteer/verify-otp", data),
};

export const analyticsService = {
  getSummary: () => apiClient.get("/analytics/summary"),
};