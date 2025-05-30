import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Box,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  MdEdit,
  MdDelete,
  MdDone,
  MdCancel,
  MdChevronLeft,
  MdChevronRight,
  MdArrowDropDown,
  MdArrowDropUp,
} from "react-icons/md";
import { useQuery, useMutation } from "react-query";
import Card from "components/card/Card";

const ListRole = () => {
  const [editableRole, setEditableRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updateUser, setUpdateUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const itemsPerPage = 5;
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const [header, payload, signature] = accessToken.split(".");
      const decodedPayload = JSON.parse(atob(payload));
      const entryUser = decodedPayload.Username;
      setUpdateUser(entryUser);
    } else {
      console.error("Access token not found.");
    }
  }, []);

  const {
    data: roles,
    error: rolesError,
    isLoading: rolesLoading,
    refetch: refetchRoles,
  } = useQuery(
    "roles",
    async () => {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/role`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      return response.json();
    },
    {
      enabled: !!token,
    }
  );

  const {
    data: permissionList,
    error: permissionError,
    isLoading: permissionLoading,
  } = useQuery(
    "permissions",
    async () => {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/permission`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }

      return response.json();
    },
    {
      enabled: !!token,
    }
  );

  const deleteRole = useMutation(
    (roleId) =>
      fetch(`${process.env.REACT_APP_API_URL}/api/role`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ RoleID: roleId }),
      }),
    {
      onSuccess: () => {
        refetchRoles();
      },
    }
  );

  const updateRole = useMutation(
    (updatedRole) =>
      fetch(`${process.env.REACT_APP_API_URL}/api/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          RoleID: updatedRole._id,
          Description: updatedRole.Description,
          UpdateUser: updateUser,
          Permissions: updatedRole.Permissions,
        }),
      }),
    {
      onSuccess: () => {
        refetchRoles();
        setEditableRole(null);
        setDropdownOpen(false); // Close dropdown on save
      },
    }
  );

  const handleDeleteRole = async (roleId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this role?");
    if (confirmDelete) {
      try {
        await deleteRole.mutateAsync(roleId);
        alert("role deleted successfully.");
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  const handleEditRole = (role) => {
    setEditableRole(role);
    setDropdownOpen(false); // Close dropdown when editing
  };

  const handleSaveRole = async () => {
    try {
      await updateRole.mutateAsync(editableRole);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
  };

  const handleCheckboxChange = (event) => {
    const permissionId = event.target.value;
    const updatedPermissions = editableRole.Permissions.includes(permissionId)
      ? editableRole.Permissions.filter((id) => id !== permissionId)
      : [...editableRole.Permissions, permissionId];
    setEditableRole({ ...editableRole, Permissions: updatedPermissions });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = roles
    ? roles.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  if (rolesLoading || permissionLoading) return <Text>Loading...</Text>;
  if (rolesError || permissionError) return <Text>Error fetching data</Text>;

  return (
    <Card px="0px" boxShadow="xl" overflowX={{ sm: "scroll", lg: "hidden" }}>
      <Flex px="25px" justify="space-between" mb="20px" align="center">
        <Text color="black" fontSize="22px" fontWeight="700" lineHeight="100%">
          Role List
        </Text>

        <Input
          placeholder="Search role..."
          value={searchQuery}
          onChange={handleSearch}
          size="sm"
          w="200px"
        />
      </Flex>
      <Box overflowY="auto" maxHeight="400px">
        <Table variant="simple" color="gray.500" mb="24px">
              <Thead position="sticky" top="0" zIndex="1" bg="blue" >
            <Tr bg="blue" textColor="white">
              <Th textColor="white">Role</Th>
              <Th textColor="white">Description</Th>
              <Th textColor="white">Permissions</Th>
              <Th textColor="white">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentItems.map((role, index) => (
              <Tr key={role._id}>
                <Td>{indexOfFirstItem + index + 1}</Td>
                <Td>
                  {editableRole && editableRole._id === role._id ? (
                    <Input
                      value={editableRole.Description}
                      onChange={(e) =>
                        setEditableRole({
                          ...editableRole,
                          Description: e.target.value,
                        })
                      }
                      size="sm"
                    />
                  ) : (
                    role.Description
                  )}
                </Td>
                <Td>
                  {editableRole && editableRole._id === role._id ? (
                    <FormControl mb="20px">
                      <FormLabel>Permissions</FormLabel>
                      <Box position="relative">
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={toggleDropdown}
                          rightIcon={dropdownOpen ? <MdArrowDropUp /> : <MdArrowDropDown />}
                        >
                          {dropdownOpen ? "Hide Options" : "Select Options"}
                        </Button>
                        {dropdownOpen && (
                          <Box
                            position="absolute"
                            top="100%"
                            left="0"
                            bg="white"
                            border="1px solid #ddd"
                            borderRadius="md"
                            boxShadow="md"
                            mt="1"
                            p="2"
                            zIndex="1000"
                            width="100%"
                            maxHeight="200px" // Fixed height
                            overflowY="auto" // Enable scrolling
                          >
                            {permissionList.map((option) => (
                              <Flex
                                key={option._id}
                                align="center"
                                mb="1"
                                p="1"
                                borderRadius="md"
                                _hover={{ bg: "gray.100" }}
                              >
                                <input
                                  id={`option_${option._id}`}
                                  type="checkbox"
                                  value={option._id}
                                  checked={editableRole.Permissions.includes(option._id)}
                                  onChange={handleCheckboxChange}
                                />
                                <label htmlFor={`option_${option._id}`} style={{ marginLeft: "8px" }}>
                                  {option.Description}
                                </label>
                              </Flex>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </FormControl>
                  ) : (
                    <select>
                      {role.Permissions.map((permId) => (
                        <option key={permId} value={permId}>
                          {
                            permissionList.find(
                              (permission) => permission._id === permId
                            )?.Description
                          }
                        </option>
                      ))}
                    </select>
                  )}
                </Td>
                <Td>
                  {editableRole && editableRole._id === role._id ? (
                    <Flex>
                      <Button
                        leftIcon={<MdDone />}
                        size="sm"
                        colorScheme="green"
                        mr="2"
                        onClick={handleSaveRole}
                      >
                        Save
                      </Button>
                      <Button
                        leftIcon={<MdCancel />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => setEditableRole(null)}
                      >
                        Cancel
                      </Button>
                    </Flex>
                  ) : (
                    <Flex>
                      <Button
                        leftIcon={<MdEdit />}
                        size="sm"
                        colorScheme="blue"
                        mr="2"
                        onClick={() => handleEditRole(role)}
                      >
                        Edit
                      </Button>
                      <Button
                        leftIcon={<MdDelete />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteRole(role._id)}
                      >
                        Delete
                      </Button>
                    </Flex>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Flex justify="space-between" p="20px">
          <Button
            leftIcon={<MdChevronLeft />}
            size="sm"
            onClick={handlePreviousPage}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            rightIcon={<MdChevronRight />}
            size="sm"
            onClick={handleNextPage}
            isDisabled={indexOfLastItem >= roles.length}
          >
            Next
          </Button>
        </Flex>
      </Box>
    </Card>
  );
};

export default ListRole;
