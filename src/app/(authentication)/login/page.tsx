"use client";
import { useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../../lib/firebase";

export default function Page() {
    const [error, setError] = useState("");
    const [visible, setVisible] = useState(false);

    const toggleVisible = () => {
        setVisible((previusVisible) => !previusVisible);
    };
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const email = form.email.value;
      const password = form.password.value;
  
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Signed in!");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    };

    return (
        <form onSubmit={handleSubmit} className="shadow-lg rounded-md border border-neutral/10 p-10 w-full max-w-100">
            <div className="text-center mb-5">
                <h2 className="text-xl font-semibold">
                    OfCoursly
                </h2>
                <h3 className="text-sm font-thin opacity-80">
                    Your learning platform
                </h3>
            </div>
            <h3 className="">
                Welcome back
            </h3>
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Email</legend>
                <input name="email" type="text" className="input input-bordered w-full" placeholder="johndoe@example.com" />
            </fieldset>
            <fieldset className="fieldset">
                <label className="label">
                <span className="label-text">Password</span>
                </label>
                <div className="relative">
                <input
                    name="password"
                    type={visible ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input input-bordered w-full pr-12"
                    required
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                    onClick={toggleVisible}
                >
                    {visible ? "Hide" : "Show"}
                </button>
                </div>
                {error && (
                <label className="label">
                    <span className="label-text-alt text-error">{error}</span>
                </label>
                )}
            </fieldset>
            <div className="mt-6">
                <button className="btn btn-primary w-full">Sign In</button>
            </div>
        </form>
    )
}
