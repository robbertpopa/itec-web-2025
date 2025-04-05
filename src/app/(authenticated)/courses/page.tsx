"use client"
import { ref as dbRef, child, get, query, orderByKey } from "firebase/database";
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
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const ITEMS_PER_PAGE = 8;

    const fetchCourses = async (page: number = 1) => {
        setLoading(true);
        try {
            const dbReference = dbRef(db);
            
            const totalCountSnapshot = await get(child(dbReference, "/courses"));
            if (totalCountSnapshot.exists()) {
                const totalCourses = Object.keys(totalCountSnapshot.val()).length;
                const calculatedTotalPages = Math.ceil(totalCourses / ITEMS_PER_PAGE);
                setTotalPages(calculatedTotalPages);
            }

            const coursesQuery = query(
                child(dbReference, "/courses"),
                orderByKey()
            );

            const snapshot = await get(coursesQuery);
            
            if (snapshot.exists()) {
                const rawData = snapshot.val();
                
                let allCourses: CoursePreview[] = Object.entries(rawData).map(
                    ([id, value]) => ({
                        id,
                        ...(value as Omit<CoursePreview, "id">),
                    })
                );
                
                const startIndex = (page - 1) * ITEMS_PER_PAGE;
                const endIndex = startIndex + ITEMS_PER_PAGE;
                const paginatedCourses = allCourses.slice(startIndex, endIndex);
                
                const coursesWithImages = await Promise.all(
                    paginatedCourses.map(async (course) => {
                        try {
                            const imageRef = storageRef(storage, `courses/${course.id}/cover.webp`);
                            const imageUrl = await getDownloadURL(imageRef);
                            return { ...course, imageUrl };
                        } catch (error) {
                            return course;
                        }
                    })
                );
                
                setCourseData(coursesWithImages);
                setCurrentPage(page);
            } else {
                setCourseData([]);
                setTotalPages(1);
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

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= (searchTerm ? filteredTotalPages : totalPages) && page !== currentPage) {
            if (searchTerm) {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                fetchCourses(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < (searchTerm ? filteredTotalPages : totalPages)) {
            handlePageChange(currentPage + 1);
        }
    };

    const filteredCourses = searchTerm
        ? courseData.filter(course => 
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
          )
        : courseData;
    
    const filteredTotalPages = searchTerm
        ? Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE))
        : totalPages;

    const paginatedCourses = searchTerm
        ? filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
        : filteredCourses;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (            
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content container mx-auto px-4 py-8 flex flex-col">

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedCourses.map((course) => (
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

                {!loading && courseData.length > 0 && (
                    <div className="pt-6 flex justify-center">
                        <div className="join justify-self-end">
                            <button 
                                className="join-item btn" 
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                            >
                                «
                            </button>
                            <button className="join-item btn">
                                Page {currentPage} of {filteredTotalPages}
                            </button>
                            <button 
                                className="join-item btn" 
                                onClick={goToNextPage}
                                disabled={currentPage === filteredTotalPages}
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}

                <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden mt-4">
                    Open drawer
                </label>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="p-4 w-80 min-h-full bg-base-200">
                    <header className="mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div className="relative flex-grow max-w-md w-full">
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
                        </div>
                    </header>
                </div>
            </div>
        </div>
    );
}