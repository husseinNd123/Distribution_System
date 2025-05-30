import React, { useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Box, Text, Button, useDisclosure, Divider, VStack, HStack } from "@chakra-ui/react";
import RoomModal from "./RoomModal";

const ResultsTable = ({ results, rooms }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();


  // Group students by room_id
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.room_id]) {
      acc[result.room_id] = [];
    }
    acc[result.room_id].push(result);
    return acc;
  }, {});

  const handleRoomClick = (room_id) => {

    // Find room or create default
    const room = rooms?.find((r) => r.room_id === room_id);
    const students = groupedResults[room_id] || [];
    

    // Create room data with default values if needed
    const roomData = {
      room_id,
      rows: room?.rows || 10, // Default to 10 if not found
      cols: room?.cols || 10,  // Default to 10 if not found
      skip_rows: room?.skip_rows || false,
      students
    };
    
    setSelectedRoom(roomData);
    onOpen();
  };

  return (
    <Box p={6} bg="gray.50" borderRadius="md" boxShadow="md">
      <VStack spacing={6} align="stretch">
        {Object.keys(groupedResults).map((room_id) => (
          <Box key={room_id} p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <HStack justify="space-between" align="center" mb={4}>
              <Text fontSize="lg" fontWeight="bold">
                Room: {room_id}
              </Text>
              <Button colorScheme="blue" onClick={() => handleRoomClick(room_id)}>
                View Room Layout
              </Button>
            </HStack>
            <Divider mb={4} />
            <Text>Students: {groupedResults[room_id].length}</Text>
          </Box>
        ))}

        {/* Room Modal */}
        {selectedRoom && (
          <RoomModal
            isOpen={isOpen}
            onClose={onClose}
            room={selectedRoom}
          />
        )}
      </VStack>
    </Box>
  );
};

export default ResultsTable;