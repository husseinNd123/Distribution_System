import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Button,
  Input,
  Flex,
  Text,
} from "@chakra-ui/react";
import {
  MdEdit,
  MdDelete,
  MdDone,
  MdCancel,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import Card from "components/card/Card";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [Username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editableUser, setEditableUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

 
  const handleEditUser = (user) => {
    setUsername(user.Username);
    user.Username = null;
    user.Userpass = null;
    setEditableUser(user);
  };

  const handleSaveUser = async () => {
    try {
      let data = {};
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("User is not authenticated");
      }
      if (editableUser.Username === null) {
        if(editableUser.Userpass === null) {
        data = {
          UserID: editableUser._id,
        };
      }else {
        data = {
          Userpass: editableUser.Userpass,
          UserID: editableUser._id,
        };
      }
      } else {
        data = {
          Username: editableUser.Username,
          Userpass: editableUser.Userpass,
          UserID: editableUser._id,
        };
      }
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/editUser`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
      setEditableUser(null);
      window.location.reload();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleEditFormClose = () => {
    setEditableUser(null);
  };

  const handleDeleteUser = async (UserID) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("User is not authenticated");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ UserID }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete user");
      } else {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== UserID)
        );
        setFilteredUsers((prevFilteredUsers) =>
          prevFilteredUsers.filter((user) => user._id !== UserID)
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("User is not authenticated");
        }
        const responseUsers = await fetch(
          `${process.env.REACT_APP_API_URL}/users`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (responseUsers.ok) {
          const usersData = await responseUsers.json();
          setUsers(usersData);
          setFilteredUsers(usersData);
        } else {
          console.error("Error fetching users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    const filtered = users.filter((UserItem) =>
      UserItem.Username.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Card px="0px" boxShadow="xl" overflowX={{ sm: "scroll", lg: "hidden" }}>
      {error && (
        <Text color="#FF3B3B " textAlign="center" fontSize="lg">
          {error}
        </Text>
      )}

      <Flex px="25px" justify="space-between" mb="20px" align="center">
        <Text
          color="gray.800"
          fontSize="22px"
          fontWeight="700"
          lineHeight="100%"
        >
          User List
        </Text>
        <Input
          placeholder="Search Users..."
          value={searchQuery}
          onChange={handleSearch}
          size="sm"
          w="200px"
        />
      </Flex>
      <Box overflowY="auto" maxHeight="400px">
        {loading ? (
          <Spinner size="xl" />
        ) : (
          <Table variant="simple" color="gray.500" mb="24px">
                <Thead position="sticky" top="0" zIndex="1" bg="blue" >
              <Tr bg="blue" textColor="white">
                <Th textColor="white">Index</Th>
                <Th textColor="white">Username</Th>
                <Th textColor="white">Password</Th>
                <Th textColor="white">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItems.map((user, index) => (
                <Tr key={user._id}>
                  <Td>{indexOfFirstItem + index + 1}</Td>
                  <Td>
                    {editableUser && editableUser._id === user._id ? (
                      <Input
                        type="text"
                        value={editableUser.Username}
                        onChange={(e) =>
                          setEditableUser({
                            ...editableUser,
                            Username: e.target.value,
                          })
                        }
                        size="sm"
                      />
                    ) : (
                      user.Username
                    )}
                  </Td>
                  <Td>
                    {editableUser && editableUser._id === user._id ? (
                      <Input
                        type="password"
                        value={editableUser.Userpass}
                        onChange={(e) =>
                          setEditableUser({
                            ...editableUser,
                            Userpass: e.target.value,
                          })
                        }
                        size="sm"
                      />
                    ) : (
                      "********"
                    )}
                  </Td>
                  <Td>
                    {editableUser && editableUser._id === user._id ? (
                      <Flex>
                        <Button
                          leftIcon={<MdDone />}
                          colorScheme="green"
                          size="sm"
                          onClick={handleSaveUser}
                        >
                          Save
                        </Button>
                        <Button
                          leftIcon={<MdCancel />}
                          colorScheme="red"
                          ml={2}
                          size="sm"
                          onClick={handleEditFormClose}
                        >
                          Cancel
                        </Button>
                      </Flex>
                    ) : (
                      <Flex>
                        <Button
                          leftIcon={<MdEdit />}
                          colorScheme="blue"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          leftIcon={<MdDelete />}
                          colorScheme="red"
                          size="sm"
                          ml={2}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this user?"
                              )
                            ) {
                              handleDeleteUser(user._id);
                            }
                          }}
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
        )}
      </Box>
      <Flex justify="space-between" alignItems="center" px="25px" mt="20px">
        <Text color="gray.800">
          Showing {indexOfFirstItem + 1} -{" "}
          {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
          {filteredUsers.length}
        </Text>
        <Flex>
          <Button
            leftIcon={<MdChevronLeft />}
            colorScheme="blue"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            leftIcon={<MdChevronRight />}
            colorScheme="blue"
            size="sm"
            onClick={handleNextPage}
            ml="2"
            disabled={indexOfLastItem >= filteredUsers.length}
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default UsersList;
