import React, { useState } from "react";
import { Flex, Button, Center, Box } from "@chakra-ui/react";
import UsersList from "views/admin/Users/components/UsersList";
import CreateUser from "views/admin/Users/components/CreateUser";
import { MdAdd, MdRemove } from 'react-icons/md';

const Users = () => {
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);

  const toggleCreateUserForm = () => {
    setShowCreateUserForm(!showCreateUserForm);
  };

  return (
    <Flex direction="column" alignItems={"center"}>
      <Flex direction={"column"}  alignItems="center" >
        <Center>
          <Button
            colorScheme={showCreateUserForm ? "red" : "blue"}
            leftIcon={showCreateUserForm ? <MdRemove /> : <MdAdd />}
            onClick={toggleCreateUserForm}
            marginBottom={10}
            mt={"150"}
          >
            {showCreateUserForm ? "Hide Create User Form" : "Create User"}
          </Button>
        </Center>
        {showCreateUserForm && <CreateUser />}
      </Flex>
      <Box width="80%">
        <UsersList />
      </Box>
      
    </Flex>
  );
};

export default Users;
