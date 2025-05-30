// TopProviderPayments.js

import React from "react";
import { Table, Tbody, Td, Th, Thead, Tr,Flex,Text,useColorModeValue } from "@chakra-ui/react";
// import { MdAttachMoney } from "react-icons/md";
import Card from "components/card/Card";


const TopProviderPayments = ({ topPayments }) => {
    const textColor = useColorModeValue("secondaryGray.900", "white");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

    // Check if topPayments is an array before rendering
  if (!Array.isArray(topPayments)) {
    return null; // Return null if topPayments is not an array
  }
  return (
    <Card
    direction='column'
    w='100%'
    px='0px'
    overflowX={{ sm: "scroll", lg: "hidden" }}>
    <Flex px='25px' justify='space-between' mb='10px' align='center'>
      <Text
        color={textColor}
        fontSize='22px'
        fontWeight='700'
        lineHeight='100%'>
        Top Provider
      </Text>
      
    </Flex>
    <Table  variant='simple' color='gray.500' mb='24px'>
          <Thead position="sticky" top="0" zIndex="1" bg="blue" >
        <Tr>
          <Th
           pe='10px'
           
           borderColor={borderColor}>
           <Flex
             justify='space-between'
             align='center'
             fontSize={{ sm: "10px", lg: "12px" }}
             color='gray.400'>
           
           </Flex>Provider User</Th>
          <Th
           pe='10px'
           
           borderColor={borderColor}>
           <Flex
             justify='space-between'
             align='center'
             fontSize={{ sm: "10px", lg: "12px" }}
             color='gray.400'>
           
           </Flex>Amount</Th>
           <Th
           pe='10px'
           
           borderColor={borderColor}>
           <Flex
             justify='space-between'
             align='center'
             fontSize={{ sm: "10px", lg: "12px" }}
             color='gray.400'>
           
           </Flex>DatePay</Th>
        </Tr>
      </Thead>
      <Tbody>
        {topPayments.map((payment, index) => (
          <Tr key={index}>
            <Td>{payment.providerName}</Td>
            <Td>
            
              {payment.amount}$
            </Td>
            <Td>{payment.DatePay}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
    </Card>

  );
};

export default TopProviderPayments;
