"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "lib/firebase";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Page() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const email = form.email.value;
    const password = form.password.value;
    const confirm_password = form.confirm_password.value;
    const full_name = form.full_name.value;

    if (password !== confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        await sendEmailVerification(user);
        router.push('/');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        router.push('/');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

    return (
        <form onSubmit={handleSubmit} className="shadow-lg rounded-md border border-neutral/10 p-10 w-full max-w-100 min-w-100">
            <div className="flex flex-col items-center justify-center mb-5 w-full">
                <Image src="/images/of_coursly.png" alt="" width={100} height={100} />

                <h3 className="text-sm font-thin opacity-80">
                    Your learning platform
                </h3>
            </div>
            <div>
                <h2 className="text-xl font-semibold">
                    Create account
                </h2>
                <h3 className="text-sm font-thin opacity-80">
                    Join our community of learners today
                </h3>
            </div>
            <div className="text-red-500 text-sm text-center">
                {error}
            </div>
            <div className="flex flex-col gap-4 mt-5">
                <fieldset className="fieldset">
                    <input type="text" className="input" name="full_name" placeholder="Full Name" required />
                </fieldset>
                <fieldset className="fieldset flex flex-col gap-1">
                    <input type="email" className="input validator" name="email" placeholder="Email address" required  />
                </fieldset>
                <fieldset className="fieldset flex flex-col gap-1">
                    <input type="password" className="input validator" name="password" placeholder="Password"
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" required />
                </fieldset>
                <fieldset className="fieldset flex flex-col gap-1">
                    <input type="password" className="input validator" name="confirm_password" placeholder="Confirm password"
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" required />
                </fieldset>
                <fieldset>
                    <div className="flex flex-row gap-4 items-center">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary"
                            id="tos"
                            required
                        />
                        <label htmlFor="tos" className="text-sm">
                        I agree to the{' '}
                        <a href="/terms" className="link link-primary">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="link link-primary">
                            Privacy Policy
                        </a>.
                        </label>
                    </div>
                </fieldset>
                <button className="btn btn-primary">Create Account</button>
                <div className="divider text-sm opacity-80">OR</div>
                <button onClick={handleGoogleRegister} className="btn">
                    <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                    Register with Google
                </button>
                <label htmlFor="tos" className="text-sm text-center">
                    Already have an account?{' '}
                    <a href="/login" className="link link-primary">
                        Sign in
                    </a>
                </label>
            </div>
        </form>
    )
}
