/* eslint-disable */
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  MdOutlineTopic,
  MdModelTraining,
  MdClass,
  MdBoy,
  MdBeenhere ,
} from "react-icons/md";
// chakra imports
import {
  Box,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  Collapse,
  Icon,
} from "@chakra-ui/react";

import { GiGreenhouse } from "react-icons/gi";
import { FaGraduationCap, FaImages } from "react-icons/fa";
import { CiMoneyCheck1 } from "react-icons/ci";

import Users from "views/admin/Users";
import Role from "views/admin/Role";
import Permission from "views/admin/Permission";

import {
  MdSettings,
  MdPermContactCalendar,
  MdArrowDropDown,
  MdArrowDropUp,
  MdWorkspacePremium,
  MdDeblur,
} from "react-icons/md";
  import { GiFarmTractor, GiFruitBowl, GiVillage} from "react-icons/gi";


export function SidebarLinks(props) {
  //   Chakra color mode
  let location = useLocation();
  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue("secondaryGray.600","secondaryGray.600");
  let activeIcon = useColorModeValue("blue ", "white");
  let textColor = useColorModeValue("secondaryGray.500", "white");
  let brandColor = useColorModeValue("blue ", "blue");
  const { routes } = props;
  const [clickedLinkIndex, setClickedLinkIndex] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isFarmDropdownOpen, setFarmDropdownOpen] = useState(false);
  const [isTrainingDropdownOpen, setTrainingDropdownOpen] = useState(false);
  const [isAccountingDropdownOpen, setAccountingDropdownOpen] = useState(false);
  const token = localStorage.getItem("accessToken");
 


  // Function to toggle the dropdown state
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const toggleFarmDropdown = () => {
    setFarmDropdownOpen(!isFarmDropdownOpen);
  };

  const toggleTrainingDropdown = () => {
    setTrainingDropdownOpen(!isTrainingDropdownOpen);
  };

  const toggleAccountingDropdown = () => {
    setAccountingDropdownOpen(!isAccountingDropdownOpen);
  };

  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  // Function to render links within the dropdown
  const renderDropdownLinks = () => {
    // You can customize the links and paths based on your requirements
    const dropdownLinks = [
      {
        name: "Users",
        layout: "/admin",
        path: "/users",
        icon: (
          <Icon
            as={MdPermContactCalendar}
            width="20px"
            height="20px"
            color="inherit"
          />
        ),
        component: Users,
      },
      // {
      //   name: "Role",
      //   layout: "/admin",
      //   path: "/role",
      //   icon: (
      //     <Icon as={MdSettings} width="20px" height="20px" color="inherit" />
      //   ),
      //   component: Role,
      // },
      // {
      //   name: "Permission",
      //   layout: "/admin",
      //   path: "/permission",
      //   icon: (
      //     <Icon
      //       as={MdWorkspacePremium}
      //       width="20px"
      //       height="20px"
      //       color="inherit"
      //     />
      //   ),
      //   component: Permission,
      // },
    ];

    return dropdownLinks.map((link, index) => (
      <NavLink
        key={index}
        to={link.layout + link.path}
        onClick={() => setClickedLinkIndex(index)}
      >
        {link.icon ? (
          <Box>
            <HStack
              spacing={activeRoute(link.path) ? "22px" : "26px"}
              py="5px"
              ps="10px"
            >
              <Flex w="100%" alignItems="center" justifyContent="center">
                <Box
                  color={activeRoute(link.path) ? activeIcon : textColor}
                  me="18px"
                >
                  {link.icon}
                </Box>
                <Text
                  me="auto"
                  color={activeRoute(link.path) ? activeColor : textColor}
                  fontWeight={activeRoute(link.path) ? "bold" : "normal"}
                >
                  {link.name}
                </Text>
              </Flex>
              <Box
                h="36px"
                w="4px"
                bg={activeRoute(link.path) ? brandColor : "transparent"}
                borderRadius="5px"
              />
            </HStack>
          </Box>
        ) : (
          <Box>
            <HStack
              spacing={activeRoute(link.path) ? "22px" : "26px"}
              py="5px"
              ps="10px"
            >
              <Text
                me="auto"
                color={activeRoute(link.path) ? activeColor : inactiveColor}
                fontWeight={activeRoute(link.path) ? "bold" : "normal"}
              >
                {link.name}
              </Text>
              <Box h="36px" w="4px" bg="#FF3B3B " borderRadius="5px" />
            </HStack>
          </Box>
        )}
      </NavLink>
    ));
  };

  const renderFarmDropdownLinks = () => {
    // You can customize the links and paths based on your requirements
    const FarmdropdownLinks = [
      {
        name: "Farms",
        layout: "/admin",
        path: "/Farms",
        icon: (
          <Icon as={GiFarmTractor} width="20px" height="20px" color="inherit" />
        ),
        component: Farms,
      },
      {
        name: "Farms Images",
        layout: "/admin",
        path: "/farmsImages",
        icon: (
          <Icon as={FaImages} width="20px" height="20px" color="inherit" />
        ),
        component: FarmsImages,
      },
      {
        name: "Crops",
        layout: "/admin",
        path: "/Crops",
        icon: (
          <Icon as={GiFruitBowl} width="20px" height="20px" color="inherit" />
        ),
        component: Crop,
      },
    ];

    return FarmdropdownLinks.map((link, index) => (
      <NavLink
        key={index}
        to={link.layout + link.path}
        onClick={() => setClickedLinkIndex(index)}
      >
        {link.icon ? (
          <Box>
            <HStack
              spacing={activeRoute(link.path) ? "22px" : "26px"}
              py="5px"
              ps="10px"
            >
              <Flex w="100%" alignItems="center" justifyContent="center">
                <Box
                  color={activeRoute(link.path) ? activeIcon : textColor}
                  me="18px"
                >
                  {link.icon}
                </Box>
                <Text
                  me="auto"
                  color={activeRoute(link.path) ? activeColor : textColor}
                  fontWeight={activeRoute(link.path) ? "bold" : "normal"}
                >
                  {link.name}
                </Text>
              </Flex>
              <Box
                h="36px"
                w="4px"
                bg={activeRoute(link.path) ? brandColor : "transparent"}
                borderRadius="5px"
              />
            </HStack>
          </Box>
        ) : (
          <Box>
            <HStack
              spacing={activeRoute(link.path) ? "22px" : "26px"}
              py="5px"
              ps="10px"
            >
              <Text
                me="auto"
                color={activeRoute(link.path) ? activeColor : inactiveColor}
                fontWeight={activeRoute(link.path) ? "bold" : "normal"}
              >
                {link.name}
              </Text>
              <Box h="36px" w="4px" bg="#FF3B3B " borderRadius="5px" />
            </HStack>
          </Box>
        )}
      </NavLink>
    ));
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (
        route.name !== "Users" &&
        route.name !== "Profile" &&
        route.name !== "Sign In" 
      ) {
        if (route.layout === "/admin" || route.layout === "/auth") {
          if (route.name === "Farms") {
            return (
              <>
              {/* farm dropdown links */}
                <Box>
                  <HStack
                    spacing={"26px"}
                    cursor="pointer"
                    onClick={toggleFarmDropdown}
                    py="5px"
                    ps="10px"
                  >
                    <Flex w="100%" alignItems="center" justifyContent="center">
                      <Box color={textColor} me="18px">
                        <Icon as={GiGreenhouse} boxSize={5} />
                      </Box>
                      <Text me="auto" color={textColor} fontWeight={"normal"}>
                        Farm
                      </Text>
                      <Box
                        color={isFarmDropdownOpen ? activeIcon : textColor}
                        me="0px"
                        pt={"1"}
                      >
                        <Icon
                          as={
                            isFarmDropdownOpen ? MdArrowDropUp : MdArrowDropDown
                          }
                          boxSize={8}
                          pt="1"
                        />
                      </Box>
                    </Flex>
                  </HStack>
                </Box>

                {/* Dropdown content */}
                <Collapse in={isFarmDropdownOpen}>
                  <Box ml="30px">{renderFarmDropdownLinks()}</Box>
                </Collapse>
              </>
            );
          }else {
            return (
              <NavLink key={index} to={route.layout + route.path}>
                {route.icon ? (
                  <Box>
                    <HStack
                      spacing={activeRoute(route.path) ? "22px" : "26px"}
                      py="5px"
                      ps="10px"
                    >
                      <Flex
                        w="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Box
                          color={
                            activeRoute(route.path) ? activeIcon : textColor
                          }
                          me="18px"
                        >
                          {route.icon}
                        </Box>
                        <Text
                          me="auto"
                          color={
                            activeRoute(route.path) ? activeColor : textColor
                          }
                          fontWeight={
                            activeRoute(route.path) ? "bold" : "normal"
                          }
                        >
                          {route.name}
                        </Text>
                      </Flex>
                      <Box
                        h="36px"
                        w="4px"
                        bg={
                          activeRoute(route.path) ? brandColor : "transparent"
                        }
                        borderRadius="5px"
                      />
                    </HStack>
                  </Box>
                ) : (
                  <Box>
                    <HStack
                      spacing={activeRoute(route.path) ? "22px" : "26px"}
                      py="5px"
                      ps="10px"
                    >
                      <Text
                        me="auto"
                        color={
                          activeRoute(route.path) ? activeColor : inactiveColor
                        }
                        fontWeight={activeRoute(route.path) ? "bold" : "normal"}
                      >
                        {route.name}
                      </Text>
                      <Box h="36px" w="4px" bg="#FF3B3B " borderRadius="5px" />
                    </HStack>
                  </Box>
                )}
              </NavLink>
            );
          }
        }
      }
    });
  };
  //  BRAND
  return (
    <>
      {createLinks(routes)}

      {
        <Box>
          <HStack
            spacing={"26px"}
            cursor="pointer"
            onClick={toggleDropdown}
            py="5px"
            ps="10px"
          >
            <Flex w="100%" alignItems="center" justifyContent="center">
              <Box color={textColor} me="18px">
                <Icon as={MdSettings} boxSize={5} />
              </Box>
              <Text me="auto" color={textColor} fontWeight={"normal"}>
                Settings
              </Text>
              <Box
                color={isDropdownOpen ? activeIcon : textColor}
                me="0px"
                pt={"1"}
              >
                <Icon
                  as={isDropdownOpen ? MdArrowDropUp : MdArrowDropDown}
                  boxSize={8}
                  pt="1"
                />
              </Box>
            </Flex>
          </HStack>
        </Box>
      }
      {/* Dropdown content */}
      <Collapse in={isDropdownOpen}>
        <Box ml="30px">{renderDropdownLinks()}</Box>
      </Collapse>
    </>
  );
}

export default SidebarLinks;
