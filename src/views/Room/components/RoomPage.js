import React, { useState, useEffect } from "react";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Spinner,
  Text,
  Center,
  Flex,
} from "@chakra-ui/react";
import { RepeatIcon } from '@chakra-ui/icons';
import RoomForm from "./RoomForm";

const RoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fetchRooms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Although not specified in the API docs, we assume there's an endpoint for listing all rooms
      // If not, we could consider fetching known room IDs from a separate endpoint
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
  };

  const handleAddRoom = async (room) => {
    setIsLoading(true);
    setError(null);
    try {
      // Format room object according to API requirements
      const roomData = {
        room_id: room.room_id,
        rows: Number(room.rows),
        cols: Number(room.cols),
        skip_rows: Boolean(room.skip_rows),
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

      const newRoom = await response.json();

      // Update state with the response from the API
      setRooms((prev) => [...prev, newRoom]);

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
    } finally {
      setIsLoading(false);
    }
  };  const handleEditRoom = async (updatedRoom) => {
    setIsLoading(true);
    setError(null);
    try {
      // Format room object according to API requirements
      const roomData = {
        room_id: updatedRoom.room_id,
        rows: Number(updatedRoom.rows),
        cols: Number(updatedRoom.cols),
        skip_rows: Boolean(updatedRoom.skip_rows),
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
      
      // Update state with the response from the API
      setRooms((prev) =>
        prev.map((room) => (room.room_id === updatedRoomData.room_id ? updatedRoomData : room))
      );
      
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
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteRoom = async (roomId) => {
    setIsLoading(true);
    setError(null);
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

      // For 204 No Content response, there's no body to parse
      // Just update the UI by removing the deleted room
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
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (room) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch the latest room data by ID before editing
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rooms/${room.room_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Room not found. It may have been deleted.");
        }
        throw new Error("Failed to fetch room details");
      }

      const roomData = await response.json();
      setEditingRoom(roomData);
      setIsModalOpen(true);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };  return (
    <Box>
      <Flex mb={4} justify="space-between" align="center">
        <Button colorScheme="blue" onClick={openAddModal}>
          Add Room
        </Button>
      </Flex>
      
      {isLoading && (
        <Center my={4}>
          <Spinner size="xl" />
        </Center>
      )}
      
      {error && (
        <Text color="red.500" my={4} textAlign="center">
          {error}
        </Text>
      )}
    
      <Table variant="simple" color="gray.500" mb="24px">
        <Thead position="sticky" top="0" zIndex="1" bg="blue" >
          <Tr bg="blue" textColor="white">
            <Th textColor="white">Room ID</Th>
            <Th textColor="white">Rows</Th>
            <Th textColor="white">Columns</Th>
            <Th textColor="white">Skip Rows</Th>
            <Th textColor="white">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rooms.map((room) => (
            <Tr key={room.room_id}>
              <Td>{room.room_id}</Td>
              <Td>{room.rows}</Td>
              <Td>{room.cols}</Td>
              <Td>{room.skip_rows ? "Yes" : "No"}</Td>
              <Td>
                <Button
                  size="sm"
                  colorScheme="yellow"
                  onClick={() => openEditModal(room)}
                  mr={2}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDeleteRoom(room.room_id)}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
          {!isLoading && rooms.length === 0 && (
            <Tr>
              <Td colSpan={5} textAlign="center">No rooms found. Add a new room to get started.</Td>
            </Tr>
          )}
        </Tbody>
      </Table>

      {/* Modal for Add/Edit Room */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingRoom ? "Edit Room" : "Add Room"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RoomForm
              initialData={editingRoom}
              onSubmit={(room) => {
                if (editingRoom) {
                  handleEditRoom(room);
                } else {
                  handleAddRoom(room);
                }
                closeModal();
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RoomPage;