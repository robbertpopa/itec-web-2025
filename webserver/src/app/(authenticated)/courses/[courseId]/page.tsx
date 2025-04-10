import CourseDetails from "@/components/ui/CourseDetails";
import { firebase } from "lib/firebaseServer";
import Course from "lib/models/course";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const db = firebase().database();
  const ref = db.ref(`courses/${courseId}`);
  const course = (await ref.get()).val() as Course;

  const auth = firebase().auth();
  const owner = await auth.getUser(course.ownerId);

  const getOwnerDisplayName = async (ownerId: string) => {
    const userRef = db.ref(`users/${ownerId}`);
    const userSnapshot = await userRef.get();
    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      return userData.fullName || owner.displayName;
    } else {
      return owner.displayName;
    }
  };

  const bucket = firebase().storage().bucket();
  const image = bucket.file(`courses/${courseId}/cover.webp`);
  const [hasImage] = await image.exists();
  const [imageUrl] = hasImage
    ? await image.getSignedUrl({
        action: "read",
        expires: Date.now() + 15 * 60 * 1000,
      })
    : [null];

  return (
    <>
      <CourseDetails
        course={{
          id: courseId,
          name: course.name,
          description: course.description,
          lessons: course.lessons,
        }}
        owner={{
          displayName: await getOwnerDisplayName(course.ownerId),
          profilePicture: owner.photoURL,
        }}
        imageUrl={imageUrl}
      />
    </>
  );
}
