import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import dayjs from "dayjs";
export const handleApiError = (error, fallbackMessage = "Something went wrong") => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return fallbackMessage;
};

export const useUserPath = () => {
  const { user } = useAuth();

  return (path = "") => `/${user?.user_id}${path}`;
};

export const dateFormate=(date=new Date(),formate="dd/mm/yyyy")=>{
  return dayjs(date).format(formate);
}