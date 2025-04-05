import { useRouter } from "next/navigation";
import Image from "next/image";
import Course from 'lib/models/coursePreview';

export default function CourseCard({ course }: { course: Course }) {
    const router = useRouter();

    const handleViewMaterials = () => {
        router.push(`/courses/${course.id}`);
    }

    return (
        <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
            <figure className="aspect-video relative overflow-hidden rounded-t-lg">
                {course.imageUrl ? (
                    <Image 
                        src={course.imageUrl} 
                        alt={course.name}
                        fill
                        sizes="(min-width: 1024px) 20rem, (min-width: 768px) 16rem, 100vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        priority
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-base-200">
                        <span className="text-sm text-base-content opacity-40">No image</span>
                    </div>
                )}
            </figure>
            
            <div className="card-body p-4">
                <h3 className="card-title text-base truncate" title={course.name}>
                    {course.name}
                </h3>
                
                <p className="text-xs opacity-70">
                    By {course.ownerId}
                </p>
                
                <p className="line-clamp-2 text-sm flex-grow">
                    {course.description ?? "No description available."}
                </p>
                
                <div className="card-actions justify-end mt-2">
                    <button 
                        onClick={handleViewMaterials}
                        className="btn btn-primary btn-outline btn-sm w-full"
                    >
                        View Materials
                    </button>
                </div>
            </div>
        </div>
    );
}