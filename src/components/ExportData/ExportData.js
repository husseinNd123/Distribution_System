import React from "react";
import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { AiOutlineDownload } from "react-icons/ai";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ExportData = ({ data, fileName = "exported_data" }) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(18);
    doc.text(fileName.replace(/_/g, " "), pageWidth / 2, 20, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 15, 30);

    const tableColumn = Object.keys(data[0]);
    const tableRows = data.map((item) =>
      tableColumn.map((column) =>
        item[column] !== null ? item[column] : "N/A"
      )
    );

    doc.autoTable({
      startY: 20,
      head: [tableColumn],
      body: tableRows,
      // theme: "grid",
      styles: {
        font: "times",
        fontSize: 10,
        cellPadding: 3,
        overflow: "linebreak",
        valign: "middle",
        halign: "center",
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [0, 123, 255],
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto" },
        2: { cellWidth: "auto" },
        3: { cellWidth: "auto" },
        4: { cellWidth: "auto" },
        5: { cellWidth: "auto" },
        6: { cellWidth: "auto" },
        7: { cellWidth: "auto" },
      },
      margin: { top: 40 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, {
        align: "right",
      });
    }

    doc.save(`${fileName}.pdf`);
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        leftIcon={<AiOutlineDownload />}
        colorScheme="green"
      >
        Export
      </MenuButton>
      <MenuList>
        <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
        <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ExportData;
//components/ExportData.js

// import React from "react";
// import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
// import { AiOutlineDownload } from "react-icons/ai";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import "jspdf-autotable";

// const ExportData = ({ data, fileName = "exported_data" }) => {
//   const exportToExcel = () => {
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
//     XLSX.writeFile(workbook, `${fileName}.xlsx`);
//   };

//   const exportToPDF = () => {
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();

//     // Add Header with Centered Title
//     doc.setFontSize(18);
//     doc.text(fileName.replace(/_/g, " "), pageWidth / 2, 20, {
//       align: "center",
//     });
//     doc.setFontSize(12);
//     doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 15, 30);

//     // Define columns and rows for the table
//     const tableColumn = Object.keys(data[0]);
//     const tableRows = data.map((item) =>
//       tableColumn.map((column) =>
//         item[column] !== null ? item[column] : "N/A"
//       )
//     );

//     // Check if table fits the page width; if not, adapt the table
//     const needsVerticalLayout = tableColumn.length * 20 > pageWidth - 40;

//     if (!needsVerticalLayout) {
//       // Regular horizontal table
//       doc.autoTable({
//         startY: 40,
//         head: [tableColumn],
//         body: tableRows,
//         theme: "grid",
//         styles: {
//           fontSize: 10,
//           cellPadding: 2,
//           overflow: "linebreak",
//         },
//         headStyles: {
//           fillColor: [41, 128, 185],
//           textColor: 255,
//           fontStyle: "bold",
//         },
//         margin: { top: 40 },
//       });
//     } else {
//       // Vertical layout: each row appears as a section on a new page
//       data.forEach((item, index) => {
//         if (index > 0) doc.addPage();
//         doc.setFontSize(12);
//         doc.text(`Record ${index + 1}`, 15, 40);
//         doc.setFontSize(10);

//         Object.keys(item).forEach((key, idx) => {
//           const yPos = 50 + idx * 8;
//           doc.text(
//             `${key}: ${item[key] !== null ? item[key] : "N/A"}`,
//             15,
//             yPos
//           );
//         });
//       });
//     }

//     // Add Footer with Page Numbers
//     const pageCount = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(10);
//       doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, {
//         align: "right",
//       });
//     }

//     doc.save(`${fileName}.pdf`);
//   };

//   return (
//     <Menu>
//       <MenuButton
//         as={Button}
//         leftIcon={<AiOutlineDownload />}
//         colorScheme="green"
//       >
//         Export
//       </MenuButton>
//       <MenuList>
//         <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
//         <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
//       </MenuList>
//     </Menu>
//   );
// };

// export default ExportData;
