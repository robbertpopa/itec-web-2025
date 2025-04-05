import { firebase } from "lib/firebaseServer"
import Course from "lib/models/course";
import Link from "next/link";

export default async function Page({ params }:
    { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;

    const db = firebase().database();
    const ref = db.ref(`courses/${courseId}`);
    const course = (await ref.get()).val() as Course;

    const auth = firebase().auth();
    const owner = await auth.getUser(course.ownerId);

    const bucket = firebase().storage().bucket();
    const image = bucket.file(`courses/${courseId}/cover.webp`);
    const [hasImage] = await image.exists();
    const [imageUrl] = hasImage ? await image.getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000
    }) : [null]

    return (<>
        <h1 className="text-2xl">{course.name}</h1>
        {course.description != null &&
            <p>{course.description}</p>}
        {imageUrl && <img src={imageUrl} alt="cover image" className="max-w-full max-h-lg"/>}
        <p>{`Owned by: ${owner.displayName}`}</p>
        <h2 className="text-lg">Lessons:</h2>
        {course.lessons != null ? <ul>
            {course.lessons.map((l, idx) => {
                return <li key={idx}>
                    <Link href={`/courses/${courseId}/${idx}`} className="link">
                        {idx}: {l}
                    </Link>
                </li>
            })}
        </ul>
            :
            <p>{"This course hasn't added any lessons yet."}</p>
        }
    </>)
}
