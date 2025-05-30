import React, { useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Button,
  VStack,
} from "@chakra-ui/react";

const RoomForm = ({ initialData = null, onSubmit }) => {
  const [formData, setFormData] = useState(
    initialData || { room_id: "", rows: "", cols: "", skip_rows: false }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Room ID</FormLabel>
          <Input
            name="room_id"
            value={formData.room_id}
            onChange={handleChange}
            isDisabled={!!initialData} // Disable editing room_id for existing rooms
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Rows</FormLabel>
          <Input
            name="rows"
            type="number"
            value={formData.rows}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Columns</FormLabel>
          <Input
            name="cols"
            type="number"
            value={formData.cols}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl>
          <Checkbox
            name="skip_rows"
            isChecked={formData.skip_rows}
            onChange={handleChange}
          >
            Skip Rows
          </Checkbox>
        </FormControl>
        <Button type="submit" colorScheme="blue">
          {initialData ? "Update Room" : "Add Room"}
        </Button>
      </VStack>
    </form>
  );
};

export default RoomForm;