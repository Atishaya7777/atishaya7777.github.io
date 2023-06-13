import { REQUIRED_ERROR } from "@/global/appConstants";
import { object, string, InferType } from "yup";

const loginValidationSchema = object({
  name: string().required(REQUIRED_ERROR),
  password: string().required(REQUIRED_ERROR),
});

type ILoginValues = InferType<typeof loginValidationSchema>;

const initialLoginValues: ILoginValues = {
  name: "",
  password: "",
};

export { initialLoginValues, loginValidationSchema, ILoginValues };
