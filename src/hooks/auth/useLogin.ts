import { endpoints } from "@/global/endpoints";
import http from "@/utils/http";
import { useMutation } from "react-query";

export interface ILogin {
  Username: string;
  Password: string;
}

const login = (postData: ILogin) => {
  return http().post(endpoints.login, postData);
};

export function useLogin() {
  return useMutation(login, {
    onSuccess: ({ payload }) => {
      console.log(payload);
    },
  });
}
