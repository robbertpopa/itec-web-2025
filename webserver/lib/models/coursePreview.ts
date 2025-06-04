export default interface CoursePreview {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  scheduledDate?: string;
  recurrence?: "once" | "weekly";
  status?: "UPCOMING" | "PAST";
}
