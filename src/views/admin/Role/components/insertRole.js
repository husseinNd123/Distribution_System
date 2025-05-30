import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  Heading,
  Center,
  Text,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import "./CustomDropdown.css"; // Import the CSS file

const InsertRole = () => {
  const [Description, setDescription] = useState("");
  const [EntryUser, setEntryUser] = useState(null);
  const [UpdateUser, setUpdateUser] = useState("");
  const [Permissions, setPermissions] = useState([]);
  const [PermissionList, setPermissionList] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State for custom dropdown
  const token = localStorage.getItem("accessToken");

  const fetchPermissions = async () => {
    try {
      if (!token) {
        throw new Error("User is not authenticated");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/permission`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const permissionData = await response.json();
        setPermissionList(permissionData);
      } else {
        console.error("Error fetching permissions");
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const [header, payload, signature] = accessToken.split(".");
      const decodedPayload = JSON.parse(atob(payload));
      const entryUser = decodedPayload.Username;
      setEntryUser(entryUser);
    } else {
      console.error("Access token not found.");
    }
  }, []);

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (event) => {
    const optionId = event.target.value;
    if (Permissions.includes(optionId)) {
      setPermissions(Permissions.filter((id) => id !== optionId));
    } else {
      setPermissions([...Permissions, optionId]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!token) {
        throw new Error("User is not authenticated");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            Description,
            Permissions,
            EntryUser,
            UpdateUser: EntryUser,
          }),
        }
      );

      if (response.ok) {
        console.log("Role created successfully");
        setDescription("");
        setPermissions([]);
        setEntryUser("");
        setUpdateUser("");
        setError("");
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      setError("Failed to create role");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: "center", maxWidth: "400px", margin: "auto" }}
    >
      <Center>
        <Box boxShadow="lg" p="20px" borderRadius="md" bg="gray.50" w="lg">
          <Heading color="blue.500" textAlign="center" mb="20px" fontSize="2xl">
            Add New Role
          </Heading>
          {error && (
            <Text color="red.500" textAlign="center" mb="10px">
              {error}
            </Text>
          )}
          {success && (
            <Text color="green.500" textAlign="center" mb="10px">
              Role added successfully!
            </Text>
          )}
          <form onSubmit={handleSubmit}>
            <FormControl mb="20px">
              <FormLabel>Description</FormLabel>
              <Input
                variant="flushed"
                placeholder="Enter Role Description"
                value={Description}
                onChange={handleDescriptionChange}
                mb="10px"
                borderColor="blue.500"
              />
            </FormControl>
            <FormControl mb="20px">
              <FormLabel>Permissions</FormLabel>
              <div className="custom-dropdown">
                <Button
                  size="sm"
                  colorScheme="blue"
                  mr="2"
                  onClick={toggleDropdown}
                >
                  Select Options
                </Button>
                <Center>
                  {isOpen && (
                    <div className="custom-dropdown-menu">
                      {PermissionList.map((option) => (
                        <div key={option._id} className="custom-checkbox">
                          <input
                            id={`option_${option._id}`}
                            type="checkbox"
                            value={option._id}
                            checked={Permissions.includes(option._id)}
                            onChange={handleCheckboxChange}
                          />
                          <label htmlFor={`option_${option._id}`}>
                            {option.Description}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </Center>
              </div>
              <FormHelperText>
                Select one or more permissions for the role.
              </FormHelperText>
            </FormControl>
            <Button colorScheme="blue" type="submit" w="100%" mt="20px">
              Add Role
            </Button>
          </form>
        </Box>
      </Center>
    </motion.div>
  );
};

export default InsertRole;
