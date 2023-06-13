import { imgLogo } from "@/assets/images";
import { IconProfile } from "@/assets/icons";
import {
  Button,
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import React from "react";

const Header = () => {
  return (
    <Flex
      w='100%'
      bg='secondary.100'
      py={4}
      px={16}
      justifyContent='space-between'
      alignItems='center'
    >
      <Image
        src={imgLogo}
        alt='Nudge - For Ysela, by Riley'
        w='100px'
        h='35px'
      />
      <Text fontFamily='rochester' fontSize='3xl'>
        Ysela & Riley
      </Text>
      <Menu bg='secondary.100'>
        <MenuButton
          as={Button}
          variant='unstyled'
          h='35px'
          w='35px'
          _hover={{
            bg: "",
          }}
        >
          <Icon as={IconProfile} w='full' h='full' />
        </MenuButton>
        <MenuList bg='secondary.100'>
          <MenuItem
            sx={{
              color: "primary.500",
              bg: "secondary.100",
              _hover: {
                transition: "all ease 0.3s",
                bg: "white",
              },
            }}
          >
            Log out
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default Header;
