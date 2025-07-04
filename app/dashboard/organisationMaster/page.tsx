// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import { Sidebar } from "@/components/salesman/Sidebar";
import { signIn, signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { ListApi } from "@/app/utils/api";
import Image from "next/image";
import AvatarImage from "../../../public/images/avatar.png";
import OrganizationMasterInfo from "@/components/Admin/OrganizationMasterInfo";
import OrganizationMasterSetting from "@/components/Admin/OrganizationMasterSetting";
import BackButton from "@/components/BackButton";

const OrganizationMaster = () => {
  const [activeTab, setActiveTab] = useState("orgInfo");

  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();
  const DateVal = searchParams.get("date");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div
        className="min-h-screen rounded-md w-full lg:w-4/5 bg-slate-100 lg:mt-12 mt-28 mx-auto mb-2 p-8 lg:p-0"
        style={{
          boxShadow: "5px 5px 15px 10px rgba(173, 216, 230, 0.9)",
        }}
      >
        <div className="w-full rounded-md bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 mx-auto text-white font-semibold text-xl text-center border-slate-100 px-3 py-4">
          <div>
            <BackButton path="Organisation Master" />
          </div>
        </div>
        <div className="flex">
          <div className="flex border-b border-gray-300">
            <button
              className={`${
                activeTab === "orgInfo" ? "border-b-4 border-yellow-500 text-yellow-500" : "text-gray-600 hover:text-gray-800"
              } py-2 px-4 focus:outline-none`}
              onClick={() => handleTabChange("orgInfo")}
            >
              Org. Info
            </button>
            <button
              className={`${
                activeTab === "settings" ? "border-b-4 border-yellow-500 text-yellow-500" : "text-gray-600 hover:text-gray-800"
              } py-2 px-4 focus:outline-none`}
              onClick={() => handleTabChange("settings")}
            >
              Settings
            </button>
          </div>
        </div>

        {activeTab === "orgInfo" && (
          <div>
            {/* Content for Org. Info tab */}
            <OrganizationMasterInfo />
          </div>
        )}
        {activeTab === "settings" && (
          <div>
            {/* Content for Settings tab */}
            <OrganizationMasterSetting />
          </div>
        )}
      </div>
    </>
  );
};

export default OrganizationMaster;
