"use client"
import { ref, child, get, query, limitToFirst, startAfter, orderByKey } from "firebase/database";
import { auth, db } from "lib/firebase";
import { useState, useEffect, useRef } from "react";
import Skeleton from "@/components/ui/Skeleton";
import { Search } from "lucide-react";
import Link from "next/link";

export default function Page() {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hash, setHash] = useState('');

    const fetchUserProfile = async () => {
        setLoading(true);
        const dbRef = ref(db);
        const user = auth.currentUser;
        let userProfile;
        
        userProfile = query(
            child(dbRef, "/profile" + user?.uid)
        );
        

        const snapshot = await get(userProfile);
        setLoading(false);
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="card lg:card-side bg-base-100 shadow-sm max-w-250">
                <div className="flex flex-col items-center gap-4 p-10">
                    <div className="relative group cursor-pointer" onClick={handleImageClick}>
                        <div className="avatar">
                            <div className="w-40 rounded-full overflow-hidden">
                                <img
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                    alt="Avatar"
                                />
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            Upload image
                        </div>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                // TODO: handle file upload logic
                                console.log("Selected file:", file);
                            }
                        }}
                    />

                    <div className="relative group cursor-pointer hidden" onClick={handleImageClick}>
                        <div className="avatar avatar-placeholder">
                            <div className="bg-neutral text-neutral-content w-40 rounded-full">
                                <span className="text-3xl">D</span>
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            Upload image
                        </div>
                    </div>

                    <div className="flex font-semibold text-lg">
                        Robert Popa
                    </div>
                </div>

                <div className="divider divider-horizontal"></div>

                <div className="card-body">
                    <h2 className="card-title">New album is released!</h2>
                    <p>Click the button to listen on Spotiwhy app.</p>
                    <div className="card-actions justify-end">
                        <button className="btn btn-primary">Listen</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
