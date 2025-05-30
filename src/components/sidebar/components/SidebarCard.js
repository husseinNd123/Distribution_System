import { Button, Flex, Link, Text, useColorModeValue } from "@chakra-ui/react";
// import logoWhite from "assets/img/layout/logoWhite.png";
import React from "react";
import Logo from "assets/img/layout/logoWhite.png";

export default function SidebarDocs() {
  const bgColor = "linear-gradient(135deg, #FF8E8E 0%, blue 10%, blue  100%)";
  const borderColor = useColorModeValue("white", "navy.800");

  return (
    <Flex
      justify="center"
      direction="column"
      align="center"
      bg={bgColor}
      borderRadius="30px"
      mb={4}
      position="relative"
    >
      <Flex
        border="5px solid"
        borderColor={borderColor}
        // backgroundImage={Logo}
        backgroundSize={"cover"}
        borderRadius="50%"
        w="94px"
        h="94px"
        align="center"
        justify="center"
        mx="auto"
        position="absolute"
        left="50%"
        top="-47px"
        transform="translate(-50%, 0%)"
      ></Flex>
      <Flex
        direction="column"
        mb="12px"
        align="center"
        justify="center"
        px="15px"
        pt="55px"
      >
        <Text
          fontSize={{ base: "lg", xl: "18px" }}
          color="white"
          fontWeight="bold"
          lineHeight="150%"
          textAlign="center"
          px="10px"
          mt="10px"
          mb="6px"
        >
          Student Distribution System
        </Text>
        <Text
          fontSize="14px"
          color={"white"}
          fontWeight="500"
          px="10px"
          mb="6px"
          textAlign="center"
        >
          Developed By Hussein Noureddine, Majid, Barakat 
        </Text>
      </Flex>
      <Link href="https://Hisoftlb.com">
        <Button
          bg="whiteAlpha.300"
          _hover={{ bg: "whiteAlpha.200" }}
          _active={{ bg: "whiteAlpha.100" }}
          mb={{ sm: "16px", xl: "24px" }}
          color={"white"}
          fontWeight="regular"
          fontSize="sm"
          minW="185px"
          mx="auto"
        >
          Contact Us
        </Button>
      </Link>
    </Flex>
  );
}
