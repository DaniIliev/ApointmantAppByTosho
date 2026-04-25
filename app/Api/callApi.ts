import { redirect } from "next/navigation";
import { toast } from "sonner";
import i18n from "../../i18n";

const callApi = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  variables?: any,
  multipartForm: boolean = false
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

  const result: any = await fetch(`${url}${endpoint}`, {
    method: method,
    headers: headers,
    body: body,
    cache: "no-store",
  });

  if (!result.ok) {
    console.error("API error:", result);
    const errorData = await result.json();

    // Handle 401 Unauthorized - only redirect for protected routes
    if (result.status === 401) {
      console.warn("Unauthorized access detected");
      localStorage.removeItem("token"); // Clear invalid token

      // Don't redirect on public pages (business pages, home, etc.)
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const publicPaths = [
          "/business/",
          "/home",
          "/about",
          "/pricing",
          "/for-business",
        ];
        const isPublicPage = publicPaths.some((path) =>
          currentPath.startsWith(path)
        );

        if (!isPublicPage) {
          redirect("/login");
        }
      }
    }

    // Handle localized error messages
    if (errorData.errorCode) {
      const translationKey = `api_errors.${errorData.errorCode}`;
      const translatedMessage = i18n.t(translationKey, { defaultValue: errorData.message });
      toast.error(translatedMessage);
    }

    const error: any = new Error(errorData.message || `API error - ${result.statusText}`);
    error.errorCode = errorData.errorCode;
    error.status = result.status;
    error.data = errorData;
    throw error;
  }

  const data = await result.json();

  // Handle success messages if present
  if (data.messageCode && method !== "GET") {
    const translationKey = `success_messages.${data.messageCode}`;
    const translatedMessage = i18n.t(translationKey, { defaultValue: data.message });
    toast.success(translatedMessage);
  }

  // Support backward compatibility by returning the wrapped data if it exists
  return data.data !== undefined ? data.data : data;
};

export default callApi;
