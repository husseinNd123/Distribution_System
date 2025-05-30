import React, { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Flex,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  //  MdNotificationsNone,
  MdInfoOutline,
} from "react-icons/md";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";

// import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { SidebarResponsive } from "components/sidebar/Sidebar";
import routes from "routes.js";

const NavbarLinksAdmin = (props) => {
  const { secondary } = props;
  const [elapsedTime, setElapsedTime] = useState("");

  const navbarIcon = useColorModeValue("gray.400", "white");
  let menuBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.700", "red.400");
  const ethColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("#E6ECFA", "rgba(135, 140, 189, 0.3)");
  const ethBg = useColorModeValue("secondaryGray.300", "navy.900");
  const ethBox = useColorModeValue("white", "navy.800");
  const shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
    "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
  );
  // const borderButton = useColorModeValue('secondaryGray.500', 'whiteAlpha.200');

  const history = useHistory();

  const getUsername = () => {
    // Gets the username from the local storage
    return localStorage.getItem("username") || "User";
  };

  const profile = () => {
    history.push("/admin/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("accessToken");
    localStorage.clear();
    history.push("/auth/signIn");
    console.log(
      localStorage.getItem("username"),
      " ",
      localStorage.getItem("accessToken")
    );
  };

  useEffect(() => {
    const updateElapsedTime = () => {
      const loginTimestamp = localStorage.getItem("loginTimestamp");
      if (loginTimestamp) {
        const loginTime = new Date(loginTimestamp);
        const now = new Date();
        const difference = now - loginTime; // Difference in milliseconds

        // Convert milliseconds to hours, minutes, and seconds
        let seconds = Math.floor((difference / 1000) % 60);
        let minutes = Math.floor((difference / (1000 * 60)) % 60);
        let hours = Math.floor((difference / (1000 * 60 * 60)) % 24);

        // Formatting for display
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      }
    };

    // Update the elapsed time every second
    const interval = setInterval(updateElapsedTime, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <Flex
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: "wrap", md: "nowrap" } : "unset"}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      <SidebarResponsive routes={routes} />
      <Menu>
        <MenuButton p="0px">
          <Icon
            mt="6px"
            as={MdInfoOutline}
            color={navbarIcon}
            w="18px"
            h="18px"
            me="10px"
          />
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="20px"
          me={{ base: "30px", md: "unset" }}
          borderRadius="20px"
          bg={menuBg}
          border="none"
          mt="22px"
          minW={{ base: "unset" }}
          maxW={{ base: "360px", md: "unset" }}
        >
          <Flex flexDirection="column">
            <Link w="100%" href="https://Hisoftlb.com">
              <Button
                w="100%"
                h="44px"
                variant="no-hover"
                color={textColor}
                bg="transparent"
              >
                Designed And Developed By HiSoft
              </Button>
            </Link>
          </Flex>
        </MenuList>
      </Menu>

      {/* <ThemeEditor navbarIcon={navbarIcon} /> */}

      <Menu>
        <MenuButton p="0px">
          <Avatar
            _hover={{ cursor: "pointer" }}
            color="white"
            name={getUsername()}
            bg="#11047A"
            size="sm"
            w="40px"
            h="40px"
          />
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="0px"
          mt="10px"
          borderRadius="20px"
          bg={menuBg}
          border="none"
        >
          <Flex w="100%" mb="0px">
            <Text
              ps="20px"
              pt="16px"
              pb="10px"
              w="100%"
              borderBottom="1px solid"
              borderColor={borderColor}
              fontSize="sm"
              fontWeight="700"
              color={textColor}
            >
              👋&nbsp; Hey, {getUsername()}
            </Text>
          </Flex>
          <Flex flexDirection="column" p="10px">
            <MenuItem
              _hover={{ bg: "none" }}
              _focus={{ bg: "none" }}
              borderRadius="8px"
              px="14px"
            >
              <Button _hover={{ bg: "none" }} fontSize="sm" onClick={profile}>
                Profile Settings
              </Button>
            </MenuItem>
            <MenuItem
              _hover={{ bg: "none" }}
              _focus={{ bg: "none" }}
              borderRadius="8px"
              px="14px"
            >
              <Text fontSize="sm">Session Time: {elapsedTime}</Text>
            </MenuItem>
            <MenuItem
              _hover={{ bg: "none" }}
              _focus={{ bg: "none" }}
              color="red.400"
              borderRadius="8px"
              px="14px"
            >
              <Button onClick={handleLogout}>Logout</Button>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
};

NavbarLinksAdmin.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};

export default NavbarLinksAdmin;
