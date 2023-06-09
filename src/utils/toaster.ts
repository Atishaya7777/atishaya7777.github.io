import {
  createStandaloneToast,
  UseToastOptions,
  ToastPosition,
} from "@chakra-ui/react";

const Ctoast = createStandaloneToast();

const defaultOptions = {
  isClosable: true,
  duration: 3000,
  position: "top" as ToastPosition,
};

const toaster = {
  success: (options: UseToastOptions) =>
    Ctoast({ status: "success", ...defaultOptions, ...options }),
  warning: (options: UseToastOptions) =>
    Ctoast({ status: "warning", ...defaultOptions, ...options }),
  info: (options: UseToastOptions) =>
    Ctoast({ status: "info", ...defaultOptions, ...options }),
  error: (options: UseToastOptions) =>
    Ctoast({ status: "error", ...defaultOptions, ...options }),
};

export default toaster;
