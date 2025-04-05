"use client"
import { ref, child, get } from "firebase/database";
import { db } from "lib/firebase";
import { useState, useEffect } from "react";
import CourseCard from "@/components/ui/CourseCard";
import CoursePreview from "lib/models/coursePreview";

export default function Page() {
    const [courseData, setCourseData] = useState<CoursePreview[]>([]);

    useEffect(() => {
        const dbRef = ref(db);
        get(child(dbRef, `/courses`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    setCourseData(Object.values(snapshot.val()));
                } else {
                    console.log("No data available");
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return <>
        <div className="flex flex-col gap-5">
            <h1 className="text-3xl font-bold">Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {courseData.map((course) => (
                    <div key={course.id} className="flex justify-center">
                        <CourseCard course={course} />
                    </div>
                ))}
            </div>
        </div>
    </>
}