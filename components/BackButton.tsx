"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { IoArrowBackSharp } from "react-icons/io5";

type Props = { path?: string };

const BackButton = (props: Props) => {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center justify-start">
      <div className="flex justify-start items-center w-fit flex-row bg-blue-500 text-white font-medium text-xs capitalize shadow-lg rounded-md p-2">
        <button onClick={() => router.back()} className="flex flex-row gap-2">
          <IoArrowBackSharp /> back
        </button>
      </div>
      {props.path && (
        <>
          <h1 className="font-montserrat text-white py-1 rounded-md px-2 font-medium mx-2 text-base lg:shadow-lg shadow-md text-center uppercase bg-gradient-to-b from-[#921A40] to-[#ff0051]">
            {props.path}
          </h1>
        </>
      )}
    </div>
  );
};

export default BackButton;
