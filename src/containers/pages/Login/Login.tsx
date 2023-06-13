import { Box, Grid, Heading, Image, Stack } from "@chakra-ui/react";
import React from "react";
import { imgLogin, imgLogo } from "@/assets/images";
import LoginForm from "./LoginForm";
interface ILogin {
  [rest: string]: unknown;
}

const Login: React.FC<ILogin> = () => {
  return (
    <Grid
      templateColumns={["1fr", null, "repeat(2, 1fr)"]}
      minH='100vh'
      gridTemplateRows={["0", null, "1fr"]}
    >
      <Box h={[null, "50%", "100%"]}>
        <Image
          src={imgLogin}
          alt='Holding hands with one hand with a ring'
          objectFit='cover'
          h='100%'
          w='100%'
          borderRadius={[null, 0, "0 350px 350px 0"]}
          maxH='100vh'
        />
      </Box>
      <Stack h='100%' alignItems='center' pt={7}>
        <Image
          src={imgLogo}
          alt='Nudge - For Ysela, by Riley'
          objectFit='contain'
          h={["100px", null, "135px"]}
          w={["225px", null, "370px"]}
          mb={"32"}
        />
        <Heading
          w='100%'
          textAlign='center'
          fontFamily='rochester'
          fontWeight={400}
          fontSize={["4xl", "5xl"]}
          mb={10}
        >
          Get Nudged to your partner
        </Heading>
        <Box w={["90%", "90%", "55%"]}>
          <LoginForm />
        </Box>
      </Stack>
    </Grid>
  );
};

export default Login;
