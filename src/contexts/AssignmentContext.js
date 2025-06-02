import React, { createContext, useContext, useState } from 'react';

const AssignmentContext = createContext();

export function useAssignment() {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignment must be used within an AssignmentProvider');
  }
  return context;
}

export function AssignmentProvider({ children }) {
  // Initialize state with empty arrays - no localStorage persistence
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [results, setResults] = useState([]);
  const [examRoomRestrictions, setExamRoomRestrictions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [assignmentTimestamp, setAssignmentTimestamp] = useState(null);

  // Function to clear all assignment data
  const clearAssignmentData = () => {
    setStudents([]);
    setRooms([]);
    setResults([]);
    setExamRoomRestrictions({});
    setAssignmentTimestamp(null);
  };

  // Function to check if there are saved results
  const hasSavedResults = () => {
    return results.length > 0;
  };

  // Function to get assignment summary
  const getAssignmentSummary = () => {
    if (results.length === 0) return null;
    
    const totalStudents = results.length;
    const uniqueRooms = [...new Set(results.map(r => r.room_id))];
    const uniqueExams = [...new Set(results.map(r => r.exam_name))];
    
    return {
      totalStudents,
      totalRooms: uniqueRooms.length,
      totalExams: uniqueExams.length,
      roomList: uniqueRooms,
      examList: uniqueExams,
      assignmentDate: assignmentTimestamp
    };
  };

  // Function to save assignment timestamp
  const saveAssignmentTimestamp = () => {
    setAssignmentTimestamp(new Date().toISOString());
  };  const value = {
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
    saveAssignmentTimestamp,
  };

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
}
