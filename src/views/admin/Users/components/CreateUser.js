import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  Center,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

function CreateUser() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  
  // Keep token handling for authentication if needed
  const token = localStorage.getItem("accessToken");
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !name || !password) {
      setError("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include authorization if still needed in your context
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            email,
            name,
            password
          }),
        }
      );
      
      if (response.ok) {
        const userData = await response.json();
        console.log("User created successfully:", userData);
        alert("User registered successfully!");
        
        // Reset form
        setEmail("");
        setName("");
        setPassword("");
        setError(null);
      } else if (response.status === 400) {
        setError("Email already registered. Please use a different email.");
      } else {
        throw new Error("Failed to register user");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setError("Failed to register user. Please try again later.");
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
          <Heading
            color="blue.500"
            textAlign="center"
            mb="20px"
            fontSize={"30"}
          >
            Register New User
          </Heading>
          {error && (
            <Text color="red.500" textAlign="center" fontSize="lg" mb="10px">
              {error}
            </Text>
          )}
          <form onSubmit={handleSubmit}>
            <Input
              variant="outline"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              mb="20px"
              borderColor="blue.500"
              focusBorderColor="blue.600"
              _hover={{ borderColor: "blue.600" }}
              _placeholder={{ color: "blue.500" }}
              type="email"
            />
            <Input
              variant="outline"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              mb="20px"
              borderColor="blue.500"
              focusBorderColor="blue.600"
              _hover={{ borderColor: "blue.600" }}
              _placeholder={{ color: "blue.500" }}
            />
            <Input
              variant="outline"
              placeholder="Password"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              required={true}
              mb="20px"
              borderColor="blue.500"
              focusBorderColor="blue.600"
              _hover={{ borderColor: "blue.600" }}
              _placeholder={{ color: "blue.500" }}
            />

            <Button
              fontSize="sm"
              colorScheme="blue"
              fontWeight="500"
              w="100%"
              h="50"
              mb="24px"
              type="submit"
            >
              Register User
            </Button>
          </form>
        </Box>
      </Center>
    </motion.div>
  );
}

export default CreateUser;
