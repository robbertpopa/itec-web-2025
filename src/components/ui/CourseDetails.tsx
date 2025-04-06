import Link from "next/link";
import Image from "next/image";
import CourseDiscussion from "./CourseDiscussion";

export default function CourseDetails({
  course,
  owner,
  imageUrl,
}: {
  course: { id: string; name: string; description?: string; lessons?: string[] };
  owner: { displayName?: string, profilePicture?: string };
  imageUrl: string | null;
}) {
  return (
    <div className="p-12 container mx-auto">
        <div className="card flex flex-col rounded-lg shadow-sm w-2/3 overflow-hidden">
            <div className="relative overflow-hidden shadow-md">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={`Cover image for ${course.name}`}
                        className="w-full rounded-t-lg object-cover max-h-60"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-200 text-base-content/50">
                        <span>No image available</span>
                    </div>
                )}
            </div>
            <div className="p-10">
                <h1 className="text-3xl font-bold mb-4">{course.name}</h1>
                <div className="flex flex-row gap-2 items-center">
                    <div className="avatar">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            {owner.profilePicture ? (
                                <img
                                src={`${owner.profilePicture}?t=${new Date().getTime()}`}
                                alt=""
                                className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="bg-neutral-focus text-neutral-content rounded-full w-40 h-40 flex items-center justify-center">
                                <span className="text-5xl">{getInitials(owner.displayName)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-xs flex flex-col opacity-80">
                        Hosted by
                        <div className="font-semibold text-sm">
                            {owner.displayName || "Unknown"}
                        </div>
                    </div>
                </div>
                <div className="font-semibold text-md mt-10 mb-2">
                    About this course
                </div>
                {course.description ? (
                    <div className="prose max-w-none">
                    <p className="text-base-content/80 mb-4">{course.description}</p>
                    </div>
                ) : (
                    <div className="italic mb-4">
                    No description provided for this course.
                    </div>
                )}
                <div className="text-lg font-semibold">
                    Curriculum Materials
                </div>
                <CourseDiscussion id={course.id} />
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
            <h3 className="text-lg font-medium text-base-content/70 mb-2">
              No lessons yet
            </h3>
            <p className="text-base-content/60">
              This course hasn't added any lessons yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getInitials(name: string | undefined): string {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
  }