import React, { useState } from "react";
import { 
  Box, 
  ChakraProvider, 
  VStack, 
  Input, 
  useToast 
} from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import RoomPage from "./components/RoomPage"; // Updated component for room management
import * as XLSX from "xlsx";

const queryClient = new QueryClient();

const Customers = () => {
  const [students, setStudents] = useState([]);
  const toast = useToast();

  // Handle Excel file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        setStudents(parsedData);
        toast({
          title: "File uploaded successfully!",
          description: "Student data has been loaded.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Box mt={28}>
          <VStack spacing={4}>
            <RoomPage />
          </VStack>
        </Box>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default Customers;
