import { toast } from "sonner";
import i18n from "../../i18n";

const callApi = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  variables?: any,
  multipartForm: boolean = false,
  showToast: boolean = true
) => {
  const token = localStorage.getItem("token");
  const selectedLocationId = localStorage.getItem("selectedLocationId");

  let headers: HeadersInit = {};

  if (token) {
    headers["x-auth-token"] = token;
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (selectedLocationId) {
    headers["x-location-id"] = selectedLocationId;
  }

  let body: BodyInit | null = null;
  let hasBody = method !== "GET" && method !== "DELETE";

  if (hasBody) {
    if (multipartForm) {
      const formData = new FormData();
      if (variables) {
        Object.keys(variables).forEach((key) => {
          const value = variables[key];
          if (Array.isArray(value)) {
            value.forEach((file) => formData.append(key, file));
          } else {
            formData.append(key, value);
          }
        });
      }
      body = formData;
    } else {
      headers["Content-Type"] = "application/json";
      if (variables) {
        body = JSON.stringify(variables);
      }
    }
  }

  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  let result: Response;
  try {
    result = await fetch(`${url}${endpoint}`, {
      method: method,
      headers: headers,
      body: body,
      cache: "no-store",
    });
  } catch (fetchError: any) {
    console.error("Network or fetch error:", fetchError);
    if (showToast) {
      toast.error(
        i18n.t("api_errors.NETWORK_ERROR", {
          defaultValue: "Network error. Please check your connection.",
        })
      );
    }
    throw fetchError;
  }

  // Safe JSON parsing function
  const safeJson = async (response: Response) => {
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      return null;
    }
  };

  if (!result.ok) {
    console.error("API error status:", result.status, result.statusText);
    const errorData = await safeJson(result);

    // Handle 401 Unauthorized
    if (result.status === 401) {
      console.warn("Unauthorized access detected");
      localStorage.removeItem("token");

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const publicPaths = [
          "/business",
          "/home",
          "/about",
          "/pricing",
          "/for-business",
        ];
        const isPublicPage = publicPaths.some((path) =>
          currentPath === path || currentPath.startsWith(path + "/")
        );

        if (!isPublicPage && currentPath !== "/login") {
          window.location.href = "/login";
          // Create a special error to stop execution
          const redirectError = new Error("Redirecting to login...");
          (redirectError as any).isRedirect = true;
          throw redirectError;
        }
      }
    }

    // Handle localized error messages
    if (showToast) {
      if (errorData && errorData.errorCode) {
        const translationKey = `api_errors.${errorData.errorCode}`;
        const translatedMessage = i18n.t(translationKey, {
          defaultValue: errorData.message,
        });
        toast.error(translatedMessage);
      } else {
        // Fallback generic error toast if no specific errorCode
        const genericMessage =
          errorData?.message ||
          i18n.t("api_errors.GENERIC_ERROR", {
            defaultValue: "Something went wrong. Please try again.",
          });
        toast.error(genericMessage);
      }
    }

    const error: any = new Error(
      errorData?.message || `API error - ${result.statusText}`
    );
    error.errorCode = errorData?.errorCode;
    error.status = result.status;
    error.data = errorData;
    throw error;
  }

  const data = await safeJson(result);

  if (!data) {
    throw new Error("Invalid response format from server");
  }

  // Handle success messages if present
  if (data.messageCode && method !== "GET" && showToast) {
    const translationKey = `success_messages.${data.messageCode}`;
    const translatedMessage = i18n.t(translationKey, {
      defaultValue: data.message,
    });
    toast.success(translatedMessage);
  }

  // Support backward compatibility by returning the wrapped data if it exists
  return data.data !== undefined ? data.data : data;
};

export default callApi;
