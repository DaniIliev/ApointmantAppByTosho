import callApi from "../callApi";

export const findUserByID = async (id: string) => {
  const response = await callApi(`/api/auth/user/${id}`, "GET");
  return response;
};
