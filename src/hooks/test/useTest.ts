import { endpoints } from "@/global/endpoints";
import http from "@/utils/http";
import { useQuery } from "react-query";

const test = () => {
  return http().get(endpoints.test);
};

export function useTest() {
  return useQuery(["test"], () => test(), {
    onSettled: (data: any) => console.log(data),
  });
}
