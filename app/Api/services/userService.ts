import callApi from "../callApi";

export const findUserByID = async (id: string, showToast: boolean = true) => {
  const response = await callApi(
    `/api/auth/user/${id}`,
    "GET",
    null,
    false,
    showToast,
  );
  return response;
};
