"use client";

import { signIn } from "next-auth/react";
import { useDeferredValue, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { GrApple } from "react-icons/gr";
import {  useState } from 'react'



const Login = () => {
  
    const [selectedYear, setSelectedYear] = useState<string | null>(null);

    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const saveUser = () => {
    const username = usernameRef.current?.value;
    const userYear = selectedYear;
  
    if (username && userYear) {
      const userKey = `${username}_${userYear}`;
      localStorage.setItem("UserYear", userKey);
    }

  }
  
    return (
        <div className="min-h-screen flex items-center px-8 py-8 md:px-6 md:py-6 justify-center bg-gradient-to-br from-green-300 via-blue-500 to-purple-600">
            <div className="bg-white customLoginHeight    shadow-md rounded-lg p-8 sm:max-w-md max-w-sm  w-full space-y-6">
                <h2 className="md:text-2xl text-xl customFont mb-3 font-extrabold text-center text-gray-800">
                    Welcome to{" "}
                    <span className="text-blue-600">Cloud Commerce</span>
                    <span className="text-red-600">!</span>
                </h2>
                <form className="space-y-6 relative top-3">
                    <div>
                        <input
                            ref={usernameRef}
                            type="text"
                            placeholder="Username"
                            className="w-full shadow-md rounded-sm bg-slate-50 border border-gray-100 py-3 px-4 placeholder-gray-600 focus:outline-none focus:border-slate-500"
                        />
                    </div>
                    <div>
                        <input
                            ref={passwordRef}
                            type="password"
                            placeholder="Password"
                            className="w-full rounded-md shadow-sm bg-slate-50  border border-gray-100 py-3 px-4 placeholder-gray-600 focus:outline-none focus:border-slate-500"
                        />
                    </div>


         <div className="text-center flex justify-center flex-col">
          
          
           <label className="text-gray-600">Select Year:</label>
          
          <div className="flex flex-col mt-0 justify-center"> 
            
          <select
            className="w-1/2 mx-auto rounded-md shadow-sm flex justify-center bg-slate-50 border border-gray-100 py-3 px-4 placeholder-gray-600 focus:outline-none focus:border-slate-500"
            value={selectedYear || ""}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Select</option>
            <option value="2010">2010</option>
            <option value="2011">2011</option>
            <option value="2012">2012</option>
            <option value="2013">2013</option>
            <option value="2014">2014</option>
            <option value="2015">2015</option>
            <option value="2016">2016</option>
            <option value="2017">2017</option>
            <option value="2018">2018</option>
            <option value="2019">2019</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
        
          </select>
          </div>
        
        </div>


                    <div>
                        <button
                            type="button"
                            className="w-full px-4 py-3  bg-gray-900 rounded-md text-white font-semibold  shadow-sm transition duration-300"
                            onClick={() => {
                                signIn("credentials", {
                                    username: usernameRef.current?.value,
                                    password: passwordRef.current?.value,
                                    callbackUrl: "/auth-redirect",
                                });
                                saveUser()
                            }}
                        >
                            Sign In
                        </button>
                    </div>

                </form>
                <div className="text-center relative ">
                    <span className="text-gray-600 ">Or continue with</span>
                </div>
                <div className="flex justify-center space-x-4 ">
                    <div className="bg-white  shadow-md shadow-slate-100 md:px-5 md:py-2 cursor-pointer text-white flex items-center rounded-md px-2 py-2  transition duration-300">
                        <FcGoogle className="md:h-8 h-6 w-6 md:w-8" />
                        <h4 className="text-black px-2 mx-1">Google</h4>
                    </div>
                    <div className="bg-white shadow-md shadow-slate-100 md:px-3 md:py-3 px-2 py-2 cursor-pointer text-white flex items-center rounded-md   transition duration-300">
                        <GrApple className="md:h-8 h-6 w-6 text-black md:w-8" />
                        <h4 className="text-black px-2 mx-1">Apple</h4>
                    </div>
                    {/* Include Apple button or icon here */}
                </div>
                <div className="text-center">
                    <span className="text-gray-600">
                        Don't have an account?{" "}
                        <a href="#" className="text-blue-600">
                            Sign Up
                        </a>
                    </span>
                </div>
            </div>
        </div>
    );
};


export default Login;
