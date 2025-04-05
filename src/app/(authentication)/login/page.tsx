"use client";

import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, googleProvider } from "lib/firebase";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { get, ref } from "firebase/database";

export default function Page() {
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            if (userCredentials.user) {
                router.push('/');
            }
        } catch (err) {
            if (err instanceof Error) {
            }
        }
    };

    const handleGoogleLogin = async () => {
        const result = await signInWithPopup(auth, googleProvider);

        const user = result.user;
        if (user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
                try {
                    const token = await auth?.currentUser?.getIdToken();

                    const formData = new FormData();
                    formData.append('full_name', user.displayName || "");

                    if (user?.photoURL) {
                        formData.append('image', user?.photoURL);
                    }

                    const response = await fetch('/api/users', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to create user');
                    }
                } catch {

                };
            }

            router.push('/');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="shadow-lg rounded-md border border-neutral/10 p-10 w-full max-w-100 min-w-100">
            <div className="flex flex-col items-center justify-center mb-5 w-full gap-0">
                <Image src="/images/of_coursly.png" alt="" width={100} height={100} />

                <h3 className="text-sm font-thin opacity-80">
                    Your learning platform
                </h3>
            </div>
            <div>
                <h2 className="text-xl font-semibold">
                    Welcome Back
                </h2>
                <h3 className="text-sm font-thin opacity-80">
                    Sign in to continue your learning journey
                </h3>
            </div>
            <div className="flex flex-col gap-4 mt-5">
                <fieldset className="fieldset flex flex-col gap-1">
                    <label className="floating-label">
                        <input type="email" className="input validator" name="email" placeholder="Email address" required />
                        <span>Email</span>
                    </label>
                </fieldset>
                <fieldset className="fieldset flex flex-col gap-1">
                    <label className="floating-label">
                        <input type="password" className="input" name="password" placeholder="Password" required />
                        <span>Password</span>
                    </label>
                </fieldset>
                <button className="btn btn-primary">Sign In</button>
                <div className="divider text-sm opacity-80">OR</div>
                <button onClick={handleGoogleLogin} className="btn">
                    <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                    Login with Google
                </button>
                <label htmlFor="tos" className="text-sm text-center">
                    {"Don't have an account? "}
                    <a href="/register" className="link link-primary">
                        Sign up
                    </a>
                </label>
            </div>
        </form>
    )
}
