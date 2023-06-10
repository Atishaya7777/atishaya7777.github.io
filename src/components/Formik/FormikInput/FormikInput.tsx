import React from "react";
import {
  Input,
  FormControl,
  FormLabel,
  InputProps,
  FormControlProps,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { Field, FieldProps, ErrorMessage } from "formik";

export interface IFormikInput {
  label?: React.ReactNode;
  labelElement?: React.ReactNode;
  labelProps?: any;
  name: string;
  type?: string;
  onChangeCallback?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  formControlProps?: FormControlProps;
  inputProps?: InputProps;
  inputElement?: React.ReactNode;
}

const FormikInput: React.FC<IFormikInput> = ({
  label,
  labelElement,
  labelProps,
  name,
  type,
  onChangeCallback,
  formControlProps,
  inputProps,
  inputElement,
}) => {
  return (
    <Field name={name}>
      {({ field, meta }: FieldProps) => {
        return (
          <FormControl
            mb='6'
            {...formControlProps}
            id={name}
            isInvalid={(meta.error && meta.touched) || false}
          >
            {label ? (
              <FormLabel
                htmlFor={name}
                color='primary.1000'
                fontSize='sm'
                fontWeight='600'
                mb='1'
                {...labelProps}
              >
                {label}
                {labelElement}
              </FormLabel>
            ) : null}
            <InputGroup size='lg'>
              <Input
                {...field}
                {...inputProps}
                onChange={(event) => {
                  if (onChangeCallback) {
                    onChangeCallback(event);
                  }
                  field.onChange(event);
                }}
                borderRadius='4px'
                fontSize='md'
                type={type}
                border='1px'
                borderColor='inherit'
              />
              {inputElement && inputElement}
            </InputGroup>
            <ErrorMessage name={name}>
              {(msg) => (
                <Text color='error.500' fontSize='sm' mt={1}>
                  {msg}
                </Text>
              )}
            </ErrorMessage>
          </FormControl>
        );
      }}
    </Field>
  );
};

export default FormikInput;
