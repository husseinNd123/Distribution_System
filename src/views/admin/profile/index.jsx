import React, { useEffect, useState } from "react";
import {
  // Avatar,
  Text,
  Box,
  Grid,
  Button,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import Banner from "views/admin/profile/components/Banner";
import banner from "assets/img/auth/banner.png";
import { useHistory } from 'react-router-dom';


export default function Overview() {
  const [userRole, setUserRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error , setError] = useState("");
  const token = localStorage.getItem('accessToken');
  const history = useHistory();

  useEffect(() => {
    const fetchUserRoleDescription = async () => {
      try {
        const Username = localStorage.getItem("username") || null;

      if (!token) {
        throw new Error('User is not authenticated');
      }
        console.log(Username)
        const responseUsers = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const responseRoles = await fetch(`${process.env.REACT_APP_API_URL}/api/role`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (responseUsers.ok && responseRoles.ok) {
          const usersData = await responseUsers.json();
          const rolesData = await responseRoles.json();
          const user = usersData.find((user) => user.Username === Username);
          console.log(usersData)
          if (!user) {
            console.error("User not found");
            return;
          }
          setUserId(user._id);

          const role = rolesData.find((role) => role._id === user.RoleID);
          if (!role) {
            console.error("Role not found");
            return;
          }

          setUserRole(role.Description);
        } else {
          console.error("Error fetching users or roles");
        }
      } catch (error) {
        console.error("Error fetching users or roles:", error);
      }
    };

    fetchUserRoleDescription();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match.");
      setError("Passwords do not match! Please enter the same password in both fields.");
      return console.error("Passwords doesn't match!");
      
    }
    if (!token) {
      throw new Error('User is not authenticated');
    }
    try {
      const username = localStorage.getItem("username"); 
      const data = {
        UserID: userId,
        Userpass: newPassword,
        UpdateUser: username, 
      };
      console.log(data)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/editUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,

        },
        body: JSON.stringify({ data }),
      });
      if (response.ok) {
        console.log("Success");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          localStorage.removeItem('username');
          localStorage.removeItem('accessToken');
          localStorage.clear();
          history.push('/auth/signIn');
          console.log(localStorage.getItem('username'), " ", localStorage.getItem('accessToken'));
        }, 10000); // 2000 milliseconds (2 seconds) delay
      
      } else {
        console.log("Error updating");
        setError("Error updating password.");
      }
     
    } catch (error) {
      setError("Error updating password.")
     console.log(`An error occurred while updating the password: ${error.message}`);
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Grid
        templateColumns={{
          base: "1fr",
          lg: "1.34fr 1fr 1.62fr",
        }}
        templateRows={{
          base: "repeat(3, 1fr)",
          lg: "1fr",
        }}
        gap={{ base: "20px", xl: "20px" }}
      >
        
        <Banner
          gridArea="1 / 1 / 2 / 2"
          banner={banner}
          name={localStorage.getItem("username") || "User"}
          job={userRole}
        />
        <Box>
          <FormControl isRequired mt={4}>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired mt={4}>
            <FormLabel>Confirm New Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>
          <Button mt={4} colorScheme="blue" onClick={handlePasswordChange}>
            Update Password
          </Button>
          <Text color="red.400" fontSize="md"  mb="4">{error}</Text>
        </Box>
      </Grid>
    </Box>
  );
}