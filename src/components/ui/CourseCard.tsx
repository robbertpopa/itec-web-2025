import { useRouter } from "next/navigation";
import Course from 'lib/models/coursePreview';

export default function CourseCard({ course }: { course: Course }) {
    const router = useRouter();

    const handleViewMaterials = () => {
        router.push(`/courses/${course.id}`);
    }

    return <>
        <div className="card w-96 bg-base-100 shadow-xl image-full">
            {course.imageUrl && (
                <figure>
                    <img src={course.imageUrl} alt={course.name} />
                </figure>
            )}
            <div className="card-body">
                <h2 className="card-title">{course.name}</h2>
                <p>{course.description ?? "No description available."}</p>
                <div className="card-actions justify-end">
                    <button onClick={handleViewMaterials} className="btn btn-primary">View Materials</button>
                </div>
            </div>
        </div>
    </>;
}