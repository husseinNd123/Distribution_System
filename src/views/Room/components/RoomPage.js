import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
  Text,
  Flex,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  HStack,
} from "@chakra-ui/react";
import {
  MdEdit,
  MdDelete,
  MdDone,
  MdCancel,
  MdChevronLeft,
  MdChevronRight,
  MdAdd,
} from "react-icons/md";
import Card from "components/card/Card";

const RoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [editableRoom, setEditableRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [newRoom, setNewRoom] = useState({ 
    room_id: "", 
    rows: 5, 
    cols: 5, 
    skip_rows: false 
  });
  const itemsPerPage = 5;
  const toast = useToast();

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }

      const roomsData = await response.json();
      setRooms(roomsData);
    } catch (err) {
      setError("Error fetching rooms: " + err.message);
      toast({
        title: "Error",
        description: "Failed to fetch rooms",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Update filtered rooms when rooms or search query changes
  useEffect(() => {
    const filtered = rooms.filter((room) =>
      room.room_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRooms(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [rooms, searchQuery]);

  const handleEditRoom = (room) => {
    setEditableRoom({ ...room });
    setIsAdding(false);
  };

  const handleSaveRoom = async () => {
    try {
      if (!editableRoom.room_id.trim()) {
        setError("Room ID is required");
        return;
      }

      const roomData = {
        room_id: editableRoom.room_id,
        rows: Number(editableRoom.rows),
        cols: Number(editableRoom.cols),
        skip_rows: Boolean(editableRoom.skip_rows),
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/rooms/${roomData.room_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Room not found. It may have been deleted by another user.");
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to update room");
      }

      const updatedRoomData = await response.json();
      
      setRooms((prev) =>
        prev.map((room) => (room.room_id === updatedRoomData.room_id ? updatedRoomData : room))
      );
      
      setEditableRoom(null);
      setError("");
      
      toast({
        title: "Room updated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError("Failed to update room: " + err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to update room",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditFormClose = () => {
    setEditableRoom(null);
    setIsAdding(false);
    setNewRoom({ room_id: "", rows: 5, cols: 5, skip_rows: false });
    setError("");
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Room not found. It may have been deleted already.");
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to delete room");
      }

      setRooms((prev) => prev.filter((room) => room.room_id !== roomId));
      
      toast({
        title: "Room deleted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError("Failed to delete room: " + err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to delete room",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddRoom = () => {
    setIsAdding(true);
    setEditableRoom(null);
    setError("");
  };

  const handleSaveNewRoom = async () => {
    try {
      if (!newRoom.room_id.trim()) {
        setError("Room ID is required");
        return;
      }

      // Check for duplicate room ID
      if (rooms.some(room => room.room_id === newRoom.room_id)) {
        setError("Room ID already exists");
        return;
      }

      const roomData = {
        room_id: newRoom.room_id,
        rows: Number(newRoom.rows),
        cols: Number(newRoom.cols),
        skip_rows: Boolean(newRoom.skip_rows),
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to create room");
      }

      const newRoomData = await response.json();
      setRooms((prev) => [...prev, newRoomData]);
      
      setIsAdding(false);
      setNewRoom({ room_id: "", rows: 5, cols: 5, skip_rows: false });
      setError("");

      toast({
        title: "Room created successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError("Failed to create room: " + err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to create room",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Card px="0px" boxShadow="xl" overflowX={{ sm: "scroll", lg: "hidden" }}>
      {error && (
        <Text color="#FF3B3B " textAlign="center" fontSize="lg" mb="4">
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
          Rooms
        </Text>
        <HStack spacing={2}>
          <Input
            placeholder="Search Rooms..."
            value={searchQuery}
            onChange={handleSearch}
            size="sm"
            w="200px"
          />
          <Button
            leftIcon={<MdAdd />}
            colorScheme="blue"
            size="sm"
            onClick={handleAddRoom}
            disabled={isAdding || editableRoom}
          >
            Add Room
          </Button>
        </HStack>
      </Flex>
      
      <Box overflowY="auto" maxHeight="400px">
        {isLoading ? (
          <Box textAlign="center" py="8">
            <Spinner size="xl" />
          </Box>
        ) : (
          <Table variant="simple" color="gray.500" mb="24px">
            <Thead position="sticky" top="0" zIndex="1" bg="blue">
              <Tr bg="blue" textColor="white">
                <Th textColor="white">Index</Th>
                <Th textColor="white">Room ID</Th>
                <Th textColor="white">Rows</Th>
                <Th textColor="white">Columns</Th>
                <Th textColor="white">Skip Rows</Th>
                <Th textColor="white">Total Seats</Th>
                <Th textColor="white">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {/* Add new room row */}
              {isAdding && (
                <Tr bg="blue.50">
                  <Td>New</Td>
                  <Td>
                    <Input
                      value={newRoom.room_id}
                      onChange={(e) => setNewRoom({...newRoom, room_id: e.target.value})}
                      placeholder="Enter room ID"
                      size="sm"
                    />
                  </Td>
                  <Td>
                    <NumberInput 
                      size="sm" 
                      min={1} 
                      max={20}
                      value={newRoom.rows}
                      onChange={(value) => setNewRoom({...newRoom, rows: parseInt(value) || 1})}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Td>
                  <Td>
                    <NumberInput 
                      size="sm" 
                      min={1} 
                      max={20}
                      value={newRoom.cols}
                      onChange={(value) => setNewRoom({...newRoom, cols: parseInt(value) || 1})}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Td>
                  <Td>
                    <Switch 
                      isChecked={newRoom.skip_rows}
                      onChange={(e) => setNewRoom({...newRoom, skip_rows: e.target.checked})}
                      size="sm"
                    />
                  </Td>
                  <Td>{newRoom.rows * newRoom.cols}</Td>
                  <Td>
                    <Flex>
                      <Button
                        leftIcon={<MdDone />}
                        colorScheme="green"
                        size="sm"
                        onClick={handleSaveNewRoom}
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
                  </Td>
                </Tr>
              )}
              
              {/* Existing rooms */}
              {currentItems.map((room, index) => (
                <Tr key={room.room_id}>
                  <Td>{indexOfFirstItem + index + 1}</Td>
                  <Td>
                    {editableRoom && editableRoom.room_id === room.room_id ? (
                      <Input
                        value={editableRoom.room_id}
                        onChange={(e) => setEditableRoom({...editableRoom, room_id: e.target.value})}
                        size="sm"
                        disabled // Room ID should not be editable
                      />
                    ) : (
                      room.room_id
                    )}
                  </Td>
                  <Td>
                    {editableRoom && editableRoom.room_id === room.room_id ? (
                      <NumberInput 
                        size="sm" 
                        min={1} 
                        max={20}
                        value={editableRoom.rows}
                        onChange={(value) => setEditableRoom({...editableRoom, rows: parseInt(value) || 1})}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    ) : (
                      room.rows
                    )}
                  </Td>
                  <Td>
                    {editableRoom && editableRoom.room_id === room.room_id ? (
                      <NumberInput 
                        size="sm" 
                        min={1} 
                        max={20}
                        value={editableRoom.cols}
                        onChange={(value) => setEditableRoom({...editableRoom, cols: parseInt(value) || 1})}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    ) : (
                      room.cols
                    )}
                  </Td>
                  <Td>
                    {editableRoom && editableRoom.room_id === room.room_id ? (
                      <Switch 
                        isChecked={editableRoom.skip_rows}
                        onChange={(e) => setEditableRoom({...editableRoom, skip_rows: e.target.checked})}
                        size="sm"
                      />
                    ) : (
                      room.skip_rows ? "Yes" : "No"
                    )}
                  </Td>
                  <Td>
                    {editableRoom && editableRoom.room_id === room.room_id 
                      ? editableRoom.rows * editableRoom.cols 
                      : room.rows * room.cols
                    }
                  </Td>
                  <Td>
                    {editableRoom && editableRoom.room_id === room.room_id ? (
                      <Flex>
                        <Button
                          leftIcon={<MdDone />}
                          colorScheme="green"
                          size="sm"
                          onClick={handleSaveRoom}
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
                          onClick={() => handleEditRoom(room)}
                          disabled={isAdding || editableRoom}
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
                                `Are you sure you want to delete room ${room.room_id}?`
                              )
                            ) {
                              handleDeleteRoom(room.room_id);
                            }
                          }}
                          disabled={isAdding || editableRoom}
                        >
                          Delete
                        </Button>
                      </Flex>
                    )}
                  </Td>
                </Tr>
              ))}
              
              {!isLoading && currentItems.length === 0 && !isAdding && (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    {filteredRooms.length === 0 && searchQuery ? 
                      "No rooms found matching your search." : 
                      "No rooms added yet. Click 'Add Room' to get started."
                    }
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Box>
      
      {/* Pagination */}
      {filteredRooms.length > itemsPerPage && (
        <Flex justify="space-between" alignItems="center" px="25px" mt="20px">
          <Text color="gray.800">
            Showing {indexOfFirstItem + 1} -{" "}
            {Math.min(indexOfLastItem, filteredRooms.length)} of{" "}
            {filteredRooms.length}
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
              disabled={indexOfLastItem >= filteredRooms.length}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}
    </Card>
  );
};

export default RoomPage;