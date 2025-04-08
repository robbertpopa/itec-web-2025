import React, { createContext, useContext, useState, ReactNode } from "react";
import CoursePreview from "../models/coursePreview";

interface CourseContextType {
  courses: CoursePreview[];
  setCourses: React.Dispatch<React.SetStateAction<CoursePreview[]>>;
  addCourse: (course: CoursePreview) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<CoursePreview[]>([]);

  const addCourse = (course: CoursePreview) => {
    setCourses((prevCourses) => [course, ...prevCourses]);
  };

  return (
    <CourseContext.Provider value={{ courses, setCourses, addCourse }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error("useCourses must be used within a CourseProvider");
  }
  return context;
}
