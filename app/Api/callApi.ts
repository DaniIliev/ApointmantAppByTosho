const callApi = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  variables?: any
) => {
  const result: any = await fetch(`http://localhost:8080${endpoint}`, {
    method: method,
    headers: { "Content-Type": "application/json" },
    ...(variables && { body: JSON.stringify(variables) }),
  });
  return await result.json();
};

export default callApi;
