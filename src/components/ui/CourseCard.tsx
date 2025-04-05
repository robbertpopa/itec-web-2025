import { useRouter } from "next/navigation";
import Image from "next/image";
import Course from 'lib/models/coursePreview';

export default function CourseCard({ course }: { course: Course }) {
    const router = useRouter();

    const handleViewMaterials = () => {
        router.push(`/courses/${course.id}`);
    }

    return (
        <article className="flex flex-col rounded-lg border border-neutral-100 bg-white shadow-sm transition hover:shadow-md">
            <div className="aspect-video relative overflow-hidden rounded-t-lg">
                {course.imageUrl ? (
                    <Image 
                        src={course.imageUrl} 
                        alt={course.name}
                        fill
                        sizes="(min-width: 1024px) 20rem, (min-width: 768px) 16rem, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-50">
                        <span className="text-sm text-neutral-300">No image</span>
                    </div>
                )}
            </div>
            
            <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-1 truncate font-medium text-neutral-900" title={course.name}>
                    {course.name}
                </h3>
                
                <p className="mb-2 text-xs text-neutral-500">
                    By {course.ownerId || "Anonymous"}
                </p>
                
                <p className="mb-4 line-clamp-2 flex-grow text-sm text-neutral-600">
                    {course.description ?? "No description available."}
                </p>
                
                <button 
                    onClick={handleViewMaterials}
                    className="w-full rounded border border-primary bg-transparent px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white cursor-pointer"
                >
                    View Materials
                </button>
            </div>
        </article>
    );
}