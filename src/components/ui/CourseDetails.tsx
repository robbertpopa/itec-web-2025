import Link from "next/link";
import Image from "next/image";

export default function CourseDetails({ course, owner, imageUrl }: {
    course: { id: string; name: string; description?: string; lessons?: string[] },
    owner: { displayName?: string },
    imageUrl: string | null
}) {
    return (
        <div className="lg:w-3/4 mx-auto">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="md:w-2/5 lg:w-1/3">
                    <div className="rounded-lg overflow-hidden shadow-md bg-base-200 aspect-video relative">
                        {imageUrl ? (
                            <Image 
                                src={imageUrl}
                                alt={`Cover image for ${course.name}`}
                                fill
                                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 40vw, 100vw"
                                className="object-cover transition-transform hover:scale-105 duration-300"
                                priority 
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-base-200 text-base-content/50">
                                <span>No image available</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="md:w-3/5 lg:w-2/3">
                    <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
                    <div className="flex items-center mb-4 text-sm">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                            Created by: {owner.displayName || ""}
                        </span>
                    </div>
                    
                    {course.description ? (
                        <div className="prose max-w-none">
                            <h3 className="text-lg font-medium mb-2">About this course</h3>
                            <p className="text-base-content/80 mb-4">{course.description}</p>
                        </div>
                    ) : (
                        <div className="bg-base-200/50 rounded-lg p-4 text-base-content/70 italic mb-4">
                            No description provided for this course.
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Course Lessons</h2>
                {course.lessons && course.lessons.length > 0 ? (
                    <ul className="space-y-3">
                        {course.lessons.map((lesson, idx) => (
                            <li key={idx}>
                                <Link 
                                    href={`/courses/${course.id}/${idx}`} 
                                    className="flex items-center gap-3 bg-base-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all hover:bg-base-200/30 w-full"
                                >
                                    <span className="flex items-center justify-center bg-primary/15 text-primary rounded-full w-8 h-8 shrink-0 font-medium">
                                        {idx + 1}
                                    </span>
                                    <span className="text-base-content">{lesson}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-12 bg-base-200/30 rounded-lg border border-base-300">
                        <h3 className="text-lg font-medium text-base-content/70 mb-2">No lessons yet</h3>
                        <p className="text-base-content/60">
                            {"This course hasn't added any lessons yet. Check back soon!"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}