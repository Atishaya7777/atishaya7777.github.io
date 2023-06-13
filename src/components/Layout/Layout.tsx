import { Box } from "@chakra-ui/react";
import React from "react";
import { Header, Footer } from "@/components";

interface ILayout {
  children?: React.ReactNode;
}

const Layout: React.FC<ILayout> = ({ children }) => {
  return (
    <Box>
      <Header />
      <Box>
        {children}
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
