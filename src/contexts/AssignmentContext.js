import React, { createContext, useContext, useState, useEffect } from 'react';

const AssignmentContext = createContext();

export function useAssignment() {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignment must be used within an AssignmentProvider');
  }
  return context;
}

export function AssignmentProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [results, setResults] = useState([]);
  const [examRoomRestrictions, setExamRoomRestrictions] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Clear data on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear the context data before the page is unloaded
      setStudents([]);
      setRooms([]);
      setResults([]);
      setExamRoomRestrictions({});
      setIsLoading(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const value = {
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
  };

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
}
