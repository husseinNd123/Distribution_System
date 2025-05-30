import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Text,
  Grid,
  GridItem,
} from "@chakra-ui/react";

const colors = {
  Math: "blue.100",
  Physics: "green.300",
  Chemistry: "red.300",
  Biology: "yellow.300",
  History: "purple.300",
};

const RoomModal = ({ isOpen, onClose, room = {} }) => {
  // Use default values for missing properties
  const { 
    room_id = "Unknown Room", 
    rows = 10,  // Default to 10 if not provided
    cols = 10,  // Default to 10 if not provided
    students = [] 
  } = room;

  // Create a grid representation of the room (ensure at least 1x1 grid)
  const grid = Array.from({ length: Math.max(1, rows) }, () => 
    Array(Math.max(1, cols)).fill(null)
  );

  // Assign students to the grid
  students.forEach((student) => {
    // Check if student has row and col properties
    if (student.row !== undefined && student.col !== undefined) {
      if (student.row >= 0 && student.row < rows && student.col >= 0 && student.col < cols) {
        grid[student.row][student.col] = student;
      } else {
        console.warn(
          `Invalid seat assignment for student ${student.student_id}: row ${student.row}, col ${student.col}`
        );
      }
    } else {
      console.warn(`Student ${student.student_id} is missing row or col values`);
    }
  });

  // Don't render grid if dimensions are too small
  const showGrid = rows > 0 && cols > 0;

  // Function to get seat number (1-based) from row and column
  const getSeatNumber = (row, col) => {
    return row * cols + col + 1;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Room Layout: {room_id}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <Text fontSize="md" fontWeight="bold">
              Exam Color Legend:
            </Text>
            <Box display="flex" flexWrap="wrap" gap={4} mt={2}>
              {Object.keys(colors).map((exam) => (
                <Box key={exam} display="flex" alignItems="center" gap={2}>
                  <Box w={4} h={4} bg={colors[exam]} borderRadius="md" />
                  <Text>{exam}</Text>
                </Box>
              ))}
            </Box>
          </Box>
          
          {showGrid ? (
            <Grid templateColumns={`repeat(${cols}, 1fr)`} gap={2}>
              {grid.map((row, rowIndex) =>
                row.map((seat, colIndex) => {
                  const seatNumber = getSeatNumber(rowIndex, colIndex);
                  return (
                    <GridItem
                      key={`${rowIndex}-${colIndex}`}
                      w="40px"
                      h="40px"
                      bg={seat ? colors[seat.exam_name] || "gray.400" : "gray.200"}
                      border="1px solid"
                      borderColor="gray.400"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="md"
                      position="relative"
                    >
                      {/* Show seat number in top left corner */}
                      <Box
                        position="absolute"
                        top="1px"
                        left="2px"
                        fontSize="10px"
                        color="gray.600"
                      >
                        {seatNumber}
                      </Box>
                      
                      {/* Student ID */}
                      {seat && (
                        <Text fontSize="sm">
                          {seat.student_id}
                        </Text>
                      )}
                    </GridItem>
                  );
                })
              )}
            </Grid>
          ) : (
            <Box p={4} textAlign="center" bg="red.100" borderRadius="md">
              <Text>Room dimensions are not defined properly (rows: {rows}, cols: {cols})</Text>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RoomModal;