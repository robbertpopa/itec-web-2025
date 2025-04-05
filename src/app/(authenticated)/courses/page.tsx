"use client"
import { ref as dbRef, child, get, query, limitToFirst, startAfter, orderByKey } from "firebase/database";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { db, storage } from "lib/firebase";
import { useState, useEffect } from "react";
import CourseCard from "@/components/ui/CourseCard";
import CoursePreview from "lib/models/coursePreview";
import Skeleton from "@/components/ui/Skeleton";
import { Search } from "lucide-react";

export default function Page() {
    const [courseData, setCourseData] = useState<CoursePreview[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastKey, setLastKey] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const ITEMS_PER_PAGE = 8;

    const fetchCourses = async (key: string | null = null) => {
        setLoading(true);
        try {
            const dbReference = dbRef(db);
            let coursesQuery;
            
            if (key) {
                coursesQuery = query(
                    child(dbReference, "/courses"),
                    orderByKey(),
                    startAfter(key),
                    limitToFirst(ITEMS_PER_PAGE)
                );
            } else {
                coursesQuery = query(
                    child(dbReference, "/courses"),
                    orderByKey(),
                    limitToFirst(ITEMS_PER_PAGE)
                );
            }

            const snapshot = await get(coursesQuery);
            
            if (snapshot.exists()) {
                const rawData = snapshot.val();
                
                let courses: CoursePreview[] = Object.entries(rawData).map(
                    ([id, value]) => ({
                        id,
                        ...(value as Omit<CoursePreview, "id">),
                    })
                );
                
                courses = await Promise.all(
                    courses.map(async (course) => {
                        try {
                            const imageRef = storageRef(storage, `${course.id}/cover.webp`);
                            const imageUrl = await getDownloadURL(imageRef);
                            return { ...course, imageUrl };
                        } catch (error) {
                            return course;
                        }
                    })
                );
                
                if (key) {
                    setCourseData(prevCourses => [...prevCourses, ...courses]);
                } else {
                    setCourseData(courses);
                }
                
                const lastCourse = courses[courses.length - 1];
                setLastKey(lastCourse?.id || null);
                
                setHasMore(courses.length === ITEMS_PER_PAGE);
            } else {
                if (!key) {
                    setCourseData([]);
                }
                setHasMore(false);
            }
        } catch (error) {
            console.error(error);
            setError("Failed to load courses. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const loadMore = () => {
        if (lastKey && hasMore && !loading) {
            fetchCourses(lastKey);
        }
    };

    const filteredCourses = searchTerm
        ? courseData.filter(course => 
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
          )
        : courseData;

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-4 text-neutral-900">Courses</h1>
                <p className="text-neutral-600 mb-6">
                    Browse our collection of available courses
                </p>
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search courses..." 
                        className="pl-10 pr-4 py-3 w-full rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
                
                {loading && !courseData.length && Array(4).fill(0).map((_, i) => (
                    <div key={`skeleton-${i}`} className="flex flex-col rounded-lg border border-neutral-100 bg-white shadow-sm h-[340px]">
                        <Skeleton className="h-48 w-full rounded-t-lg" />
                        <div className="p-4">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-3" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-9 w-full mt-4" />
                        </div>
                    </div>
                ))}
            </div>

            {filteredCourses.length === 0 && !loading && (
                <div className="text-center py-12">
                    <h3 className="text-xl font-medium text-neutral-700 mb-2">No courses found</h3>
                    {searchTerm ? (
                        <p className="text-neutral-500">
                            No courses match your search criteria. Try a different search term.
                        </p>
                    ) : (
                        <p className="text-neutral-500">
                            There are no courses available at the moment.
                        </p>
                    )}
                </div>
            )}

            {hasMore && courseData.length > 0 && (
                <div className="mt-10 text-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-3 bg-white border border-neutral-200 rounded-lg shadow-sm hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 font-medium transition"
                    >
                        {loading ? "Loading..." : "Load More Courses"}
                    </button>
                </div>
            )}
        </div>
    );
}