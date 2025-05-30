import React from "react";
import { Icon } from "@chakra-ui/react";
import {
  MdPerson,
  MdHome,
  MdLock,
  MdSettings,
  MdPermContactCalendar,
  MdWorkspacePremium,
} from "react-icons/md";
// Admin Imports
import MainDashboard from "views/admin/default";
import Profile from "views/admin/profile";
import Rooms from "views/Room/index";
import AssignmentInterface from "views/assignment/AssignmentInterface";
import Users from "views/admin/Users";
import Role from "views/admin/Role";
import Permission from "views/admin/Permission";
// Auth Imports
import SignInCentered from "views/auth/signIn";
const routes = [
  // {
  //   name: "Main Dashboard",
  //   layout: "/admin",
  //   path: "/Default",
  //   icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  //   component: MainDashboard,
  // },
  {
    name: "Profile",
    layout: "/admin",
    path: "/profile",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: Profile,
  },
  {
    name: "Rooms",
    layout: "/admin",
    path: "/rooms",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: Rooms,
  },
  {
    name: "AssignmentInterface",
    layout: "/admin",
    path: "/AssignmentInterface",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: AssignmentInterface,
  },
  {
    name: "Sign In",
    layout: "/auth",
    path: "/sign-in",
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: SignInCentered,
  },
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
  //   icon: <Icon as={MdSettings} width="20px" height="20px" color="inherit" />,
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

export default routes;
