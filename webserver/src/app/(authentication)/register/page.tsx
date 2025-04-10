"use client";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, googleProvider } from "lib/firebase";
import { ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useNotification } from "lib/context/NotificationContext";
import { useState } from "react";
import Modal from "@/components/ui/Modal";

export default function Page() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  const router = useRouter();
  let full_name: string = "";
  const { showNotification } = useNotification();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const email = form.email.value;
    const password = form.password.value;
    const confirm_password = form.confirm_password.value;
    full_name = form.full_name.value;

    if (password !== confirm_password) {
      showNotification("Passwords must be the same", "error");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth(),
        email,
        password
      );
      const user = userCredential.user;
      if (user) {
        await sendEmailVerification(user);

        set(ref(db(), "users/" + user?.uid), {
          fullName: full_name,
          profilePicture: null,
          createdAt: new Date().toISOString(),
        });

        router.push("/");
      }
    } catch (err) {
      if (err instanceof Error) {
        showNotification(err.message, "error");
      }
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth(), googleProvider());
      const user = result.user;
      full_name = user.displayName || "";

      if (user) {
        try {
          const token = await auth()?.currentUser?.getIdToken();

          const formData = new FormData();
          formData.append("full_name", full_name);

          if (user?.photoURL) {
            formData.append("image", user?.photoURL);
          }

          const response = await fetch("/api/users", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to create user");
          }
        } catch {}

        router.push("/");
      }
    } catch (err) {
      if (err instanceof Error) {
        showNotification(err.message, "error");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="shadow-lg rounded-md border border-neutral/10 p-10 w-100"
    >
      <div className="flex flex-col items-center justify-center mb-5 w-full">
        <Image src="/images/of_coursly.png" alt="" width={100} height={100} />

        <h3 className="text-sm font-thin opacity-80">Your learning platform</h3>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Create account</h2>
        <h3 className="text-sm font-thin opacity-80">
          Join our community of learners today
        </h3>
      </div>
      <div className="flex flex-col gap-4 mt-5">
        <fieldset className="fieldset">
          <label className="floating-label">
            <input
              type="text"
              className="input"
              name="full_name"
              placeholder="Full Name"
              required
            />
            <span>Full name</span>
          </label>
        </fieldset>
        <fieldset className="fieldset flex flex-col gap-1">
          <label className="floating-label">
            <input
              type="email"
              className="input validator"
              name="email"
              placeholder="Email address"
              required
            />
            <span>Email</span>
          </label>
        </fieldset>
        <fieldset className="fieldset flex flex-col gap-1">
          <label className="floating-label">
            <input
              type="password"
              className="input validator"
              name="password"
              placeholder="Password"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              required
            />
            <span>Password</span>
          </label>
          <small className="text-xs text-gray-500">
            Must be at least 12 characters long and include at least one digit,
            one lowercase letter, and one uppercase letter.
          </small>
        </fieldset>
        <fieldset className="fieldset flex flex-col gap-1">
          <label className="floating-label">
            <input
              type="password"
              className="input validator"
              name="confirm_password"
              placeholder="Confirm password"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{12,}"
              required
            />
            <span>Confirm Password</span>
          </label>
        </fieldset>
        <fieldset className="flex items-center gap-4">
          <input
            type="checkbox"
            id="tos"
            required
            className="checkbox checkbox-primary checkbox-sm"
          />
          <label htmlFor="tos" className="label cursor-pointer">
            <span className="label-text text-sm">
              I agree to the{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsTermsModalOpen(true);
                }}
                className="link link-primary"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsPrivacyModalOpen(true);
                }}
                className="link link-primary"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>
        </fieldset>

        <Modal
          isOpen={isTermsModalOpen}
          onClose={() => setIsTermsModalOpen(false)}
          title="Terms of Service"
        >
          <div className="prose max-w-none text-sm leading-relaxed space-y-4 overflow-y-auto max-h-[60vh]">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Eligibility:</strong> You must be at least 13 years old
                (or the applicable age of majority in your jurisdiction) to use
                OurApp. If you are under the required age, you must obtain
                consent from a parent or guardian.
              </li>
              <li>
                <strong>Account Registration:</strong> When you create an
                account, you agree to provide accurate and up-to-date
                information. You are responsible for maintaining the
                confidentiality of your login credentials.
              </li>
              <li>
                <strong>User-Generated Content:</strong> You retain ownership of
                the content you submit, but grant OurApp a non-exclusive,
                worldwide license to display, distribute, and use your content
                on our platform.
              </li>
              <li>
                <strong>Prohibited Conduct:</strong> You agree not to engage in
                any behavior that is harmful, fraudulent, or in violation of any
                applicable laws. Misuse of the platform may result in account
                termination.
              </li>
              <li>
                <strong>Intellectual Property:</strong> All trademarks, logos,
                and other intellectual property displayed on OurApp are owned by
                their respective owners. Unauthorized use is prohibited.
              </li>
              <li>
                <strong>Limitation of Liability:</strong> OurApp is provided as
                is and without warranties of any kind. We are not liable for any
                indirect, incidental, or consequential damages arising from your
                use of the service.
              </li>
              <li>
                <strong>Changes to the Terms:</strong> We reserve the right to
                modify these Terms of Service at any time. Significant changes
                will be communicated via the platform or email.
              </li>
              <li>
                <strong>Governing Law:</strong> These terms are governed by the
                laws of [Your Jurisdiction]. Any disputes arising will be
                subject to the exclusive jurisdiction of the courts in that
                region.
              </li>
            </ol>
          </div>
        </Modal>

        <Modal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
          title="Privacy Policy"
        >
          <div className="prose max-w-none text-sm leading-relaxed space-y-4 overflow-y-auto max-h-[60vh]">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Information We Collect:</strong> We collect personal
                data you provide (e.g., name, email) when registering and usage
                data such as your interactions with OurApp.
              </li>
              <li>
                <strong>How We Use Your Information:</strong> Your data is used
                to provide and improve our services, personalize your
                experience, and communicate updates or promotional materials.
              </li>
              <li>
                <strong>Data Sharing:</strong> We do not sell your personal
                data. Information may be shared with trusted third-party service
                providers only as necessary for operating OurApp.
              </li>
              <li>
                <strong>Data Security:</strong> We implement technical and
                organizational measures to protect your information from
                unauthorized access or disclosure.
              </li>
              <li>
                <strong>Your Rights:</strong> You have the right to access,
                correct, or delete your personal information and to restrict or
                object to certain processing activities.
              </li>
              <li>
                <strong>Cookies and Tracking:</strong> We use cookies to enhance
                your experience. You can manage your cookie preferences through
                your browser settings.
              </li>
              <li>
                <strong>Data Retention:</strong> Your personal data is retained
                only for as long as necessary to fulfill the purposes outlined
                in this policy or as required by law.
              </li>
              <li>
                <strong>Changes to This Policy:</strong> We may update this
                Privacy Policy from time to time. Any significant changes will
                be communicated to you via OurApp or email.
              </li>
            </ol>
          </div>
        </Modal>
        <button className="btn btn-primary">Create Account</button>
        <div className="divider text-sm opacity-80">OR</div>
        <button type="button" onClick={handleGoogleRegister} className="btn">
          <svg
            aria-label="Google logo"
            width="16"
            height="16"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <g>
              <path d="m0 0H512V512H0" fill="#fff"></path>
              <path
                fill="#34a853"
                d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
              ></path>
              <path
                fill="#4285f4"
                d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
              ></path>
              <path
                fill="#fbbc02"
                d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
              ></path>
              <path
                fill="#ea4335"
                d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
              ></path>
            </g>
          </svg>
          Register with Google
        </button>
        <label className="text-sm text-center">
          Already have an account?{" "}
          <a href="/login" className="link link-primary">
            Sign in
          </a>
        </label>
      </div>
    </form>
  );
}
