import { storage } from "lib/firebase";
import { ref, getMetadata, getDownloadURL } from "firebase/storage"
import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";

interface ParamsType {
    courseId: string
    lessonId: number
    path?: string[]
}

export default async function Page({ params }:
    { params: Promise<ParamsType> }) {


    return <h1>Whyyy</h1>
}

export const dynamic = "force-dynamic";

// export async function getServerSideProps({ params }:
//     { params: Promise<ParamsType> }) {
//
//     const {
//         courseId,
//         lessonId,
//         path
//     } = await params;
//
//     const storage = getStorage(firebase);
//     const bucket = storage.bucket();
//     const file = bucket.file(`${courseId}/${lessonId}/${path?.join('/') ?? ''}`);
//     if (!file.exists) {
//         console.log("I don't exist bro");
//         return {};
//     }
//
//     console.log(file.publicUrl());
//     const redirects = {}
//
// }
