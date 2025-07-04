import BackButton from "@/components/BackButton";
import React from "react";

const UsersOrderpage = () => {
  const userData = [
    { userType: "SADMIN", orders: 10, totalAmount: 1500 },
    { userType: "SM001", orders: 5, totalAmount: 800 },
    { userType: "SM002", orders: 8, totalAmount: 1200 },
    { userType: "SM003", orders: 12, totalAmount: 1800 },
  ];

  const indexColors = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff"];

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto py-6 md:px-6 lg:px-8 xl:px-10 md:mt-3 mt-12">
        <BackButton />
        <div className="flex md:flex-row flex-col justify-between items-center">
          <h1 className="text-xl md:text-xl  lg:text-2xl font-bold text-gray-800">Users Order</h1>
          <div className="md:mb-2">
            <input
              type="text"
              placeholder="Search by Item Name"
              className="w-full px-4 py-2 rounded-md border mt-3 border-gray-300 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-8 lg:grid-cols-4 gap-4  place-items-center">
          {userData.map((user, index) => (
            <div
              key={index}
              className="flex transition duration-300 ease-in-out transform hover:scale-105 bg-white p-4 rounded-lg items-center shadow-md"
            >
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: indexColors[index % indexColors.length] }} />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-indigo-700">{user.userType}</h3>
                <p className="text-gray-600">No. of Orders: {user.orders}</p>
                <p className="text-gray-600">Total Amount: ${user.totalAmount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersOrderpage;
