"use client";
import { useState, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { GrApple } from "react-icons/gr";
import { useRouter } from "next/navigation";

const Signup = () => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSignup = () => {
    // Add your signup logic here
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // Save user or call API
    // Redirect to login or dashboard
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-blue-100 to-purple-200">
      <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-2xl p-8 sm:max-w-md w-full space-y-8 border border-white/60">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2 tracking-tight">
          Create your <span className="text-pink-600">Cloud Commerce</span> <span className="text-blue-600">account</span>
        </h2>
        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSignup(); }}>
          <input
            ref={usernameRef}
            type="text"
            placeholder="Username"
            className="w-full rounded-xl bg-white/90 border border-gray-200 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm text-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl bg-white/90 border border-gray-200 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm text-lg"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full rounded-xl bg-white/90 border border-gray-200 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm text-lg"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Select Year:</label>
            <select
              className="w-full rounded-xl bg-white/90 border border-gray-200 py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm"
              value={selectedYear || ""}
              onChange={(e) => setSelectedYear(e.target.value)}
              required
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
          <button
            type="submit"
            className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-700 rounded-xl text-white font-bold shadow-lg transition text-lg"
          >
            Sign Up
          </button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-3 text-gray-400">or continue with</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        <div className="flex justify-center space-x-4">
          <button className="bg-white/90 shadow px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-50 transition">
            <FcGoogle className="h-6 w-6" />
            <span className="text-gray-700 font-semibold">Google</span>
          </button>
          <button className="bg-white/90 shadow px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-50 transition">
            <GrApple className="h-6 w-6 text-black" />
            <span className="text-gray-700 font-semibold">Apple</span>
          </button>
        </div>
        <div className="text-center mt-4">
          <span className="text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-pink-600 font-semibold hover:underline">Log In</a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup; 