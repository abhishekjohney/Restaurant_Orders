"use client";
import React from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  close: any;
};

const CustomFunctionalModal = ({ children, title, close }: Props) => {
  return (
    <div
      id="default-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-[100000] justify-center items-center w-full md:inset-0"
    >
      <div className="relative p-4 w-full h-screen flex justify-center items-center max-w-screen max-h-screen">
        <div className="absolute inset-0 bg-black opacity-35 w-full h-full"></div>
        <div className="relative bg-white z-[100000] w-full md:min-w-[70%] md:max-w-[95%] rounded-lg shadow-xl">
          <div className="flex items-center w-full p-1 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl w-full font-semibold text-center mx-auto text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={() => close(false)}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide="default-modal"
            >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto md:p-2 space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default CustomFunctionalModal;
