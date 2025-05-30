import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  keyframes,
} from '@chakra-ui/react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import DefaultAuth from 'layouts/auth/types/Default';
import illustration from 'assets/img/auth/auth.png';

const SignIn = () => {
  // Rename username state to email to better reflect the API requirement
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const brandStars = useColorModeValue('blue.500', 'blue.400');

  const clearExpiredStorage = () => {
    const accessTokenExpiry = localStorage.getItem('accessTokenExpiry');
    const now = new Date().getTime();

    if (accessTokenExpiry && now > parseInt(accessTokenExpiry, 10)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('accessTokenExpiry');
      localStorage.removeItem('username');
    }
  };

  useEffect(() => {
    clearExpiredStorage();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    
    try {
      // Create JSON payload instead of form data
      const jsonPayload = {
        email: email, // API expects email in the username field
        password: password
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonPayload),
      });

      if (response.ok) {
        const data = await response.json();

        // Store the token using the new response format
        const expiryTime = 28800000; // 8 hours in milliseconds
        const expiryDate = new Date().getTime() + expiryTime;
        
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('tokenType', data.token_type);
        localStorage.setItem('accessTokenExpiry', expiryDate.toString());
        localStorage.setItem('username', email);
        
        const loginTimestamp = new Date().toISOString();
        localStorage.setItem('loginTimestamp', loginTimestamp);
        
        // Redirect to dashboard
        window.location.href = '/#/admin/AssignmentInterface';
      } else if (response.status === 401) {
        setError("Incorrect email or password.");
      } else {
        // Handle other errors
        const errorData = await response.json().catch(() => null);
        setError(errorData?.detail || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  `;

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
       <Box position="relative" textAlign="center">
         <Box position="absolute" top="30%"  marginTop={"250"} left="75%" transform="translateX(-20%)" zIndex="2">
           
         </Box>
       </Box>
      <Flex
        maxW={{ base: '100%', md: 'max-content' }}
        w="100%"
        mx={{ base: 'auto', lg: '0px' }}
        me="auto"
        h="100%"
        alignItems="start"
        justifyContent="center"
        mb={{ base: '30px', md: '60px' }}
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '14vh' }}
        flexDirection="column"
      >
        <Box me="auto" textAlign="center">
          <Heading color={textColor} fontSize="36px" ml="20px" mb="10px">
            Student Distribution System
          </Heading>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
            ml="35px"
          >
            Enter your email and password to sign in!
          </Text>
        </Box>
        <Flex
          zIndex="2"
          direction="column"
          w={{ base: '100%', md: '420px' }}
          maxW="100%"
          background="transparent"
          borderRadius="15px"
          mx={{ base: 'auto', lg: 'unset' }}
          me="auto"
          mb={{ base: '20px', md: 'auto' }}
          borderColor="blue.500"
          p="24px"
        >
          <form onSubmit={handleLogin}>
            <FormControl>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Email<Text color={brandStars}></Text>
              </FormLabel>
              <Input
                isRequired={true}
                variant="outline"
                borderColor="blue.500"
                focusBorderColor="blue.500"
                fontSize="sm"
                ms={{ base: '0px', md: '0px' }}
                type="email"
                placeholder="your.email@example.com"
                mb="24px"
                fontWeight="500"
                size="lg"
                name="email"
                value={email}
                onChange={handleInputChange}
              />
              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                isRequired={true}
                display="flex"
              >
                Password<Text color={brandStars}></Text>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired={true}
                  fontSize="sm"
                  placeholder="password"
                  mb="24px"
                  size="lg"
                  type={showPassword ? 'text' : 'password'}
                  variant="outline"
                  borderColor="blue.500"
                  focusBorderColor="blue.500"
                  name="password"
                  value={password}
                  onChange={handleInputChange}
                />
                <InputRightElement display="flex" alignItems="center" mt="4px">
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: 'pointer' }}
                    as={showPassword ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={togglePasswordVisibility}
                  />
                </InputRightElement>
              </InputGroup>
              <Button
                fontSize="sm"
                variant="outline"
                borderColor="blue.500"
                color="blue.500"
                fontWeight="500"
                w="100%"
                h="50"
                mb="24px"
                type="submit"
                _hover={{ bg: 'blue.500', color: 'white' }}
                animation={`${fadeIn} 0.5s ease-in-out`}
              >
                Sign In
              </Button>
            </FormControl>
            {error && <Text color="blue.500" mb="8px">{error}</Text>}

          </form>
         
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
