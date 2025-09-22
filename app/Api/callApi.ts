const callApi = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  variables?: any,
  multipartForm: boolean = false
) => {
  const token = localStorage.getItem("token");

  let headers: HeadersInit = {};

  if (token) {
    headers["x-auth-token"] = token;
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

  const result: any = await fetch(`http://localhost:8080${endpoint}`, {
    method: method,
    headers: headers,
    body: body,
  });

  if (!result.ok) {
    console.error("API error:", result);
    const errorData = await result.json();
    throw new Error(errorData.message || `API error - ${result.statusText}`);
  }

  return await result.json();
};

export default callApi;

// const callApi = async (
//   endpoint: string,
//   method: "GET" | "POST" | "PUT" | "DELETE",
//   variables?: any
// ) => {
//   const token = localStorage.getItem("token");

//   const headers: HeadersInit = {
//     "Content-Type": "application/json",
//   };

//   if (token) {
//     headers["x-auth-token"] = token;
//   }

//   const result: any = await fetch(`http://localhost:8080${endpoint}`, {
//     method: method,
//     headers: headers,
//     ...(variables && { body: JSON.stringify(variables) }),
//   });

//   return await result.json();
// };

// export default callApi;
