import React from "react";
import { Formik, Form } from "formik";
import {
  ILoginValues,
  initialLoginValues,
  loginValidationSchema,
} from "./schema";
import { FormikInput } from "@/components/Formik";
import {
  Button,
  Icon,
  IconButton,
  InputRightElement,
  useDisclosure,
} from "@chakra-ui/react";
import { IconArrowRight, IconEye, IconEyeSlash } from "@/assets/icons";

const LoginForm = () => {
  const handleFormSubmit = (values: ILoginValues) => {
    console.log(values);
  };

  const { isOpen: showPassword, onToggle: togglePassword } = useDisclosure();

  return (
    <Formik
      enableReinitialize
      initialValues={initialLoginValues}
      validationSchema={loginValidationSchema}
      onSubmit={handleFormSubmit}
    >
      {() => (
        <Form noValidate>
          <FormikInput
            name='name'
            type='text'
            label='Name'
            inputProps={{
              placeholder: "Enter your name",
            }}
            formControlProps={{
              isRequired: true,
            }}
          />
          <FormikInput
            name='password'
            type={showPassword ? "text" : "password"}
            label='Password'
            formControlProps={{
              isRequired: true,
            }}
            inputProps={{
              placeholder: "Enter your password",
            }}
            inputElement={
              <InputRightElement pr={4}>
                <IconButton
                  as={showPassword ? IconEyeSlash : IconEye}
                  variant='unstyled'
                  onClick={togglePassword}
                  w={showPassword ? "26px" : "16px"}
                  h={showPassword ? "26px" : "16px"}
                  cursor='pointer'
                />
              </InputRightElement>
            }
          />
          <Button
            rightIcon={<Icon as={IconArrowRight} />}
            variant='primary-brown'
            size='lg'
            fontWeight='400'
            fontSize='md'
            mt={10}
            type='submit'
          >
            Log in
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
