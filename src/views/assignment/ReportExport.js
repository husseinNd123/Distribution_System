import React, { useState } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,  Select,
  SimpleGrid,
  Flex,  useToast,
  IconButton,
  Tooltip,
  Grid,
  GridItem
} from "@chakra-ui/react";
import { DownloadIcon, ViewIcon } from "@chakra-ui/icons";
import Card from "components/card/Card.js";

const ReportExport = ({ results, rooms, students }) => {
  const [selectedReport, setSelectedReport] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reportData, setReportData] = useState(null);
  const [reportTitle, setReportTitle] = useState("");
  const toast = useToast();

  // Helper function to calculate seat number from row and col
  const getSeatNumber = (row, col, roomCols) => {
    return row * roomCols + col + 1;
  };

  // Helper function to find student name by ID
  const getStudentName = (studentId) => {
    const student = students.find(s => s.student_id === studentId);
    return student?.name || student?.student_name || `Student ${studentId}`;
  };

  // Helper function to find student language by ID
  const getStudentLanguage = (studentId) => {
    const student = students.find(s => s.student_id === studentId);
    return student?.language || "N/A";
  };
  // Report 7: Arabic Student Distribution by ID Numbers Report (All Rooms)
  const generateStudentDistributionByIdReport = () => {
    // Gather all results
    const allStudentsData = results.map(result => {
      const room = rooms.find(r => r.room_id === result.room_id);
      const seatNumber = getSeatNumber(result.row, result.col, room?.cols || 10);
      
      return {
        studentId: result.student_id,
        studentName: getStudentName(result.student_id),
        roomId: result.room_id,
        seatNumber: seatNumber,
        exam: result.exam_name,
        language: getStudentLanguage(result.student_id)
      };    });
    
    // Sort by student ID (convert to string for proper comparison)
    allStudentsData.sort((a, b) => String(a.studentId).localeCompare(String(b.studentId)));
    
    // Get statistics
    const totalStudents = allStudentsData.length;
    const englishStudents = allStudentsData.filter(s => s.language === 'english').length;
    const frenchStudents = allStudentsData.filter(s => s.language === 'french').length;
    
    // Group by exam for statistics
    const examStats = {};
    allStudentsData.forEach(student => {
      if (!examStats[student.exam]) {
        examStats[student.exam] = 0;
      }
      examStats[student.exam]++;
    });
    
    // Group by room for statistics
    const roomStats = {};
    allStudentsData.forEach(student => {
      if (!roomStats[student.roomId]) {
        roomStats[student.roomId] = 0;
      }
      roomStats[student.roomId]++;
    });    return {
      students: allStudentsData,
      totalStudents,
      englishStudents,
      frenchStudents,
      examStats,
      roomStats,
      reportType: 'student-distribution-by-id'
    };
  };

  // Report 8: Subject Distribution Across Rooms Report (توزيع المواد على القاعات)
  const generateSubjectRoomDistributionReport = () => {
    // Group data by exam/subject and room
    const subjectRoomData = {};
    
    results.forEach(result => {
      const exam = result.exam_name;
      const roomId = result.room_id;
      const studentLanguage = getStudentLanguage(result.student_id);
      
      if (!subjectRoomData[exam]) {
        subjectRoomData[exam] = {};
      }
      
      if (!subjectRoomData[exam][roomId]) {
        subjectRoomData[exam][roomId] = {
          count: 0,
          englishCount: 0,
          frenchCount: 0,
          students: []
        };
      }
      
      subjectRoomData[exam][roomId].count++;
      if (studentLanguage === 'english') {
        subjectRoomData[exam][roomId].englishCount++;
      } else if (studentLanguage === 'french') {
        subjectRoomData[exam][roomId].frenchCount++;
      }
      
      subjectRoomData[exam][roomId].students.push({
        studentId: result.student_id,
        studentName: getStudentName(result.student_id),
        language: studentLanguage
      });
    });

    // Convert to array format for easier rendering
    const distributionData = [];
    Object.entries(subjectRoomData).forEach(([exam, roomsData]) => {
      Object.entries(roomsData).forEach(([roomId, data]) => {
        distributionData.push({
          exam,
          roomId,
          totalCount: data.count,
          englishCount: data.englishCount,
          frenchCount: data.frenchCount,
          students: data.students
        });
      });
    });    // Sort by exam, then by room
    distributionData.sort((a, b) => {
      if (a.exam !== b.exam) {
        return String(a.exam).localeCompare(String(b.exam));
      }
      return String(a.roomId).localeCompare(String(b.roomId));
    });

    // Calculate overall statistics
    const totalStudents = results.length;
    const totalExams = Object.keys(subjectRoomData).length;
    const totalRooms = [...new Set(results.map(r => r.room_id))].length;
    const englishStudents = results.filter(r => getStudentLanguage(r.student_id) === 'english').length;
    const frenchStudents = results.filter(r => getStudentLanguage(r.student_id) === 'french').length;

    return {
      distributionData,
      totalStudents,
      totalExams,
      totalRooms,
      englishStudents,
      frenchStudents,
      subjectRoomData,
      reportType: 'subject-room-distribution'
    };
  };  const handleGenerateReport = () => {
    if (!selectedReport) {
      toast({
        title: "No Report Selected",
        description: "Please select a report type",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let data;
    let title;    switch (selectedReport) {
      case "student-distribution-by-id":
        data = generateStudentDistributionByIdReport();
        title = "Student Distribution by ID Numbers (All Rooms) - توزيع الطلاب حسب تسلسل الأرقام";
        break;
      case "subject-room-distribution":
        data = generateSubjectRoomDistributionReport();
        title = "Subject Distribution Across Rooms - توزيع المواد على القاعات";
        break;
      case "student-id-grid":
        data = generateStudentIdGridReport();
        title = "Student ID Grid Report";
        break;
      case "room-attendance":
        data = generateRoomAttendanceReport(results[0]?.room_id || rooms[0]?.room_id);
        title = "Room Attendance Report";
        break;
      case "enhanced-subject-distribution":
        data = generateEnhancedSubjectDistributionReport();
        title = "Enhanced Subject Distribution Report";
        break;
      case "detailed-student-grid":
        data = generateDetailedStudentGridReport();
        title = "Detailed Student Grid Report";
        break;
      default:
        return;
    }

    setReportData(data);
    setReportTitle(title);
    onOpen();
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintHTML();
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  const generatePrintHTML = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    let tableContent = "";

    switch (selectedReport) {
      case "student-distribution-by-id":
        tableContent = `
          <div style="font-family: Arial, Tahoma, sans-serif; max-width: 800px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
              <div style="text-align: right; direction: rtl;">
                <div style="font-weight: bold; font-size: 16px;">الجامعة اللبنانية</div>
                <div style="font-weight: bold; font-size: 16px;">كلية العلوم</div>
                <div style="font-size: 12px;">تليفون - فاكس: 0096615461496</div>
              </div>
              <div style="text-align: center; margin-top: 10px;">
                <div style="font-weight: bold; font-size: 14px;">الأربعاء</div>
                <div style="font-weight: bold; font-size: 14px;">${currentDate}</div>
              </div>
              <div style="text-align: left; direction: ltr;">
                <div style="font-weight: bold; font-size: 14px;">UNIVERSITE LIBANAISE</div>
                <div style="font-weight: bold; font-size: 14px;">Faculté Des Sciences</div>
                <div style="font-size: 12px;">Tel-Fax:0096615461496</div>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 25px; direction: rtl;">
              <h2 style="margin-bottom: 5px;">توزيع الطلاب حسب تسلسل الأرقام</h2>
              <div style="margin-top: 10px; display: flex; justify-content: space-between;">
                <div>08:30-10:00</div>
                <div>امتحانات الفصل الاول ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</div>
              </div>
            </div>
            
            <div style="margin-bottom: 20px; direction: rtl;">
              <h3 style="text-align: right;">إحصائيات التوزيع</h3>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div><strong>إجمالي الطلاب:</strong> ${reportData.totalStudents}</div>
                <div><strong>انكليزي:</strong> ${reportData.englishStudents}</div>
                <div><strong>فرنسي:</strong> ${reportData.frenchStudents}</div>
              </div>
              
              <div style="margin-top: 15px;">
                <div><strong>التوزيع حسب القاعات:</strong></div>
                <ul style="list-style-type: none; padding: 0; columns: 3;">
                  ${Object.entries(reportData.roomStats).map(([room, count]) => `
                    <li>${room}: ${count} طالب</li>
                  `).join('')}
                </ul>
              </div>
              
              <div style="margin-top: 15px;">
                <div><strong>التوزيع حسب المواد:</strong></div>
                <ul style="list-style-type: none; padding: 0; columns: 3;">
                  ${Object.entries(reportData.examStats).map(([exam, count]) => `
                    <li>${exam}: ${count} طالب</li>
                  `).join('')}
                </ul>
              </div>
            </div>

            <div style="direction: rtl;">
              <h2 style="text-align: center; margin-bottom: 20px; margin-top: 30px;">توزيع الطلاب حسب تسلسل الأرقام</h2>
              
              <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">
                ${(reportData.students || []).map((student) => `
                  <div style="border: 1px solid #000; padding: 5px; text-align: center; margin-bottom: 5px;">
                    <div style="font-weight: bold;">${student.studentId}</div>
                    <div style="font-size: 14px;">${student.seatNumber}</div>
                    <div style="font-size: 12px; color: #555;">${student.roomId}</div>
                    <div style="font-size: 11px; color: #777;">${student.exam}</div>
                  </div>
                `).join('')}
              </div>
              
              <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                <div style="border-top: 1px solid #000; padding-top: 5px; width: 100px; text-align: center;">التوقيع</div>
                <div style="border-top: 1px solid #000; padding-top: 5px; width: 100px; text-align: center;">التاريخ</div>
                <div style="border-top: 1px solid #000; padding-top: 5px; width: 150px; text-align: center;">اسم المنسق</div>
              </div>

              <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
                <div style="text-align: center; font-weight: bold;">الإجمالي</div>
                <div style="text-align: center; font-weight: bold;">انكليزي</div>
                <div style="text-align: center; font-weight: bold;">فرنسي</div>
                <div></div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; border-top: 1px solid #000;">
                <div style="text-align: center;">${reportData.totalStudents}</div>
                <div style="text-align: center;">${reportData.englishStudents}</div>
                <div style="text-align: center;">${reportData.frenchStudents}</div>
                <div style="text-align: center;">المجموع</div>
              </div>
            </div>
          </div>        `;
        break;
        
      case "subject-room-distribution":
        tableContent = `
          <div style="font-family: Arial, Tahoma, sans-serif; max-width: 800px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
              <div style="text-align: right; direction: rtl;">
                <div style="font-weight: bold; font-size: 16px;">الجامعة اللبنانية</div>
                <div style="font-weight: bold; font-size: 16px;">كلية العلوم</div>
                <div style="font-size: 12px;">تليفون - فاكس: 0096615461496</div>
              </div>
              <div style="text-align: center; margin-top: 10px;">
                <div style="font-weight: bold; font-size: 14px;">الأربعاء</div>
                <div style="font-weight: bold; font-size: 14px;">${currentDate}</div>
              </div>
              <div style="text-align: left; direction: ltr;">
                <div style="font-weight: bold; font-size: 14px;">UNIVERSITE LIBANAISE</div>
                <div style="font-weight: bold; font-size: 14px;">Faculté Des Sciences</div>
                <div style="font-size: 12px;">Tel-Fax:0096615461496</div>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 25px; direction: rtl;">
              <h2 style="margin-bottom: 5px;">توزيع المواد على القاعات</h2>
              <div style="margin-top: 10px; display: flex; justify-content: space-between;">
                <div>08:30-10:00</div>
                <div>امتحانات الفصل الاول ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</div>
              </div>
            </div>
            
            <div style="margin-bottom: 20px; direction: rtl;">
              <h3 style="text-align: right;">إحصائيات التوزيع</h3>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div><strong>إجمالي الطلاب:</strong> ${reportData.totalStudents}</div>
                <div><strong>عدد المواد:</strong> ${reportData.totalExams}</div>
                <div><strong>عدد القاعات:</strong> ${reportData.totalRooms}</div>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div><strong>انكليزي:</strong> ${reportData.englishStudents}</div>
                <div><strong>فرنسي:</strong> ${reportData.frenchStudents}</div>
              </div>
            </div>

            <div style="direction: rtl;">
              <table style="width: 100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f0f0f0;">
                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">ملاحظات</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">الأستاذ</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">اللغة</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">العدد</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">المادة</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">الغرفة</th>
                  </tr>
                </thead>
                <tbody>
                  ${(reportData.distributionData || []).map((item) => `
                    <tr>
                      <td style="border: 1px solid #000; padding: 8px; text-align: center; height: 40px;">&nbsp;</td>
                      <td style="border: 1px solid #000; padding: 8px; text-align: center; height: 40px;">&nbsp;</td>
                      <td style="border: 1px solid #000; padding: 8px; text-align: center;">
                        ${item.englishCount > 0 && item.frenchCount > 0 ? 'english/french' : 
                          item.englishCount > 0 ? 'english' : 'french'}
                      </td>
                      <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.totalCount}</td>
                      <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.exam}</td>
                      <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.roomId}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                <div style="border-top: 1px solid #000; padding-top: 5px; width: 100px; text-align: center;">التوقيع</div>
                <div style="border-top: 1px solid #000; padding-top: 5px; width: 100px; text-align: center;">التاريخ</div>
                <div style="border-top: 1px solid #000; padding-top: 5px; width: 150px; text-align: center;">اسم المنسق</div>
              </div>

              <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
                <div style="text-align: center; font-weight: bold;">الإجمالي</div>
                <div style="text-align: center; font-weight: bold;">انكليزي</div>
                <div style="text-align: center; font-weight: bold;">فرنسي</div>
                <div style="text-align: center; font-weight: bold;">المواد</div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; border-top: 1px solid #000;">
                <div style="text-align: center;">${reportData.totalStudents}</div>
                <div style="text-align: center;">${reportData.englishStudents}</div>
                <div style="text-align: center;">${reportData.frenchStudents}</div>
                <div style="text-align: center;">${reportData.totalExams}</div>
              </div>
            </div>
          </div>        `;
        break;
      
      case "student-id-grid":
        tableContent = `
          <div style="font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto;">
            <h2 style="text-align: center; margin-bottom: 20px;">Student ID Grid Report</h2>
            ${Object.entries(reportData.roomGroups || {}).map(([roomId, students]) => `
              <div style="margin-bottom: 30px;">
                <h3 style="background-color: #f0f0f0; padding: 10px; text-align: center;">Room ${roomId}</h3>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-top: 15px;">
                  ${students.map(student => `
                    <div style="border: 1px solid #000; padding: 8px; text-align: center;">
                      <div style="font-weight: bold; font-size: 14px;">${student.studentId}</div>
                      <div style="font-size: 12px;">${student.studentName}</div>
                      <div style="font-size: 10px; color: #666;">Seat: ${student.seatNumber}</div>
                      <div style="font-size: 10px; color: #666;">${student.exam}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case "room-attendance":
        tableContent = `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
            <h2 style="text-align: center; margin-bottom: 20px;">Room Attendance Report</h2>
            <div style="text-align: center; margin-bottom: 20px;">
              <strong>Room:</strong> ${reportData.roomId} | 
              <strong>Exam:</strong> ${reportData.examInfo} | 
              <strong>Total Students:</strong> ${reportData.totalStudents}
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f0f0f0;">
                  <th style="border: 1px solid #000; padding: 8px;">Seat #</th>
                  <th style="border: 1px solid #000; padding: 8px;">Student ID</th>
                  <th style="border: 1px solid #000; padding: 8px;">Student Name</th>
                  <th style="border: 1px solid #000; padding: 8px;">Language</th>
                  <th style="border: 1px solid #000; padding: 8px;">Signature</th>
                </tr>
              </thead>
              <tbody>
                ${(reportData.students || []).map(student => `
                  <tr>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${student.seatNumber}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${student.studentId}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${student.studentName}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${student.language}</td>
                    <td style="border: 1px solid #000; padding: 8px; height: 30px;"></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        break;

      case "enhanced-subject-distribution":
        tableContent = `
          <div style="font-family: Arial, Tahoma, sans-serif; max-width: 1000px; margin: 0 auto;">
            <h2 style="text-align: center; margin-bottom: 20px;">Enhanced Subject Distribution Report</h2>
            <div style="margin-bottom: 20px; text-align: center;">
              <strong>Total Students:</strong> ${reportData.totalStudents} | 
              <strong>Total Subjects:</strong> ${reportData.totalExams} | 
              <strong>Total Rooms:</strong> ${reportData.totalRooms}
            </div>
            <table style="width: 100%; border-collapse: collapse; border: 2px solid #000;">
              <thead>
                <tr style="background-color: #f0f0f0;">
                  <th style="border: 1px solid #000; padding: 8px;">Room</th>
                  <th style="border: 1px solid #000; padding: 8px;">Subject</th>
                  <th style="border: 1px solid #000; padding: 8px;">Total</th>
                  <th style="border: 1px solid #000; padding: 8px;">english</th>
                  <th style="border: 1px solid #000; padding: 8px;">french</th>
                  <th style="border: 1px solid #000; padding: 8px;">Professor</th>
                  <th style="border: 1px solid #000; padding: 8px;">Notes</th>
                </tr>
              </thead>
              <tbody>
                ${(reportData.distributionData || []).map(item => `
                  <tr>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.roomId}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${item.exam}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.totalCount}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.englishCount}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.frenchCount}</td>
                    <td style="border: 1px solid #000; padding: 8px;"></td>
                    <td style="border: 1px solid #000; padding: 8px;"></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        break;

      case "detailed-student-grid":
        tableContent = `
          <div style="font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto;">
            <h2 style="text-align: center; margin-bottom: 20px;">Detailed Student Grid Report</h2>
            <div style="text-align: center; margin-bottom: 20px;">
              <strong>Total Students:</strong> ${reportData.totalStudents} | 
              <strong>english:</strong> ${reportData.englishStudents} | 
              <strong>french:</strong> ${reportData.frenchStudents}
            </div>
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 20px;">
              ${(reportData.students || []).map(student => `
                <div style="border: 2px solid #000; padding: 10px; text-align: center; background-color: #f9f9f9;">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${student.studentId}</div>
                  <div style="font-size: 12px; margin-bottom: 3px;">${student.studentName}</div>
                  <div style="font-size: 10px; color: #666; margin-bottom: 2px;">Room: ${student.roomId}</div>
                  <div style="font-size: 10px; color: #666; margin-bottom: 2px;">Seat: ${student.seatNumber}</div>
                  <div style="font-size: 10px; color: #666; margin-bottom: 2px;">${student.exam}</div>
                  <div style="font-size: 10px; color: #666;">${student.language}</div>
                </div>
              `).join('')}
            </div>
            <div style="margin-top: 30px;">
              <h3>Statistics Summary:</h3>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                <div>
                  <h4>Room Distribution:</h4>
                  ${Object.entries(reportData.roomStats || {}).map(([room, count]) => `
                    <div>${room}: ${count} students</div>
                  `).join('')}
                </div>
                <div>
                  <h4>Subject Distribution:</h4>
                  ${Object.entries(reportData.examStats || {}).map(([exam, count]) => `
                    <div>${exam}: ${count} students</div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
        break;
      
      default:
        tableContent = `
          <div style="text-align: center; padding: 20px;">
            <p>No report data available or unknown report type.</p>
          </div>
        `;
        break;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .meta-info { margin-bottom: 20px; font-size: 14px; color: #666; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #888; }
            .arabic-text { direction: rtl; text-align: right; }
            .arabic-header { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            @media print { 
              body { margin: 0; font-size: 12px; } 
              .no-print { display: none; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              .arabic-header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
          </div>
          <div class="meta-info">
            <p><strong>Generated on:</strong> ${currentDate} at ${currentTime}</p>
            <p><strong>Total Records:</strong> ${Array.isArray(reportData) ? reportData.length : (reportData.students ? reportData.students.length : 'N/A')}</p>
          </div>
          ${tableContent}
          <div class="footer">
            <p>Student Distribution System - Generated Report</p>
          </div>
        </body>    </html>
    `;
  };
  const renderReportPreview = () => {
    if (!reportData) return null;

    switch (selectedReport) {case "student-distribution-by-id":
        return (
          <Box>
            <Card mb={4} p={4} bg="white" border="1px solid" borderColor="gray.300">
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <GridItem textAlign="right">
                  <Text fontWeight="bold">الجامعة اللبنانية</Text>
                  <Text fontWeight="bold">كلية العلوم</Text>
                  <Text fontSize="sm">تليفون - فاكس: 0096615461496</Text>
                </GridItem>
                <GridItem textAlign="center">
                  <Text fontWeight="bold" mt={2}>الأربعاء</Text>
                  <Text fontWeight="bold">{new Date().toLocaleDateString()}</Text>
                </GridItem>
                <GridItem textAlign="left">
                  <Text fontWeight="bold">UNIVERSITE LIBANAISE</Text>
                  <Text fontWeight="bold">Faculté Des Sciences</Text>
                  <Text fontSize="sm">Tel-Fax:0096615461496</Text>
                </GridItem>
              </Grid>
              
              <Box mt={6} mb={4} textAlign="center">
                <Heading size="md">توزيع الطلاب حسب تسلسل الأرقام</Heading>
              </Box>
              
              <SimpleGrid columns={[2, 3, 6]} spacing={2} mb={6}>
                {(reportData.students || []).slice(0, 24).map((student, index) => (
                  <Box key={index} border="1px solid" borderColor="black" p={2} textAlign="center">
                    <Text fontWeight="bold">{student.studentId}</Text>
                    <Text fontSize="sm">{student.seatNumber}</Text>
                    <Text fontSize="xs" color="gray.600">{student.roomId}</Text>
                    <Text fontSize="xs">{student.exam}</Text>
                  </Box>
                ))}
              </SimpleGrid>
              
              <HStack spacing={4} mt={6} justify="space-between">
                <Box>
                  <Text fontWeight="bold">Room Statistics:</Text>
                  <SimpleGrid columns={2} spacing={2} mt={2}>
                    {Object.entries(reportData.roomStats || {}).slice(0, 6).map(([room, count], idx) => (
                      <Text key={idx} fontSize="sm">{room}: {count} students</Text>
                    ))}
                  </SimpleGrid>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Exam Statistics:</Text>
                  <SimpleGrid columns={2} spacing={2} mt={2}>
                    {Object.entries(reportData.examStats || {}).slice(0, 6).map(([exam, count], idx) => (
                      <Text key={idx} fontSize="sm">{exam}: {count} students</Text>
                    ))}
                  </SimpleGrid>
                </Box>
              </HStack>
              
              <Grid templateColumns="repeat(4, 1fr)" mt={6} textAlign="center" fontWeight="bold">
                <Text>الإجمالي</Text>
                <Text>انكليزي</Text>
                <Text>فرنسي</Text>
                <Text></Text>
              </Grid>
              
              <Grid templateColumns="repeat(4, 1fr)" borderTop="1px solid" borderColor="black" textAlign="center">
                <Text>{reportData.totalStudents}</Text>
                <Text>{reportData.englishStudents}</Text>
                <Text>{reportData.frenchStudents}</Text>
                <Text fontWeight="bold">المجموع</Text>
              </Grid>            </Card>
          </Box>
        );
        
      case "subject-room-distribution":
        return (
          <Box>
            <Card mb={4} p={4} bg="white" border="1px solid" borderColor="gray.300">
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <GridItem textAlign="right">
                  <Text fontWeight="bold">الجامعة اللبنانية</Text>
                  <Text fontWeight="bold">كلية العلوم</Text>
                  <Text fontSize="sm">تليفون - فاكس: 0096615461496</Text>
                </GridItem>
                <GridItem textAlign="center">
                  <Text fontWeight="bold" mt={2}>الأربعاء</Text>
                  <Text fontWeight="bold">{new Date().toLocaleDateString()}</Text>
                </GridItem>
                <GridItem textAlign="left">
                  <Text fontWeight="bold">UNIVERSITE LIBANAISE</Text>
                  <Text fontWeight="bold">Faculté Des Sciences</Text>
                  <Text fontSize="sm">Tel-Fax:0096615461496</Text>
                </GridItem>
              </Grid>
              
              <Box mt={6} mb={4} textAlign="center">
                <Heading size="md">توزيع المواد على القاعات</Heading>
                <Flex justify="space-between" mt={2}>
                  <Text>08:30-10:00</Text>
                  <Text>امتحانات الفصل الاول {new Date().getFullYear()}-{new Date().getFullYear() + 1}</Text>
                </Flex>
              </Box>

              <Table variant="simple" size="sm" border="2px solid" borderColor="black" mb={6}>
                <Thead bg="gray.100">
                  <Tr>
                    <Th textAlign="center" border="1px solid" borderColor="black">ملاحظات</Th>
                    <Th textAlign="center" border="1px solid" borderColor="black">الأستاذ</Th>
                    <Th textAlign="center" border="1px solid" borderColor="black">اللغة</Th>
                    <Th textAlign="center" border="1px solid" borderColor="black">العدد</Th>
                    <Th textAlign="center" border="1px solid" borderColor="black">المادة</Th>
                    <Th textAlign="center" border="1px solid" borderColor="black">الغرفة</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(reportData.distributionData || []).slice(0, 10).map((item, index) => (
                    <Tr key={index}>
                      <Td textAlign="center" border="1px solid" borderColor="black"></Td>
                      <Td textAlign="center" border="1px solid" borderColor="black"></Td>
                      <Td textAlign="center" border="1px solid" borderColor="black">
                        {item.englishCount > 0 && item.frenchCount > 0 ? 'english/french' : 
                         item.englishCount > 0 ? 'english' : 'french'}
                      </Td>
                      <Td textAlign="center" border="1px solid" borderColor="black">{item.totalCount}</Td>
                      <Td textAlign="center" border="1px solid" borderColor="black">{item.exam}</Td>
                      <Td textAlign="center" border="1px solid" borderColor="black">{item.roomId}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              
              <HStack spacing={4} mt={6} justify="space-between">
                <VStack align="start">
                  <Text fontWeight="bold">Statistics:</Text>
                  <Text fontSize="sm">Total Students: {reportData.totalStudents}</Text>
                  <Text fontSize="sm">Total Subjects: {reportData.totalExams}</Text>
                  <Text fontSize="sm">Total Rooms: {reportData.totalRooms}</Text>
                </VStack>
                
                <VStack align="end">
                  <Text fontWeight="bold">Language Distribution:</Text>
                  <Text fontSize="sm">english: {reportData.englishStudents}</Text>
                  <Text fontSize="sm">french: {reportData.frenchStudents}</Text>
                </VStack>
              </HStack>
            </Card>
          </Box>        );

      case "student-id-grid":
        return (
          <Box>
            <Card mb={4} p={4} bg="white" border="1px solid" borderColor="gray.300">
              <Box mb={4} textAlign="center">
                <Heading size="md">Student ID Grid Report</Heading>
                <Text fontSize="sm" color="gray.600">Room-based student distribution with grid layout</Text>
              </Box>
              
              {Object.entries(reportData.roomGroups || {}).slice(0, 2).map(([roomId, students]) => (
                <Box key={roomId} mb={6} border="1px solid" borderColor="gray.200" p={4} borderRadius="md">
                  <Text fontWeight="bold" mb={3} textAlign="center" bg="gray.100" p={2} borderRadius="md">
                    Room: {roomId} ({students.length} students)
                  </Text>
                  <SimpleGrid columns={[2, 3, 4]} spacing={2}>
                    {students.slice(0, 8).map((student, index) => (
                      <Box key={index} border="1px solid" borderColor="blue.300" p={2} textAlign="center" borderRadius="md" bg="blue.50">
                        <Text fontWeight="bold" fontSize="sm">{student.studentId}</Text>
                        <Text fontSize="xs">{student.studentName}</Text>
                        <Text fontSize="xs" color="blue.600">Seat: {student.seatNumber}</Text>
                        <Text fontSize="xs" color="gray.600">{student.exam}</Text>
                        <Text fontSize="xs" color="green.600">{student.language}</Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                  {students.length > 8 && (
                    <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                      ... and {students.length - 8} more students in this room
                    </Text>
                  )}
                </Box>
              ))}
              
              <HStack spacing={4} mt={4} justify="center" bg="gray.50" p={3} borderRadius="md">
                <Text fontWeight="bold">Total Students: {reportData.totalStudents}</Text>
                <Text fontWeight="bold">Rooms Shown: {Math.min(2, Object.keys(reportData.roomGroups || {}).length)} / {Object.keys(reportData.roomGroups || {}).length}</Text>
              </HStack>
            </Card>
          </Box>
        );

      case "room-attendance":
        return (
          <Box>
            <Card mb={4} p={4} bg="white" border="1px solid" borderColor="gray.300">
              <Box mb={4} textAlign="center">
                <Heading size="md">Room Attendance Report</Heading>
                <Text fontSize="sm" color="gray.600">Room: {reportData.roomId} - {reportData.students?.length || 0} students</Text>
              </Box>
              
              <Table variant="simple" size="sm" border="1px solid" borderColor="gray.300">
                <Thead bg="blue.50">
                  <Tr>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Seat</Th>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Student ID</Th>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Student Name</Th>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Exam</Th>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Language</Th>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Signature</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(reportData.students || []).slice(0, 10).map((student, index) => (
                    <Tr key={index}>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300">{student.seatNumber}</Td>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300">{student.studentId}</Td>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300">{student.studentName}</Td>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300">{student.exam}</Td>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300">{student.language}</Td>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300" bg="gray.50">
                        <Box h="30px" w="100%" border="1px dashed" borderColor="gray.400"></Box>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              
              {reportData.students && reportData.students.length > 10 && (
                <Text fontSize="sm" color="gray.500" mt={2} textAlign="center">
                  Showing first 10 students. Full report contains {reportData.students.length} students.
                </Text>
              )}
            </Card>
          </Box>
        );

      case "enhanced-subject-distribution":
        return (
          <Box>
            <Card mb={4} p={4} bg="white" border="1px solid" borderColor="gray.300">
              <Box mb={4} textAlign="center">
                <Heading size="md">Enhanced Subject Distribution Report</Heading>
                <Text fontSize="sm" color="gray.600">Detailed room and subject allocation with professor assignments</Text>
              </Box>
              
              <Table variant="simple" size="sm" border="1px solid" borderColor="gray.300">
                <Thead bg="green.50">
                  <Tr>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Room</Th>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Subject</Th>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Students</Th>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Language</Th>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Professor</Th>
                    <Th textAlign="center" border="1px solid" borderColor="gray.300">Notes</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(reportData.distributionData || []).slice(0, 8).map((item, index) => (
                    <Tr key={index}>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300" fontWeight="bold">{item.roomId}</Td>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300">{item.exam}</Td>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300">{item.totalCount}</Td>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300">
                        {item.englishCount > 0 && item.frenchCount > 0 ? 'EN/FR' : 
                         item.englishCount > 0 ? 'EN' : 'FR'}
                      </Td>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300" bg="yellow.50">
                        <Text fontSize="xs" color="gray.600">TBD</Text>
                      </Td>
                      <Td textAlign="center" border="1px solid" borderColor="gray.300" bg="gray.50">
                        <Text fontSize="xs" color="gray.600">-</Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              
              <HStack spacing={4} mt={4} justify="space-between" bg="green.50" p={3} borderRadius="md">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="sm">Summary:</Text>
                  <Text fontSize="xs">Total Students: {reportData.totalStudents}</Text>
                  <Text fontSize="xs">Total Rooms: {reportData.totalRooms}</Text>
                </VStack>
                <VStack align="end" spacing={1}>
                  <Text fontWeight="bold" fontSize="sm">Languages:</Text>
                  <Text fontSize="xs">english: {reportData.englishStudents}</Text>
                  <Text fontSize="xs">french: {reportData.frenchStudents}</Text>
                </VStack>
              </HStack>
            </Card>
          </Box>
        );

      case "detailed-student-grid":
        return (
          <Box>
            <Card mb={4} p={4} bg="white" border="1px solid" borderColor="gray.300">
              <Box mb={4} textAlign="center">
                <Heading size="md">Detailed Student Grid Report</Heading>
                <Text fontSize="sm" color="gray.600">Comprehensive student information with statistics</Text>
              </Box>
              
              <SimpleGrid columns={[1, 2, 3]} spacing={3} mb={4}>
                {(reportData.students || []).slice(0, 6).map((student, index) => (
                  <Box key={index} border="1px solid" borderColor="purple.300" p={3} borderRadius="md" bg="purple.50">
                    <VStack spacing={1} align="center">
                      <Text fontWeight="bold" color="purple.700">{student.studentId}</Text>
                      <Text fontSize="sm">{student.studentName}</Text>
                      <Text fontSize="xs" color="blue.600">Room: {student.roomId}</Text>
                      <Text fontSize="xs" color="green.600">Seat: {student.seatNumber}</Text>
                      <Text fontSize="xs" color="orange.600">{student.exam}</Text>
                      <Text fontSize="xs" color="purple.600">{student.language}</Text>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
              
              <SimpleGrid columns={[1, 2, 4]} spacing={4} mt={4} bg="purple.50" p={4} borderRadius="md">
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="sm">Students</Text>
                  <Text fontSize="xs">Total: {reportData.totalStudents}</Text>
                  <Text fontSize="xs">english: {reportData.englishStudents}</Text>
                  <Text fontSize="xs">french: {reportData.frenchStudents}</Text>
                </VStack>
                
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="sm">Exams</Text>
                  {Object.entries(reportData.examStats || {}).slice(0, 3).map(([exam, count], idx) => (
                    <Text key={idx} fontSize="xs">{exam}: {count}</Text>
                  ))}
                </VStack>
                
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="sm">Rooms</Text>
                  {Object.entries(reportData.roomStats || {}).slice(0, 3).map(([room, count], idx) => (
                    <Text key={idx} fontSize="xs">{room}: {count}</Text>
                  ))}
                </VStack>
                
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="sm">Preview</Text>
                  <Text fontSize="xs">Showing: {Math.min(6, reportData.students?.length || 0)}</Text>
                  <Text fontSize="xs">Total: {reportData.students?.length || 0}</Text>
                </VStack>
              </SimpleGrid>
            </Card>
          </Box>
        );
        
      default:
        return null;
    }
  };

  // Report 9: Student ID Grid Report (Image 1)
  const generateStudentIdGridReport = () => {
    // Group students by room
    const roomGroups = {};
    results.forEach(result => {
      const room = rooms.find(r => r.room_id === result.room_id);
      const seatNumber = getSeatNumber(result.row, result.col, room?.cols || 10);
      
      if (!roomGroups[result.room_id]) {
        roomGroups[result.room_id] = [];
      }
      
      roomGroups[result.room_id].push({
        studentId: result.student_id,
        studentName: getStudentName(result.student_id),
        seatNumber: seatNumber,
        exam: result.exam_name,
        language: getStudentLanguage(result.student_id)
      });
    });

    // Sort students by ID within each room
    Object.keys(roomGroups).forEach(roomId => {
      roomGroups[roomId].sort((a, b) => String(a.studentId).localeCompare(String(b.studentId)));
    });

    return {
      roomGroups,
      totalStudents: results.length,
      reportType: 'student-id-grid'
    };
  };

  // Report 10: Room Attendance Report (Image 2)
  const generateRoomAttendanceReport = (roomId) => {
    // Filter results for specific room
    const roomResults = results.filter(r => r.room_id === roomId);
    const room = rooms.find(r => r.room_id === roomId);
    
    const studentsData = roomResults.map(result => {
      const seatNumber = getSeatNumber(result.row, result.col, room?.cols || 10);
      return {
        studentId: result.student_id,
        studentName: getStudentName(result.student_id),
        seatNumber: seatNumber,
        exam: result.exam_name,
        language: getStudentLanguage(result.student_id)
      };
    });

    // Sort by seat number
    studentsData.sort((a, b) => a.seatNumber - b.seatNumber);

    // Get exam info (assuming all students in room have same exam)
    const examInfo = studentsData[0]?.exam || 'N/A';
    
    return {
      roomId,
      students: studentsData,
      totalStudents: studentsData.length,
      examInfo,
      roomDetails: room,
      reportType: 'room-attendance'
    };
  };

  // Report 11: Enhanced Subject Distribution Report (Image 3 & 5)
  const generateEnhancedSubjectDistributionReport = () => {
    // Group data by exam/subject and room with detailed statistics
    const subjectRoomData = {};
    
    results.forEach(result => {
      const exam = result.exam_name;
      const roomId = result.room_id;
      const studentLanguage = getStudentLanguage(result.student_id);
      
      if (!subjectRoomData[exam]) {
        subjectRoomData[exam] = {};
      }
      
      if (!subjectRoomData[exam][roomId]) {
        subjectRoomData[exam][roomId] = {
          count: 0,
          englishCount: 0,
          frenchCount: 0,
          students: []
        };
      }
      
      subjectRoomData[exam][roomId].count++;
      if (studentLanguage === 'english') {
        subjectRoomData[exam][roomId].englishCount++;
      } else if (studentLanguage === 'french') {
        subjectRoomData[exam][roomId].frenchCount++;
      }
      
      subjectRoomData[exam][roomId].students.push({
        studentId: result.student_id,
        studentName: getStudentName(result.student_id),
        language: studentLanguage
      });
    });

    // Convert to array format with enhanced details
    const distributionData = [];
    Object.entries(subjectRoomData).forEach(([exam, roomsData]) => {
      Object.entries(roomsData).forEach(([roomId, data]) => {
        distributionData.push({
          exam,
          roomId,
          totalCount: data.count,
          englishCount: data.englishCount,
          frenchCount: data.frenchCount,
          students: data.students,
          professor: '', // To be filled manually
          notes: ''     // To be filled manually
        });
      });
    });

    // Sort by room, then by exam
    distributionData.sort((a, b) => {
      if (a.roomId !== b.roomId) {
        return String(a.roomId).localeCompare(String(b.roomId));
      }
      return String(a.exam).localeCompare(String(b.exam));
    });

    // Calculate overall statistics
    const totalStudents = results.length;
    const totalExams = Object.keys(subjectRoomData).length;
    const totalRooms = [...new Set(results.map(r => r.room_id))].length;
    const englishStudents = results.filter(r => getStudentLanguage(r.student_id) === 'english').length;
    const frenchStudents = results.filter(r => getStudentLanguage(r.student_id) === 'french').length;

    return {
      distributionData,
      totalStudents,
      totalExams,
      totalRooms,
      englishStudents,
      frenchStudents,
      subjectRoomData,
      reportType: 'enhanced-subject-distribution'
    };
  };

  // Report 12: Detailed Student Grid by ID Report (Image 4)
  const generateDetailedStudentGridReport = () => {
    // Gather all results with detailed information
    const allStudentsData = results.map(result => {
      const room = rooms.find(r => r.room_id === result.room_id);
      const seatNumber = getSeatNumber(result.row, result.col, room?.cols || 10);
      
      return {
        studentId: result.student_id,
        studentName: getStudentName(result.student_id),
        roomId: result.room_id,
        seatNumber: seatNumber,
        exam: result.exam_name,
        language: getStudentLanguage(result.student_id),
        examCode: result.exam_name // Additional field for detailed view
      };
    });
    
    // Sort by student ID
    allStudentsData.sort((a, b) => String(a.studentId).localeCompare(String(b.studentId)));
    
    // Create a grid layout (6 columns as shown in image)
    const gridData = [];
    for (let i = 0; i < allStudentsData.length; i += 6) {
      gridData.push(allStudentsData.slice(i, i + 6));
    }
    
    // Get statistics
    const totalStudents = allStudentsData.length;
    const englishStudents = allStudentsData.filter(s => s.language === 'english').length;
    const frenchStudents = allStudentsData.filter(s => s.language === 'french').length;
    
    // Group by exam for statistics
    const examStats = {};
    allStudentsData.forEach(student => {
      if (!examStats[student.exam]) {
        examStats[student.exam] = 0;
      }
      examStats[student.exam]++;
    });
    
    // Group by room for statistics
    const roomStats = {};
    allStudentsData.forEach(student => {
      if (!roomStats[student.roomId]) {
        roomStats[student.roomId] = 0;
      }
      roomStats[student.roomId]++;
    });

    return {
      students: allStudentsData,
      gridData,
      totalStudents,
      englishStudents,
      frenchStudents,
      examStats,
      roomStats,
      reportType: 'detailed-student-grid'
    };
  };

  if (!results || results.length === 0) {
    return (
      <Box p={4} bg="gray.50" borderRadius="md" textAlign="center">
        <Text color="gray.600">No assignment results available. Please assign seats first to generate reports.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Export Reports</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>        <Card p={4}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600">
              Generate and print various reports for the student seat assignments
            </Text>            <Select
              placeholder="Select report type"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <option value="student-distribution-by-id">توزيع الطلاب حسب تسلسل الأرقام</option>
              <option value="subject-room-distribution">توزيع المواد على القاعات</option>
              <option value="student-id-grid">Student ID Grid Report </option>
              <option value="room-attendance">Room Attendance Report </option>
              <option value="enhanced-subject-distribution">Enhanced Subject Distribution </option>
              <option value="detailed-student-grid">Detailed Student Grid</option>
            </Select><HStack spacing={2}>              <Button
                colorScheme="blue"
                leftIcon={<ViewIcon />}
                onClick={handleGenerateReport}
                isDisabled={!selectedReport}
                flex={1}
              >
                Generate Report
              </Button>
            </HStack>
          </VStack>
        </Card>        <Card p={4}>
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" fontWeight="bold">Report Types:</Text>
            <Text fontSize="xs">📊 <strong>توزيع الطلاب حسب تسلسل الأرقام:</strong> Student distribution sorted by ID numbers</Text>
            <Text fontSize="xs">📈 <strong>توزيع المواد على القاعات:</strong> Subject distribution across examination rooms</Text>
            <Text fontSize="xs">🎯 <strong>Student ID Grid:</strong> Room-based student grid layout with cards</Text>
            <Text fontSize="xs">✅ <strong>Room Attendance:</strong> Attendance tracking table with signature column</Text>
            <Text fontSize="xs">📋 <strong>Enhanced Subject Distribution:</strong> Detailed room allocation with professor assignments</Text>
            <Text fontSize="xs">🔍 <strong>Detailed Student Grid:</strong> Comprehensive student information with statistics</Text>
          </VStack>
        </Card>
      </SimpleGrid>

      {/* Report Preview Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxW="90vw">
          <ModalHeader>
            <Flex justify="space-between" align="center">
              <Text>{reportTitle}</Text>
              <Tooltip label="Print Report">
                <IconButton
                  icon={<DownloadIcon />}
                  onClick={handlePrintReport}
                  mr={5}
                  colorScheme="green"
                  size="sm"
                />
              </Tooltip>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {reportData && (
              <Box>                <Text fontSize="sm" color="gray.600" mb={4}>
                  Preview (showing {
                    selectedReport === "student-id-grid" ? "first 2 rooms with 8 students each" :
                    selectedReport === "room-attendance" ? "first 10 students" :
                    selectedReport === "enhanced-subject-distribution" ? "first 8 room-subject combinations" :
                    selectedReport === "detailed-student-grid" ? "first 6 students" :
                    selectedReport === "utilization" ? "all" : 
                    selectedReport === "room" ? "15" : "10"
                  } records)
                </Text>{renderReportPreview()}                {/* Handle different report types for "more records" text */}
                {selectedReport === "student-distribution-by-id" && reportData && Array.isArray(reportData.students) && reportData.students.length > 24 && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    ... and {reportData.students.length - 24} more students. Click print to see full report.
                  </Text>
                )}
                {selectedReport === "subject-room-distribution" && reportData && Array.isArray(reportData.distributionData) && reportData.distributionData.length > 10 && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    ... and {reportData.distributionData.length - 10} more room-subject combinations. Click print to see full report.
                  </Text>
                )}
                {selectedReport === "student-id-grid" && reportData && reportData.roomGroups && Object.keys(reportData.roomGroups).length > 2 && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    ... and {Object.keys(reportData.roomGroups).length - 2} more rooms with students. Click print to see full report.
                  </Text>
                )}
                {selectedReport === "room-attendance" && reportData && reportData.students && reportData.students.length > 10 && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    ... and {reportData.students.length - 10} more students. Click print to see full report.
                  </Text>
                )}
                {selectedReport === "enhanced-subject-distribution" && reportData && Array.isArray(reportData.distributionData) && reportData.distributionData.length > 8 && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    ... and {reportData.distributionData.length - 8} more room-subject combinations. Click print to see full report.
                  </Text>
                )}
                {selectedReport === "detailed-student-grid" && reportData && Array.isArray(reportData.students) && reportData.students.length > 6 && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    ... and {reportData.students.length - 6} more students. Click print to see full report.
                  </Text>
                )}
                {selectedReport !== "utilization" && selectedReport !== "room" && selectedReport !== "student-distribution-by-id" && selectedReport !== "subject-room-distribution" && selectedReport !== "student-id-grid" && selectedReport !== "room-attendance" && selectedReport !== "enhanced-subject-distribution" && selectedReport !== "detailed-student-grid" && reportData && Array.isArray(reportData) && reportData.length > 10 && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    ... and {reportData.length - 10} more records. Click print to see full report.
                  </Text>
                )}
                {selectedReport === "room" && reportData && reportData.students && reportData.students.length > 15 && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    ... and {reportData.students.length - 15} more students. Click print to see full report.
                  </Text>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="green" leftIcon={<DownloadIcon />} onClick={handlePrintReport}>
              Print Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReportExport;
