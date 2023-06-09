import { Box, Heading, Text } from "@chakra-ui/react";
import React, { ErrorInfo } from "react";

import Button from "components/Button";

interface IState {
  /** Flag to indicate if error captured or not */
  hasError: boolean;
}

class ErrorBoundary extends React.Component<any, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
    };

    this.refreshPage = this.refreshPage.bind(this);
  }

  static getDerivedStateFromError(): IState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.log({ error: error, errorInfo: info });
    }
  }

  refreshPage() {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          height='60vh'
          textAlign='center'
          role='alert'
        >
          <div>
            <Heading as='h2'>Something went wrong.</Heading>
            <Text my={2}>
              Oops, looks like there is an error. We are on it!
            </Text>
            <Button onClick={this.refreshPage}>Refresh page</Button>
          </div>
        </Box>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
