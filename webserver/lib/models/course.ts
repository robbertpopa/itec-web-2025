export default interface Course {
    id: string;
    ownerId: string;
    name: string;
    description?: string;
    lessons?: string[];
}
