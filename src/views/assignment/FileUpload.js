import React from "react";
import { Box, Button, Input, VStack } from "@chakra-ui/react";
import * as XLSX from "xlsx";

const FileUpload = ({ label, onFileUpload }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        onFileUpload(parsedData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <VStack spacing={2}>
      <Box>{label}</Box>
      <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
    </VStack>
  );
};

export default FileUpload;