import React, { useState } from 'react';
import { Button, Box, Flex, Center } from "@chakra-ui/react";
import { MdAdd, MdRemove } from 'react-icons/md';
import PermissionList from "./components/PermissionList";
import CreatepermissionForm from "./components/CreatePermission";

const Permissions = () => {
  const [showCreatepermissionForm, setShowCreatepermissionForm] = useState(false);


  const toggleCreatepermissionForm = () => {
    setShowCreatepermissionForm(!showCreatepermissionForm);
  };


  return (
    <Flex direction="column" alignItems="center">
      <Box width="80%" maxW="xxl" mt={12}>
        <PermissionList />
      </Box>
      <Box width="80%" maxW="lg">
        <Center>
          <Button
            colorScheme={showCreatepermissionForm ? "red" : "blue"}
            leftIcon={showCreatepermissionForm ? <MdRemove /> : <MdAdd />}
            onClick={toggleCreatepermissionForm}
            marginBottom="20px"
            mt={"10"}
          >
            {showCreatepermissionForm ? "Hide Create permission Form" : "Create permission"}
          </Button>
        </Center>
        {showCreatepermissionForm && <CreatepermissionForm />}
      </Box>
    </Flex>
  );
};

export default Permissions;
