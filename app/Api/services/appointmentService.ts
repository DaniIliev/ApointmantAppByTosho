import callApi from "../callApi";

//POST QUERIES
export const createAppointment = async (data: any) => {
  const response = await callApi(`/api/appointment`, "POST", data);
  console.log("response", response);
  return response;
};
