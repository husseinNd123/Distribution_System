import React, { useState } from "react";
import { Button, Container, Center } from "@chakra-ui/react";
import { MdAdd, MdRemove } from "react-icons/md";
import  InsertRole from "./components/insertRole"; 
import ListRole  from "./components/ListRole";
import QueryProvider from "../../QueryProvider";

export default function Role() {
    const [showInsertRole, setShowInsertRole] = useState(false);

    const toggleInsertRole = () => {
        setShowInsertRole(!showInsertRole);
    };

    return (
        <Container maxW="xxl" mt={100}>
            <Center>
                <Button 
                    colorScheme={showInsertRole ? "red" : "blue"} // Change color scheme dynamically
                    leftIcon={showInsertRole ? <MdRemove /> : <MdAdd />} // Change icon dynamically
                    onClick={toggleInsertRole}
                    marginBottom={"20px"}
                >
                    {showInsertRole ? "Hide Add Role" : "Add Role"}
                </Button>
            </Center>
            <div style={{ marginBottom: showInsertRole ? '20px' : '0' } }>
                {showInsertRole && <InsertRole />}
            </div>
            <QueryProvider>
                <ListRole />
            </QueryProvider>
        </Container>
    );
}
