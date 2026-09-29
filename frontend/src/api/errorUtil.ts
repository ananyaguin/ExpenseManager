export const getErrorMessage = (error: any): string => {
  if (!error) return "Something went wrong. Please try again.";

  // If already string
  if (typeof error === "string") return error;

  // Axios response error
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 403) {
      if (typeof data === "object" && data?.message) {
        if (data.message.toLowerCase().includes("active") || data.message.toLowerCase().includes("activate")) {
          return "Your account is not activated yet. Please check your email.";
        }
        return data.message;
      }
      return "Your account is not activated yet. Please check your email.";
    }

    if (status === 401) {
      return "Session expired or unauthorized. Please log in again.";
    }

    if (status === 404) {
      return (typeof data === "string" && data) || (data?.message) || "Resource not found.";
    }

    if (status >= 500) {
      return "Internal server error. Please try again later.";
    }

    if (data) {
      if (typeof data === "string") return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
    }
  }

  // Network or timeout errors
  if (error.code === "ECONNABORTED") {
    return "Request timed out. Please check your connection.";
  }

  if (error.message === "Network Error" || !error.response) {
    return "Unable to connect to the server. Please verify the backend is running at http://localhost:8080.";
  }

  return error.message || "Something went wrong. Please try again.";
};
