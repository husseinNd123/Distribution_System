import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Input,
  Flex,
  Icon,
  Select,
} from "@chakra-ui/react";
import { MdEdit, MdDelete, MdDone, MdCancel } from "react-icons/md";
import Card from "components/card/Card";

const PermissionList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const [editablepermission, setEditablepermission] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [Edit, setEdit] = useState(false);
  const [Delete, setDelete] = useState(false);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const [header, payload, signature] = accessToken.split(".");
      const decodedPayload = JSON.parse(atob(payload));
      const entryUser = decodedPayload.Username;
      const role = decodedPayload.RoleID;
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
            if(Role !== "6693c961f272f679489d084f")
              {
                setEdit(true);
              }
            if(Role !== "6693c961f272f679489d084f")
            {
              setDelete(true);
            }
          } else {
            throw new Error("Failed to fetch role");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setError("Failed to fetch role");
        }
      };
  
      fetchRole();
    } else {
      console.error("Access token not found.");
    }
  }, []);

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/permission`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (response.ok) {
          const PermissionData = await response.json();
          setFilteredData(PermissionData);
        } else {
          throw new Error("Failed to fetch Permission");
        }
      } catch (error) {
        console.error("Error fetching Permission:", error);
        setError("Failed to fetch Permission");
      }
    };

    fetchPermission();
  }, []);

  const handleEditpermission = (permission) => {
    setEditablepermission(permission);
  };

  const handleSavepermission = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("User is not authenticated");
    }
    try {
      const Data = {
        permId: editablepermission._id,
        Description: editablepermission.Description,
        UpdateUser: editablepermission.UpdateUser,
      };
      console.log(Data);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/permission`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(Data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update permission");
      }

      const updatedpermission = await response.json();
      setData((prevData) =>
        prevData.map((item) =>
          item._id === updatedpermission._id ? updatedpermission : item
        )
      );
      setFilteredData((prevFilteredData) =>
        prevFilteredData.map((item) =>
          item._id === updatedpermission._id ? updatedpermission : item
        )
      );

      setEditablepermission(null);
    } catch (error) {
      console.error("Error updating permission:", error);
      setError("Failed to update permission");
    }
  };

  const handleDeletepermission = async (permissionID) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("User is not authenticated");
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/permission`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissionID: permissionID }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete permission");
      }

      setData((prevData) => prevData.filter((item) => item._id !== permissionID));
      setFilteredData((prevFilteredData) =>
        prevFilteredData.filter((item) => item._id !== permissionID)
      );
    } catch (error) {
      console.error("Error deleting permission:", error);
      setError("Failed to delete permission");
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    const filtered = data.filter((item) =>
      item.Description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <Card
      mt="50px"
      boxShadow="xl"
      p="6"
      borderRadius="md"
      direction="column"
      w="100%"
      px="0px"
      overflowX={{ sm: "scroll", lg: "hidden" }}
    >
      <Box
        px="25px"
        mb="20px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Heading mb={1}>permissions</Heading>
        <Input
          placeholder="Search by description..."
          value={searchQuery}
          onChange={handleSearch}
          size="sm"
          w="200px"
        />
      </Box>
      <Box overflowY="auto" maxHeight="400px">
        <Table variant="simple" color="black" mb="24px">
              <Thead position="sticky" top="0" zIndex="1" bg="blue" >
            <Tr bg="blue" textColor="white">
              <Th></Th>
              <Th textColor="white">Index</Th>
              <Th textColor="white">Description</Th>
              <Th textColor="white">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredData.map((item, index) => (
              <Tr key={item._id}>
                <Td></Td>
                <Td>{index + 1}</Td>
                <Td>
                  {editablepermission && editablepermission._id === item._id ? (
                    <Input
                      value={editablepermission.Description}
                      onChange={(e) =>
                        setEditablepermission({
                          ...editablepermission,
                          Description: e.target.value,
                        })
                      }
                      size="sm"
                    />
                  ) : (
                    item.Description
                  )}
                </Td>
                <Td>
                  {editablepermission && editablepermission._id === item._id ? (
                    <Flex>
                      <Button
                        leftIcon={<MdDone />}
                        colorScheme="green"
                        size="sm"
                        onClick={handleSavepermission}
                      >
                        Save
                      </Button>
                      <Button
                        leftIcon={<MdCancel />}
                        colorScheme="red"
                        ml={2}
                        size="sm"
                        onClick={() => setEditablepermission(null)}
                      >
                        Cancel
                      </Button>
                    </Flex>
                  ) : (
                    <Flex>
                      <Button
                        colorScheme="blue"
                        width={10}
                        size="sm"
                        onClick={() => handleEditpermission(item)}
                      >
                        <Icon as={MdEdit} boxSize={5} />
                      </Button>

                      <Button
                        colorScheme="red"
                        size="sm"
                        width={10}
                        ml={2}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this permission?"
                            )
                          ) {
                            handleDeletepermission(item._id);
                          }
                        }}
                      >
                        <Icon as={MdDelete} boxSize={5} />
                      </Button>
                    </Flex>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
};

export default PermissionList;
