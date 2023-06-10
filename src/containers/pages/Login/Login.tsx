import { Box, Grid, Image } from "@chakra-ui/react";
import React from "react";
import { imgLogin } from "@/assets/images";
interface ILogin {
  [rest: string]: unknown;
}

const Login: React.FC<ILogin> = () => {
  return (
    <Grid templateColumns='repeat(2, 1fr)' minH='100vh'>
      <Box h='100%'>
        <Image
          src={imgLogin}
          alt='Holding hands with one hand with a ring'
          objectFit='cover'
          h='100%'
          w='100%'
          borderRadius='0 350px 350px 0'
          maxH='100vh'
        />
      </Box>
      <Box h='100%'></Box>
    </Grid>
  );
};

export default Login;
