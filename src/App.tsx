import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "theme";
import { ErrorBoundary } from "./components";
import { QueryClient } from "react-query";
import toaster from "utils/toaster";
import { ReactQueryDevtools } from "react-query/devtools";

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        onError: (errorData: any) => {
          console.log(errorData);
          let errorMessage: any = "";
          if (errorData?.errors) {
            errorMessage = (
              <ErrorMapper
                errorObj={errorData.errors}
                fallbackText={errorData.message}
              />
            );
            toaster.error({ description: errorMessage });
          } else {
            errorMessage =
              errorData?.message ||
              errorData?.error?.message ||
              "Unable to fetch data";
            toaster.error({ description: errorMessage });
          }
        },
      },
      mutations: {
        retry: 0,
        onError: (errorData: unknown) => {
          console.log(errorData);
          let errorMessage: unknown = "";
          if (errorData?.errors) {
            errorMessage = (
              <ErrorMapper
                errorObj={errorData.errors}
                fallbackText={errorData.message}
              />
            );
            toaster.error({ description: errorMessage });
          } else {
            errorMessage =
              errorData?.message ||
              errorData?.error?.message ||
              "Unable to post data";
            toaster.error({ description: errorMessage });
          }
        },
        onSuccess: (data: any) => {
          if (data?.message) {
            toaster.success({ description: data?.message });
          }
        },
      },
    },
  });

  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ErrorBoundary>
    </ChakraProvider>
  );
};

export default App;
