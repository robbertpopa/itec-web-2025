/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "lib/firebase";
import {
  ref as dbRef,
  child,
  get,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import CourseCard from "@/components/ui/CourseCard";
import { Calendar } from "@/components/ui/Calendar";
import Link from "next/link";
import cn from "lib/utils/cn";
import { useNotification } from "lib/context/NotificationContext";

type Course = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  createdAt: string;
  ownerId: string;
  ownerName: string;
  imageUrl?: string;
  authorName?: string;
  ownerProfilePicture?: string;
  scheduledDate?: string;
  recurrence?: "once" | "weekly";
};

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  courseId: string;
  status: "UPCOMING" | "PAST";
};

export default function Page() {
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [markedLearningDays, setMarkedLearningDays] = useState<Date[]>([]);
  const [viewPastEvents, setViewPastEvents] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth().currentUser;
        if (!user) return;

        setLoading(true);

        const events: CalendarEvent[] = [];

        try {
          const token = await user.getIdToken();
          const response = await fetch(
            `/api/users/${user.uid}/programmedLessons`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const markedDays = data.programmedLessons.map(
              (l: any) => new Date(l.date)
            );
            setMarkedLearningDays(markedDays);
            events.push(
              ...markedDays.map((date: Date, idx: number) => ({
                id: `programmed-${idx}`,
                title: "Planned Learning",
                date,
                courseId: "",
                status: date < new Date() ? "PAST" : "UPCOMING",
              }))
            );
          }
        } catch (error) {
          console.error("Error fetching programmed lessons:", error);
        }

        try {
          const dbReference = dbRef(db());
          const recentCoursesRef = query(
            child(dbReference, "courses"),
            orderByChild("createdAt"),
            limitToLast(4)
          );
          const recentCoursesSnapshot = await get(recentCoursesRef);

          if (recentCoursesSnapshot.exists()) {
            const coursesData = recentCoursesSnapshot.val();

            const allRecentCourses = Object.entries(coursesData).map(
              ([id, value]) => ({
                id,
                ...(value as any),
                title: (value as any).name || "",
              })
            );

            const coursesWithDetails = await Promise.all(
              allRecentCourses.map(async (course) => {
                try {
                  let imageUrl;
                  try {
                    const imageRef = storageRef(
                      storage(),
                      `courses/${course.id}/cover.webp`
                    );
                    imageUrl = await getDownloadURL(imageRef);
                  } catch (err) {
                    if (err instanceof Error) {
                      showNotification(err.message, "error");
                    }
                    imageUrl = undefined;
                  }

                  let ownerName = "Unknown";
                  let ownerProfilePicture = "";
                  if (course.ownerId) {
                    try {
                      const ownerRef = child(
                        dbReference,
                        `users/${course.ownerId}`
                      );
                      const ownerSnapshot = await get(ownerRef);

                      if (ownerSnapshot.exists()) {
                        const ownerData = ownerSnapshot.val();
                        ownerName = ownerData.fullName || "Unknown";
                        ownerProfilePicture = ownerData.profilePicture || "";
                      }
                    } catch (error) {
                      console.error(
                        `Error fetching owner for course ${course.id}:`,
                        error
                      );
                    }
                  }

                  return {
                    ...course,
                    imageUrl,
                    thumbnail: imageUrl,
                    authorName: ownerName,
                    ownerProfilePicture,
                  };
                } catch (error) {
                  console.error(
                    `Error processing recent course ${course.id}:`,
                    error
                  );
                  return course;
                }
              })
            );

            setRecentCourses(coursesWithDetails);
          }
        } catch (error) {
          console.error("Error fetching recent courses:", error);
        }

        try {
          const dbReference = dbRef(db());
          const enrollmentsRef = child(
            dbReference,
            `users/${user.uid}/enrollments`
          );
          const enrollmentsSnapshot = await get(enrollmentsRef);

          if (enrollmentsSnapshot.exists()) {
            const enrollments = enrollmentsSnapshot.val();

            const enrolledCoursesPromises = Object.keys(enrollments).map(
              async (courseId) => {
                try {
                  const courseRef = child(dbReference, `courses/${courseId}`);
                  const courseSnapshot = await get(courseRef);

                  if (courseSnapshot.exists()) {
                    const courseData = courseSnapshot.val();

                    let imageUrl;
                    try {
                      const imageRef = storageRef(
                        storage(),
                        `courses/${courseId}/cover.webp`
                      );
                      imageUrl = await getDownloadURL(imageRef);
                    } catch (err) {
                      if (err instanceof Error) {
                        showNotification(err.message, "error");
                      }
                      imageUrl = undefined;
                    }

                    let ownerName = "Unknown";
                    let ownerProfilePicture = "";
                    if (courseData.ownerId) {
                      try {
                        const ownerRef = child(
                          dbReference,
                          `users/${courseData.ownerId}`
                        );
                        const ownerSnapshot = await get(ownerRef);

                        if (ownerSnapshot.exists()) {
                          const ownerData = ownerSnapshot.val();
                          ownerName = ownerData.fullName || "Unknown";
                          ownerProfilePicture = ownerData.profilePicture || "";
                        }
                      } catch (error) {
                        console.error(
                          `Error fetching owner for enrolled course ${courseId}:`,
                          error
                        );
                      }
                    }

                    return {
                      id: courseId,
                      ...courseData,
                      title: courseData.name || "",
                      imageUrl,
                      thumbnail: imageUrl,
                      courseAuthorName: ownerName,
                      ownerProfilePicture,
                    };
                  }
                  return null;
                } catch (error) {
                  console.error(
                    `Error fetching enrolled course ${courseId}:`,
                    error
                  );
                  return null;
                }
              }
            );

            const resolvedCourses = (
              await Promise.all(enrolledCoursesPromises)
            ).filter(Boolean) as Course[];
            setEnrolledCourses(resolvedCourses);

            resolvedCourses.forEach((course) => {
              if (!course || !course.scheduledDate) return;

              const firstDate = new Date(course.scheduledDate);
              const occurrences = course.recurrence === "weekly" ? 4 : 1;
              for (let i = 0; i < occurrences; i++) {
                const date = new Date(firstDate);
                if (course.recurrence === "weekly") {
                  date.setDate(firstDate.getDate() + i * 7);
                }

                events.push({
                  id: `${course.id}-${i}`,
                  title: course.title || "Untitled Course",
                  date,
                  courseId: course.id,
                  status: date < new Date() ? "PAST" : "UPCOMING",
                });
              }
            });
          }
          setCalendarEvents(events);
        } catch (error) {
          console.error("Error fetching enrolled courses:", error);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkDay = async (date: Date, isMarked: boolean) => {
    try {
      const user = auth().currentUser;
      if (!user) {
        showNotification("You must be logged in to mark days", "error");
        return;
      }

      if (isMarked) {
        setMarkedLearningDays((prev) => [...prev, date]);
      } else {
        setMarkedLearningDays((prev) =>
          prev.filter(
            (d) =>
              !(
                d.getDate() === date.getDate() &&
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear()
              )
          )
        );
      }

      const token = await user.getIdToken();

      const response = await fetch(`/api/users/${user.uid}/programmedLessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: date.toISOString(),
          isMarked,
        }),
      });

      if (response.ok) {
        showNotification(
          isMarked
            ? `Marked ${date.toLocaleDateString()} for learning`
            : `Unmarked ${date.toLocaleDateString()}`,
          "success"
        );
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update learning schedule"
        );
      }
    } catch (error) {
      console.error("Error updating programmed lesson:", error);
      showNotification("Failed to update your learning schedule", "error");

      setMarkedLearningDays((prev) => {
        const dateExists = prev.some(
          (d) =>
            d.getDate() === date.getDate() &&
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear()
        );

        if (isMarked && dateExists) {
          return prev.filter(
            (d) =>
              !(
                d.getDate() === date.getDate() &&
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear()
              )
          );
        } else if (!isMarked && !dateExists) {
          return [...prev, date];
        }

        return prev;
      });
    }
  };

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome to Your Learning Dashboard
        </h1>
        <p className="text-lg text-base-content/80 max-w-2xl mx-auto">
          Track your progress, discover new courses, and manage your learning
          journey all in one place.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Enrolled Courses</h2>
              <Link
                href="/courses"
                className="btn btn-sm btn-outline btn-primary"
              >
                View All
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="skeleton h-48 w-full"></div>
                ))}
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="card bg-base-200 p-6 text-center">
                <h3 className="font-medium mb-2">No enrolled courses yet</h3>
                <p className="text-base-content/70 mb-4">
                  Discover and enroll in courses to start learning
                </p>
                <Link href="/courses" className="btn btn-primary">
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolledCourses.slice(0, 4).map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnail={course.thumbnail}
                    authorName={course.ownerName}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Courses</h2>
              <Link
                href="/courses"
                className="btn btn-sm btn-outline btn-primary"
              >
                Explore
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="skeleton h-48 w-full"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnail={course.thumbnail}
                    authorName={course.ownerName}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-6">Your Schedule</h2>

              <Calendar
                events={calendarEvents}
                markedDays={markedLearningDays}
                onEventClick={(event) =>
                  router.push(`/courses/${event.courseId}`)
                }
                onMarkDay={handleMarkDay}
              />

              <div className="divider"></div>

              <div className="mt-2 space-y-4">
                <h3 className="font-semibold text-lg">Lessons</h3>
                <div className="tabs mb-2">
                  <a
                    className={`tab tab-bordered ${!viewPastEvents ? "tab-active" : ""}`}
                    onClick={() => setViewPastEvents(false)}
                  >
                    Upcoming
                  </a>
                  <a
                    className={`tab tab-bordered ${viewPastEvents ? "tab-active" : ""}`}
                    onClick={() => setViewPastEvents(true)}
                  >
                    Past
                  </a>
                </div>

                {[
                  ...calendarEvents,
                  ...markedLearningDays.map((date, index) => ({
                    id: `marked-${index}`,
                    title: "Planned Learning",
                    date,
                    courseId: "",
                    status: date < new Date() ? "PAST" : "UPCOMING",
                  })),
                ]
                  .filter((event) =>
                    viewPastEvents
                      ? event.status === "PAST"
                      : event.status === "UPCOMING"
                  )
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors",
                        event.courseId ? "cursor-pointer" : ""
                      )}
                      onClick={() =>
                        event.courseId
                          ? router.push(`/courses/${event.courseId}`)
                          : null
                      }
                    >
                      <div
                        className={cn(
                          "rounded-md p-2 text-center w-12",
                          event.status === "PAST"
                            ? "bg-base-300 text-base-content"
                            : event.courseId
                              ? "bg-primary text-primary-content"
                              : "bg-success text-primary-content"
                        )}
                      >
                        <div className="text-xs">
                          {event.date.toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </div>
                        <div className="text-lg font-bold">
                          {event.date.getDate()}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-base-content/70">
                          {event.date.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                {calendarEvents.length === 0 &&
                  markedLearningDays.length === 0 && (
                    <div className="text-center py-4 text-base-content/70">
                      No lessons scheduled
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
