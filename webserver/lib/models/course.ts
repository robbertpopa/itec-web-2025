export default interface Course {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  lessons?: string[];
  scheduledDate?: string;
  recurrence?: "once" | "weekly";
  status?: "UPCOMING" | "PAST";
  access?: "open" | "invite";
}
