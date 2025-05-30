// Chakra imports
import {
  Box,
  Icon,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

// Assets
// Custom components
import MiniCalendar from "components/calendar/MiniCalendar";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import {
  MdBarChart,
  MdOutlineNaturePeople,
  MdPermContactCalendar,
  MdPerson2,
} from "react-icons/md";
// import CheckTable from "views/admin/default/components/CheckTable";
// import ComplexTable from "views/admin/default/components/ComplexTable";
// import DailyTraffic from "views/admin/default/components/DailyTraffic";
import PieCard from "views/admin/default/components/PieCard";
// import Tasks from "views/admin/default/components/Tasks";
// import TotalSpent from "views/admin/default/components/TotalSpent";
// import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
// import {
//   columnsDataCheck,
//   columnsDataComplex,
// } from "views/admin/default/variables/columnsData";
// import tableDataCheck from "views/admin/default/variables/tableDataCheck.json";
// import tableDataComplex from "views/admin/default/variables/tableDataComplex.json";
import TopProviderPayments from "views/admin/default/components/List";
import { GiWorld } from "react-icons/gi";
import { FaCity, FaFlag } from "react-icons/fa";



export default function UserReports() {

  const [farmerData, setfarmerData] = useState([]);
  const [farmData, setFarmData] = useState([]);

  const brandColor = useColorModeValue("blue.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('User is not authenticated');
        }
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/farm`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,

            
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setFarmData(data);
      } catch (error) {
        console.error("Error fetching farm data:", error);
      }
    };

    fetchFarms();
  }, []);
  useEffect(() => {
    const fetchfarmer = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('User is not authenticated');
        }
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/farmer`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,

            
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setfarmerData(data);
      } catch (error) {
        console.error("Error fetching farmer data:", error);
      }
    };

    fetchfarmer();
  }, []);

  

    
     
  const totalFarms=farmData.length;
  const totalfarmer=farmerData.length;


  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }}
        gap='20px'
        mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={GiWorld} color={brandColor} />
              }
            />
          }
          name='Total Farmers'
          value= {`${totalfarmer}` }
        />
                <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={GiWorld} color={brandColor} />
              }
            />
          }
          name='Total Farms'
          value= {`${totalFarms}` }
        />
      </SimpleGrid>

     
        {/* <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb={"10px"}>
          
          <PieCard />
        </SimpleGrid> */}
     
        <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px'>
          <MiniCalendar h='100%' W='100%' selectRange={false} color={brandColor} />
        </SimpleGrid>
    </Box>
  );
}
