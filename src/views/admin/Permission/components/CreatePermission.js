import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
} from "@chakra-ui/react";

const CreatepermissionForm = () => {
  const [description, setDescription] = useState("");
  const [EntryUser, setEntryUser] = useState(null);
  const [CreatePermission, setCreatePermission] = useState(false);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const [header, payload, signature] = accessToken.split(".");
      const decodedPayload = JSON.parse(atob(payload));
      const entryUser = decodedPayload.Username;
      const role = decodedPayload.RoleID;
      setEntryUser(entryUser);
      const fetchRole = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/role/${role}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const Role = await response.json();
            if(Role === "6693c961f272f679489d084f")
            {
              setCreatePermission(true);
            }
          } else {
            throw new Error("Failed to fetch role");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      };
  
      fetchRole();
    } else {
      console.error("Access token not found.");
    }
  }, []);  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("User is not authenticated");
      }
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/permission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            Description: description,
            EntryUser: EntryUser,
            UpdateUser: EntryUser,
          }),
        }
      );

      const result = await response.json();
      console.log(result);

      // Reset the form or handle success accordingly
      setDescription("");
    } catch (error) {
      console.error("Error creating permission:", error);
    }
  };

  return (
    <ChakraProvider>
      <Box
        mt={10}
        boxShadow="0px 0px 10px rgba(0, 0, 255, 0.3)"
        p="8"
        borderRadius="md"
        bg="white"
        width={"l"}
      >
        <Heading mb={5}>Create permission</Heading>
        <form onSubmit={handleSubmit}>
          <FormControl id="description" isRequired mb={3}>
            <FormLabel>Description</FormLabel>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          <Button
            isDisabled={CreatePermission}
            fontSize="large"
            colorScheme="blue"
            fontWeight="500"
            w="100%"
            h="50"
            mb="24px"
            type="submit"
          >
            Create permission
          </Button>
        </form>
      </Box>
    </ChakraProvider>
  );
};

export default CreatepermissionForm;
