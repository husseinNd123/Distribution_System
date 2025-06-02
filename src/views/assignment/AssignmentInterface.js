import React, { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  VStack, 
  useToast, 
  FormControl, 
  FormLabel, 
  Input, 
  NumberInput, 
  NumberInputField, 
  NumberInputStepper, 
  NumberIncrementStepper, 
  NumberDecrementStepper,
  Switch,
  HStack,
  Heading,
  Divider,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Select,
  Badge,
  Flex,
  Wrap,
  WrapItem,
  CloseButton,
  Spinner,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Checkbox,
  CheckboxGroup,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, RepeatIcon } from "@chakra-ui/icons";
import FileUpload from "./FileUpload";
import Card from "components/card/Card";
import ResultsTable from "./ResultsTable";
import ReportExport from "./ReportExport";
import { useAssignment } from "contexts/AssignmentContext";
import axios from "axios";

const AssignmentInterface = () => {  // Use Assignment Context instead of local state
  const {
    students,
    setStudents,
    rooms,
    setRooms,
    results,
    setResults,
    examRoomRestrictions,
    setExamRoomRestrictions,
    isLoading,
    setIsLoading,
    assignmentTimestamp,
    clearAssignmentData,
    hasSavedResults,
    getAssignmentSummary,
    saveAssignmentTimestamp
  } = useAssignment();

  const [newRoom, setNewRoom] = useState({ room_id: "", rows: 5, cols: 5, skip_rows: false });
  const [editingRoom, setEditingRoom] = useState(null);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedRoom, setSelectedRoom] = useState([]);
  // Helper function to show toast notifications
  const showToast = (message, status = 'info') => {
    toast({
      title: status === 'error' ? 'Error' : 
             status === 'success' ? 'Success' : 
             status === 'warning' ? 'Warning' : 'Info',
      description: message,
      status: status,
      duration: 5000,
      isClosable: true,
      position: "top-right"
    });
  };

  // Fetch rooms from the API
  const fetchRooms = async () => {
    try {
      setIsRoomsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rooms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const roomsData = await response.json();
      setRooms(roomsData);
      
      // Use toast directly instead of showAlert to avoid ThemeProvider issues
      // toast({
      //   title: "Success",
      //   description: "Rooms loaded successfully",
      //   status: "success",
      //   duration: 5000,
      //   isClosable: true,
      //   position: "top-right"
      // });
    } catch (error) {
      console.error("Error fetching rooms:", error);
      
      // Use toast directly instead of showAlert
      toast({
        title: "Error",
        description: `Failed to load rooms: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
    } finally {
      setIsRoomsLoading(false);
    }
  };

  // Load rooms when the component mounts
  useEffect(() => {
    fetchRooms();
  }, []);

  const handleFileUpload = (data, type) => {
    if (type === "students") {
      // Parse student_id to integer
      const parsedData = data.map(student => ({
        ...student,
        student_id: parseInt(student.student_id, 10) // Convert student_id to integer
      }));
      setStudents(parsedData);
    } else if (type === "rooms") {
      setRooms(data);
    }
  };
  const handleUpdateRoom = () => {
    // Validate room ID
    if (!newRoom.room_id.trim()) {
      showToast("Room ID is required", "error");
      return;
    }

    // Check for duplicate room ID (except for the current room)
    if (rooms.some(room => room.room_id === newRoom.room_id && room.room_id !== editingRoom.room_id)) {
      showToast("Room ID already exists", "error");
      return;
    }

    const updatedRooms = rooms.map(room => 
      room.room_id === editingRoom.room_id ? {...newRoom} : room
    );
      setRooms(updatedRooms);
    setNewRoom({ room_id: "", rows: 5, cols: 5, skip_rows: false });
    setEditingRoom(null);
    onClose();
    
    showToast("Room updated successfully", "success");
  };
  
  const handleDeleteRoom = (roomId) => {
    setRooms(rooms.filter(room => room.room_id !== roomId));
    
    showToast("Room deleted", "info");
  };

  const handleAssignSeats = async () => {
    try {
      setIsLoading(true);
      
      // Check if any exam has restrictions but doesn't have enough seats
      const invalidExams = [];
      Object.entries(examRoomRestrictions).forEach(([exam, allowedRooms]) => {
        // Count students with this exam
        const studentsWithExam = students.filter(s => s.exam_name === exam).length;
        
        // Calculate total seats in allowed rooms
        const totalSeats = allowedRooms.reduce((total, roomId) => {
          const room = rooms.find(r => r.room_id === roomId);
          if (!room) return total;
          
          const seatsInRoom = room.rows * room.cols;
          return total + seatsInRoom;
        }, 0);
        
        if (studentsWithExam > totalSeats) {
          invalidExams.push({ 
            exam, 
            students: studentsWithExam, 
            seats: totalSeats 
          });
        }
      });
      
      // If we found some invalid restrictions, show warning
      if (invalidExams.length > 0) {
        const warningMessage = invalidExams.map(item => 
          `${item.exam}: ${item.students} students, only ${item.seats} seats available`
        ).join('\n');
        
        toast({
          title: "Insufficient seats for some exams",
          description: warningMessage,
          status: "warning",
          duration: 6000,
          isClosable: true,
        });
        
        if (!window.confirm("There might not be enough seats for all students with the current restrictions. Continue anyway?")) {
          setIsLoading(false);
          return;
        }
      }
      
      // Configure axios headers with authorization token and referrer policy
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      };
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';
      const response = await axios.post(`${apiUrl}/assignments/assign`, {
        students,
        rooms,
        exam_room_restrictions: examRoomRestrictions      }, config);
        setResults(response.data.assignments);
      saveAssignmentTimestamp(); // Save timestamp when assignment is successful
      
      showToast("Seat assignment successful!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "An error occurred.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  

  // Extract all unique exam names from students
  const getUniqueExams = () => {
    const exams = new Set();
    students.forEach(student => {
      if (student.exam_name) {
        exams.add(student.exam_name);
      }
    });
    return Array.from(exams);
  };
  
  // Effect to clean up restrictions when student data changes
  useEffect(() => {
    // Don't do anything if no students
    if (students.length === 0) return;
    
    // Get existing exams from students
    const existingExams = new Set();
    students.forEach(student => {
      if (student.exam_name) {
        existingExams.add(student.exam_name);
      }
    });
    
    // Clean up restrictions for exams that no longer exist
    setExamRoomRestrictions(prev => {
      const currentRestrictions = {...prev};
      let changed = false;
      
      Object.keys(currentRestrictions).forEach(exam => {
        if (!existingExams.has(exam)) {
          delete currentRestrictions[exam];
          changed = true;
        }
      });
      
      return changed ? currentRestrictions : prev;
    });
  }, [students]);
  
  // Effect to clean up restrictions when room data changes
  useEffect(() => {
    // Don't do anything if no rooms
    if (rooms.length === 0) return;
    
    // Get existing room IDs
    const existingRooms = new Set(rooms.map(r => r.room_id));
    
    // Clean up restrictions for rooms that no longer exist
    setExamRoomRestrictions(prev => {
      const currentRestrictions = {...prev};
      let changed = false;
      
      Object.entries(currentRestrictions).forEach(([exam, allowedRooms]) => {
        const validRooms = allowedRooms.filter(room => existingRooms.has(room));
        if (validRooms.length !== allowedRooms.length) {
          currentRestrictions[exam] = validRooms;
          changed = true;
          
          if (validRooms.length === 0) {
            delete currentRestrictions[exam];
          }
        }
      });
        return changed ? currentRestrictions : prev;
    });
  }, [rooms]);
  
  // Handle adding a room restriction for an exam
  const handleAddRestriction = () => {
    if (!selectedExam || !selectedRoom || (Array.isArray(selectedRoom) && selectedRoom.length === 0)) {
      showToast("Please select both an exam and at least one room", "warning");
      return;
    }

    // Ensure selectedRoom is always treated as an array
    const roomsToAdd = Array.isArray(selectedRoom) ? selectedRoom : [selectedRoom];

    setExamRoomRestrictions(prev => {
      const currentRestrictions = prev[selectedExam] || [];
        // Filter out rooms that are already in the restrictions
      const newRooms = roomsToAdd.filter(room => !currentRestrictions.includes(room));
      
      if (newRooms.length === 0) {
        showToast(`Selected room(s) are already restricted for ${selectedExam}`, "warning");
        return prev;
      }

      return {
        ...prev,
        [selectedExam]: [...currentRestrictions, ...newRooms]
      };
    });

    setSelectedRoom([]);
  };

  // Handle removing a room restriction for an exam
  const handleRemoveRestriction = (exam, room) => {
    setExamRoomRestrictions(prev => {
      // If room is not provided, remove all restrictions for this exam
      if (!room) {
        const updatedRestrictions = { ...prev };
        delete updatedRestrictions[exam];
        return updatedRestrictions;
      }
      
      const updatedRestrictions = {
        ...prev,
        [exam]: prev[exam].filter(r => r !== room)
      };
      
      // If no more restrictions for this exam, remove the key
      if (updatedRestrictions[exam].length === 0) {
        delete updatedRestrictions[exam];
      }
        return updatedRestrictions;
    });
  };

  // Function to calculate exam statistics
  const calculateExamStats = () => {
    const examCounts = {};
    let totalStudents = 0;
    
    students.forEach(student => {
      const exam = student.exam_name || "Unspecified";
      examCounts[exam] = (examCounts[exam] || 0) + 1;
      totalStudents++;
    });
    
    return {
      examCounts,
      totalStudents,
      uniqueExamCount: Object.keys(examCounts).length
    };
  };
  return (
    <Box mt={24}>
      {/* Saved Results Banner */}
      {hasSavedResults() && (
        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Assignment Results Available!</AlertTitle>
            <AlertDescription>
              You have saved assignment results from{" "}
              {assignmentTimestamp && new Date(assignmentTimestamp).toLocaleString()}.{" "}
              {getAssignmentSummary()?.totalStudents} students assigned to{" "}
              {getAssignmentSummary()?.totalRooms} rooms for{" "}
              {getAssignmentSummary()?.totalExams} exams.
            </AlertDescription>
          </Box>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={clearAssignmentData}
            ml={3}
          >
            Clear Results
          </Button>
        </Alert>
      )}
      
      <VStack mt={24} spacing={6} align="stretch">
        {/* Students Section */}
        <Box>
          <Heading size="md" mb={4}>Students</Heading>
          <FileUpload
            label="Upload Students"
            onFileUpload={(data) => handleFileUpload(data, "students")}
          />
          <Text mt={2} fontSize="sm" color="gray.600">
            {students.length} students loaded
          </Text>
          
          {/* Exam Stats Section */}
          {students.length > 0 && (
            <Box mt={4}>
              <Card variant="outline" mb={3}>
                  <Heading size="sm">Student Distribution by Exam</Heading>
                  <StatGroup>
                    <Stat>
                      <StatLabel>Total Students</StatLabel>
                      <StatNumber>{students.length}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Unique Exams</StatLabel>
                      <StatNumber>{getUniqueExams().length}</StatNumber>
                    </Stat>
                  </StatGroup>
              </Card>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                {getUniqueExams().map(exam => {
                  const count = students.filter(s => s.exam_name === exam).length;
                  const percentage = ((count / students.length) * 100).toFixed(1);
                  return (
                    <Card key={exam} variant="outline" size="sm">
                        <Stat>
                          <StatLabel>{exam}</StatLabel>
                          <StatNumber>{count}</StatNumber>
                          <StatHelpText>{percentage}% of total</StatHelpText>
                        </Stat>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Rooms Section */}
        <Box>
          <Heading size="md" mb={4}>
            Rooms
            <IconButton
              aria-label="Refresh rooms"
              icon={<RepeatIcon />}
              size="sm"
              ml={2}
              onClick={fetchRooms}
              isLoading={isRoomsLoading}
            />
          </Heading>
          
          {/* Table of rooms */}
          {isRoomsLoading ? (
            <Flex justify="center" align="center" py={8}>
              <Spinner size="xl" />
            </Flex>
          ) : rooms.length > 0 ? (
            <Box maxH="400px" overflowY="auto" borderRadius="md" borderWidth="1px">
              <Table variant="simple" position="relative">
                <Thead position="sticky" top={0} bg="white" zIndex={1} borderBottomWidth="1px">
                  <Tr>
                    <Th>Room ID</Th>
                    <Th isNumeric>Rows</Th>
                    <Th isNumeric>Columns</Th>
                    <Th>Skip Rows</Th>
                    <Th>Total Seats</Th>
                    {/* <Th>Actions</Th> */}
                  </Tr>
                </Thead>
                <Tbody>
                  {rooms.map((room) => (
                    <Tr key={room.room_id}>
                      <Td>{room.room_id}</Td>
                      <Td isNumeric>{room.rows}</Td>
                      <Td isNumeric>{room.cols}</Td>
                      <Td>{room.skip_rows ? "Yes" : "No"}</Td>
                      <Td isNumeric>{room.rows * room.cols}</Td>
                      {/* <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit room"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => handleEditRoom(room)}
                          />
                          <IconButton
                            aria-label="Delete room"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteRoom(room.room_id)}
                          />
                        </HStack>
                      </Td> */}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Box p={4} bg="gray.50" borderRadius="md" textAlign="center">
              No rooms added yet. Create rooms using the form above.
            </Box>
          )}
        </Box>

        <Divider />

        {/* Exam Room Restrictions Section */}
        <Box>
          <Heading size="md" mb={4}>Exam Room Restrictions</Heading>
          <Text mb={4} color="gray.600">
            Specify which rooms are allowed for each exam. Students taking an exam will only be assigned to rooms listed for that exam.
          </Text>
          
          {students.length > 0 ? (
            <>
              <HStack spacing={4} mb={4}>
                <FormControl>
                  <FormLabel>Exam</FormLabel>
                  <Select 
                    placeholder="Select exam" 
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                  >
                    {getUniqueExams().map(exam => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Allowed Room</FormLabel>
                  <Box 
                    border="1px solid" 
                    borderColor="inherit" 
                    borderRadius="md" 
                    p={2}
                    maxH="100px"
                    overflowY="auto"
                  >
                    {rooms.length > 0 ? (
                      <CheckboxGroup 
                        value={Array.isArray(selectedRoom) ? selectedRoom : selectedRoom ? [selectedRoom] : []}
                        onChange={(values) => setSelectedRoom(values)}
                        isDisabled={!selectedExam}
                      >
                        <VStack align="start" spacing={1}>
                          {rooms.map(room => (
                            <Checkbox key={room.room_id} value={room.room_id}>
                              {room.room_id}: ({room.rows * room.cols} seats)
                            </Checkbox>
                          ))}
                        </VStack>
                      </CheckboxGroup>
                    ) : (
                      <Text color="gray.500">No rooms available</Text>
                    )}
                  </Box>
                </FormControl>
                
                <Button 
                  colorScheme="blue" 
                  onClick={handleAddRestriction}
                  alignSelf="flex-end"
                  isDisabled={!selectedExam || !selectedRoom || (Array.isArray(selectedRoom) && selectedRoom.length === 0) || isLoading}
                >
                  <AddIcon />
                </Button>
              </HStack>
              
              {Object.keys(examRoomRestrictions).length > 0 ? (
                <Table variant="simple" mb={4}>
                  <Thead>
                    <Tr>
                      <Th>Exam</Th>
                      <Th>Allowed Rooms</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(examRoomRestrictions).map(([exam, allowedRooms]) => (
                      <Tr key={exam}>
                        <Td>{exam}</Td>
                        <Td>
                          <Wrap spacing={2}>
                            {allowedRooms.map(room => (
                              <WrapItem key={`${exam}-${room}`}>
                                <Badge colorScheme="blue" borderRadius="full" px={2} py={1}>
                                  <Flex align="center">
                                    {room}
                                    <CloseButton 
                                      size="sm" 
                                      ml={1} 
                                      onClick={() => handleRemoveRestriction(exam, room)}
                                    />
                                  </Flex>
                                </Badge>
                              </WrapItem>
                            ))}
                          </Wrap>
                        </Td>
                        <Td>
                          <IconButton
                            aria-label="Remove all restrictions"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleRemoveRestriction(exam)}
                            isDisabled={isLoading}
                            title="Remove all rooms for this exam"
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Box p={4} bg="gray.50" borderRadius="md" textAlign="center" mb={4}>
                  No exam restrictions added. By default, students can be assigned to any room.
                </Box>
              )}
              <Box p={3} bg="blue.50" borderRadius="md" mb={4}>
                <Text fontSize="sm">
                  <b>Note:</b> Room restrictions will be included in the API request when you click "Assign Seats". 
                  Students will only be placed in rooms specified for their exam.
                </Text>
              </Box>
            </>
          ) : (
            <Box p={4} bg="gray.50" borderRadius="md" textAlign="center">
              Please upload student data first to configure exam restrictions.
            </Box>
          )}
        </Box>

        <Divider />        {/* Action Buttons */}
        <Box>
          <HStack spacing={4}>
            <Button 
              colorScheme="green" 
              size="lg" 
              onClick={handleAssignSeats} 
              isDisabled={!students.length || !rooms.length || isLoading}
              flex={1}
              isLoading={isLoading}
              loadingText="Assigning..."
            >
              Assign Seats
            </Button>
            
            {hasSavedResults() && (
              <Button 
                colorScheme="gray" 
                variant="outline"
                size="lg"
                onClick={clearAssignmentData}
                isDisabled={isLoading}
              >
                New Assignment
              </Button>
            )}
          </HStack>
        </Box>{/* Results Table */}
        {results.length > 0 && <ResultsTable results={results} rooms={rooms} />}
        
        {/* Report Export Section */}
        {results.length > 0 && (
          <>
            <Divider />
            <ReportExport results={results} rooms={rooms} students={students} />
          </>
        )}
      </VStack>

    </Box>
  );
};

export default AssignmentInterface;
