const callApi = (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  variables: any
) => {
  return fetch(`http://localhost:8080${endpoint}`, {
    method: method,
    headers: { "Content-Type": "application/json" },
    ...(variables && { body: JSON.stringify(variables) }),
  });
};

export default callApi;
