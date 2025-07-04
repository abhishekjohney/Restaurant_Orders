"use client";

import { signIn } from "next-auth/react";
import { useDeferredValue, useRef } from "react";


const Login = () => {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="relative w-full sm:w-[30rem] rounded-lg border-gray-400 bg-white shadow-lg px-4">
                <div className="flex-auto p-6">
                    <div className="mb-10 flex justify-center">
                        <a
                            href="#"
                            className="flex items-center gap-2 text-indigo-500 no-underline hover:text-indigo-500"
                        >
                            <span className="text-3xl font-black text-center lowercase tracking-tight">
                                Welcome to Cloud Commerce.
                            </span>
                        </a>
                    </div>

                    <p className="mb-6 text-gray-500">
                        Please sign in to access your account
                    </p>

                    <form className="mb-4" action="#" method="POST">
                        <div className="mb-4">
                            <label className="mb-2 inline-block text-xs font-medium uppercase text-gray-700">
                                Email or Username
                            </label>
                            <input
                                ref={usernameRef}
                                type="text"
                                className="block w-full rounded-md border border-gray-400 bg-white py-2 px-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:text-gray-600"
                                id="email"
                                name="email-username"
                                placeholder="Enter your email or username"
                                autoFocus
                            />
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between">
                                <label className="mb-2 inline-block text-xs font-medium uppercase text-gray-700">
                                    Password
                                </label>
                                <a
                                    href="auth-forgot-password-basic.html"
                                    className="text-indigo-500 no-underline hover:text-indigo-500"
                                >
                                    <small className="cursor-pointer">
                                        Forgot Password?
                                    </small>
                                </a>
                            </div>
                            <input
                                ref={passwordRef}
                                type="password"
                                id="password"
                                className="block w-full rounded-md border border-gray-400 bg-white py-2 px-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:text-gray-600"
                                name="password"
                                placeholder="············"
                            />
                        </div>
                        <div className="mb-4">
                            <div className="block">
                                <input
                                    className="mt-1 mr-2 h-5 w-5 appearance-none rounded border border-gray-300 bg-contain bg-no-repeat align-top text-black shadow checked:bg-indigo-500 focus:border-indigo-500 focus:shadow"
                                    type="checkbox"
                                    id="remember-me"
                                    style={{
                                        backgroundImage:
                                            "url('data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 10l3 3l6-6'/%3e%3c/svg%3e')",
                                    }}
                                    defaultChecked
                                />
                                <label className="inline-block">
                                    {" "}
                                    Remember Me{" "}
                                </label>
                            </div>
                        </div>
                        <div className="mb-4">
                            <button
                                type="button"
                                className="w-full rounded-md border border-indigo-500 bg-indigo-500 py-2 px-5 text-center text-sm text-white shadow hover:border-indigo-600 hover:bg-indigo-600 hover:text-white focus:border-indigo-600 focus:bg-indigo-600 focus:text-white focus:shadow-none"
                                onClick={() =>
                                    signIn("credentials", {
                                        username: usernameRef.current?.value,
                                        password: passwordRef.current?.value,
                                        callbackUrl: "/auth-redirect",
                                    })
                                }
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    <p className="mb-4 text-center">
                        New on Futurism?
                        <a
                            href="#"
                            className="text-indigo-500 no-underline hover:text-indigo-500"
                        >
                            {" "}
                            Create an account{" "}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
