import {
  Flex,
  Spinner,
  Text,
} from '@chakra-ui/react';

const Loader = () => {
  return (
    <Flex w="100%" h="100vh" alignItems="center" justifyContent="center">
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap="sp32"
      >
        <Spinner size="xl" color="primary.800" />
        <Text textStyle="heading_1.dark">Loading</Text>
      </Flex>
    </Flex>
  );
};

export default Loader;
