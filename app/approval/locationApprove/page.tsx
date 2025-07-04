// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import { IoMdClose } from "react-icons/io";
import PartyListDetailModal from "@/components/Admin/PartyListDetailModal";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BackButton from "@/components/BackButton";
import { Spinner } from "@/components/Spinner";
import { useModal } from "@/Provider";
import deleteLoc from "../../../public/images/svg/delete.svg";
import approve from "../../../public/images/svg/approve.svg";
import reject from "../../../public/images/svg/reject.svg";
import Image from "next/image";
import Swal from "sweetalert2";

interface LocationData {
    Address: string;
    latitude: string;
    longitude: string;
    PartyId: string;
    PartyName: string;
    existingPlace: string;
    existingAddress: string;
    existingLatLong: string;
    existing: string | boolean;
    PartyAddress: string;
    LocAprYN: string;
    place: string;
    edit: boolean;
}

interface GPSLocationData {
    LocID: number;
    AccAutoID: number;
    CDate: string;
    LocLatLong: string;
    LocationString: string;
    LocPlace?: string; // Optional property
    Apryn: boolean;
    AprUser: string | null;
    AprDate: string | null;
    Byr_nam: string;
    AccAddress: string;
    AccAddress1: string;
    AccAddress2: string;
    AccCity: string;
    AccState: string;
    PhoneNo: string;
    PinCode: string;
    EMAIL: string;
}

const LocationList = () => {
    const listAPI = new ListApi();
    const updateAPI = new UpdateAPI();
    const router = useRouter();
    const session = useSession();

    const [partyList, setPartyList] = useState<GPSLocationData[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showModal, setShowModal] = useState(false);
    const [selectedBuyer, setSelectedBuyer] = useState(null);
    const [suggestion, setSuggestion] = useState([]);
    const [loading, setLoading] = useState(true);

    const [locationData, setLocationData] = useState<LocationData>({
        Address: "",
        latitude: "",
        longitude: "",
        PartyId: "",
        PartyName: "",
        PartyAddress: "",
        LocAprYN: "",
        place: "",
        edit: "",
    });

    const [showSearch, setShowSearch] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await listAPI.getPartyLocationAprList();
            const res = JSON.parse(response[0]?.JSONData1);

            if (res) {
                setPartyList(res);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // if group filter is on put group in this

    const filteredPartyList = partyList?.filter(
        (item) =>
            item.Byr_nam.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.AccAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (searchTerm?.length > 0) {
            if (searchTerm?.length === 0) setSuggestion([]);
            setShowSearch(true);
            const filteredList = partyList?.filter(
                (item) =>
                    item?.Byr_nam.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item?.AccAddress.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setSuggestion(filteredList);
        }
    }, [searchTerm, partyList]);

    const handleBuyerClick = (item) => {
        setSelectedBuyer(item);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };
    // BLUE, RED, WHITE, GREEN

    const handleDeleteLocationUpdate = async (item: GPSLocationData, status: boolean | string) => {
        let title;
        if (status === true) title = "Do you want to Approve ?";
        if (status === false) title = "Do you want to Disapprove ?";
        if (status === "delete") title = "Do you want to Delete ?";
        Swal.fire({
            title: title,
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Yes",
            denyButtonText: `No`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setLoading(true);
                    const ReAprUser = item?.Apryn ? item?.Apryn : session?.data?.user?.name;
                    const fetchDetails = await updateAPI.updatePartyGPSLocationApprove(ReAprUser, item?.AccAutoID, status);

                    fetchData();
                    setLoading(false);
                } catch (error) {
                    console.log(error);
                }
            }
        });
    };

    return (
        <>
            <div className="bg-slate-50 min-h-auto shadow-md mt-24 sm:mt-20 md:mt-0 flex items-start justify-start">
                {loading && <Spinner />}
                <div className="w-full md:w-4/5 lg:w-11/12 mx-auto p-2 md:p-4 lg:p-6 xl:p-8">
                    <div className="flex flex-col mt-2 mb-1 lg:mt-0 md:mt-20 items-center justify-between">
                        <div className="flex gap-2 w-full my-1 justify-between">
                            <BackButton />
                        </div>
                        <div className="relative mt-1 w-full">
                            <input
                                type="text"
                                placeholder="Search by Name"
                                className="px-4 w-full py-2 rounded-md border border-blue-500 input-info"
                                onClick={() => setShowSearch(!showSearch)}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute top-10 max-h-40 h-auto z-40 overflow-auto w-2/3 md:w-1/3 left-0 mx-auto">
                                {showSearch &&
                                    suggestion.length > 0 &&
                                    suggestion.map((item) => (
                                        <div key={item.AccAutoID} className="w-full bg-white p-0.5 rounded">
                                            <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                                                <div
                                                    className="text-md font-semibold text-success-content cursor-pointer"
                                                    onClick={() => {
                                                        // setPartySelected("selectParty");
                                                        handleBuyerClick(item);
                                                    }}
                                                >
                                                    {item.Byr_nam}
                                                </div>
                                                <div className="text-sm font-medium text-success-content">
                                                    {item.AccAddress}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:hidden mt-6 grid-cols-1 gap-3 max-h-[30rem] overflow-y-auto">
                        {filteredPartyList &&
                            filteredPartyList.map((item) => {
                                const dateTimeString = item?.CDate;
                                const datePart = dateTimeString.split("T")[0];
                                const [year, month, day] = datePart.split("-");
                                const formattedDate = `${day}/${month}/${year}`;
                                return (
                                    <div
                                        key={item.AccAutoID}
                                        className=" bg-[#FAF9F6] border border-blue-200 shadow-md rounded-lg  overflow-hidden"
                                        // style={{
                                        //   boxShadow: "5px 5px 15px 10px rgba(173, 216, 230, 0.9)",
                                        // }}
                                    >
                                        <div className="p-4 flex items-center">
                                            <div className="flex w-full justify-between">
                                                <div>
                                                    <p className="text-warning-content cursor-pointer font-extrabold mb-2">
                                                        {item.Byr_nam}
                                                    </p>
                                                    <p className="text-warning-content cursor-pointer">{item.AccAddress}</p>
                                                    <p className="text-warning-content">{formattedDate}</p>
                                                    <p className="text-warning-content">{item.LocLatLong}</p>
                                                    <p className="text-warning-content">{item.LocPlace}</p>
                                                    <p className="text-warning-content">{item.LocationString}</p>
                                                </div>
                                                <div className="flex gap-2 flex-col">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            className={`${
                                                                item?.Apryn
                                                                    ? "w-fit px-3 bg-primary rounded-lg p-1"
                                                                    : "w-fit px-3 bg-red-400 rounded-lg p-1"
                                                            }`}
                                                        >
                                                            <strong>{item?.Apryn ? "Approved" : "Not Approved"}</strong>
                                                        </button>
                                                    </div>
                                                    {item?.Apryn ? (
                                                        <></>
                                                    ) : (
                                                        <>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleDeleteLocationUpdate(item, true)}
                                                                    className={`block w-fit px-1 rounded-lg p-1`}
                                                                >
                                                                    <Image
                                                                        height={500}
                                                                        width={500}
                                                                        className="size-10 block"
                                                                        src={approve}
                                                                        alt="location update"
                                                                    />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteLocationUpdate(item, false)}
                                                                    className={`block w-fit px-1 rounded-lg p-1`}
                                                                >
                                                                    <Image
                                                                        height={500}
                                                                        width={500}
                                                                        className="size-10 block"
                                                                        src={reject}
                                                                        alt="location update"
                                                                    />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteLocationUpdate(item, "delete")}
                                                        className={`block w-fit px-3 rounded-lg p-1`}
                                                    >
                                                        <Image
                                                            height={500}
                                                            width={500}
                                                            className="size-10 block"
                                                            src={deleteLoc}
                                                            alt="location update"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    <div className="bg-white hidden lg:block  shadow  sm:rounded-lg overflow-auto max-h-96 h-96">
                        <table className="divide-y table divide-gray-200">
                            <thead className="bg-primary sticky top-0 ">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        Buyer name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        Lat, Long
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        Street Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        Place
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        Update
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                        Delete
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPartyList &&
                                    filteredPartyList.map((item) => {
                                        const dateTimeString = item?.CDate;
                                        const datePart = dateTimeString.split("T")[0];
                                        const [year, month, day] = datePart.split("-");
                                        const formattedDate = `${day}/${month}/${year}`;

                                        return (
                                            <tr className=" cursor-pointer" key={item.AccAutoID}>
                                                <td className="px-2 py-4 cursor-pointer">{item.Byr_nam}</td>
                                                <td className="px-2 py-4 cursor-pointer">{item.AccAddress}</td>
                                                <td className="px-2 py-4 ">{formattedDate}</td>
                                                <td className="px-2 py-4 ">{item.LocLatLong}</td>
                                                <td className="px-2 py-4 ">{item.LocPlace}</td>
                                                <td className="px-2 py-4 w-fit">{item.LocationString}</td>
                                                <td className="px-2 py-4 ">
                                                    <button
                                                        className={`block ${
                                                            item?.Apryn
                                                                ? "w-fit px-3 bg-primary rounded-lg p-1"
                                                                : "w-fit px-3 bg-red-400 rounded-lg p-1"
                                                        }`}
                                                    >
                                                        <strong>{item?.Apryn ? "Approved" : "Not Approved"}</strong>
                                                    </button>
                                                </td>
                                                <td className="px-2 py-4 ">
                                                    {item?.Apryn ? (
                                                        <></>
                                                    ) : (
                                                        <>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleDeleteLocationUpdate(item, true)}
                                                                    className={`block w-fit px-1 rounded-lg p-1`}
                                                                >
                                                                    <Image
                                                                        height={500}
                                                                        width={500}
                                                                        className="size-10 block"
                                                                        src={approve}
                                                                        alt="location update"
                                                                    />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteLocationUpdate(item, false)}
                                                                    className={`block w-fit px-1 rounded-lg p-1`}
                                                                >
                                                                    <Image
                                                                        height={500}
                                                                        width={500}
                                                                        className="size-10 block"
                                                                        src={reject}
                                                                        alt="location update"
                                                                    />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </td>

                                                <td className="px-2 py-4 ">
                                                    <button
                                                        onClick={() => handleDeleteLocationUpdate(item, "delete")}
                                                        className={`block w-fit px-3 rounded-lg p-1`}
                                                    >
                                                        <Image
                                                            height={500}
                                                            width={500}
                                                            className="size-10 block"
                                                            src={deleteLoc}
                                                            alt="location update"
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="fixed  inset-0 z-50 mt-4  customHeightModalNew opacity-1 flex items-center justify-center">
                    <div className="bg-gray-100  customScrolling relative bottom-3 -mt-5 customHeightModal shadow-md shadow-gray-400 p-8 rounded-lg ">
                        <div className="w-fit rounded-md bg-blue-500 mx-auto text-white font-semibold text-xl text-center border-b-4 border-slate-100 px-3 py-4">
                            Party Details
                        </div>
                        <button
                            className="bg-red-500  absolute top-0 right-3  rounded-md mt-4 px-4 py-2  text-white"
                            onClick={handleCloseModal}
                        >
                            <IoMdClose />
                        </button>

                        <PartyListDetailModal
                            buyerName={selectedBuyer.Byr_nam}
                            gst={selectedBuyer.VATNO}
                            buyerNameAdd={selectedBuyer.AccAddress}
                            accAutoID={selectedBuyer.AccAutoID}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default LocationList;
