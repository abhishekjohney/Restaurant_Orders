"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/Spinner";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import { useRouter, useSearchParams } from "next/navigation";
import { IoArrowBackSharp } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import Image from "next/image";
import { useModal } from "@/Provider";
import EditNewPayment from "@/components/common/newPayment";
import CustomModal from "@/components/Modal";
import paymentIcon from "../../../public/images/svg/payment.svg";
import Swal from "sweetalert2";
import CustomFunctionalModal from "@/components/FunctionalModal";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

type ImageRecord = {
  ActionType: number;
  ImageLocation: string | null;
  ImageName: string;
  ImageType: string;
  ImgEntID: number;
  ImgGroup: string;
  ImgRemarks: string;
  SVRSTKID: number | string;
};

const AddItem = ({ params }: { params: { orderid: string } }) => {
  const listAPI = new ListApi();
  const updateAPI = new UpdateAPI();
  const { setClose, isOpen, setOpen } = useModal();
  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();

  const cocnut = "/images/noImg.jpg";
  const cocnut1 = "/images/coconut1.jpg";
  const cocnut2 = "/images/coconut2.jpg";

  const [year, setYear] = useState("");
  const [route, setRoute] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [userCode, setUserCode] = useState("");
  const [userId, setUserId] = useState("");
  const [orderitemList, setOrderItemList] = useState<FinalStockItemType[]>([]);

  const [filteredStockList, setFilteredStockList] = useState<StockItemType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [stockList, setStockList] = useState<StockItemType[]>([]);
  const [showImgModal, setShowImgModal] = useState(false);
  const [photoArr, setPhotoArr] = useState<ImageRecord[]>([]);
  const [formData, setFormData] = useState({
    orderNo: "",
    orderDate: "",
    PartyName: "",
    PartyId: "",
    TotAmt: "",
    orderId: "",
    AccPartyID: "",
  });

  interface StockItemType {
    ClrGroup: string | null;
    Department: string;
    DisplayGrp: string;
    FinalStock: string;
    GENNAME: string;
    GSTITMCD: number;
    IColor: string | null;
    ISize: string;
    Icompany: string;
    ImageFile: string;
    ImageFiles: string;
    MRP: string;
    Material: string;
    PLUCODE: string;
    PPrice: string;
    PRERSUPL: string;
    ProductGroup: string;
    STKCGSTRate: number;
    STKGSTRate: number;
    STKHSNCode: number;
    STKIGSTRate: number;
    STKSGSTRate: number;
    SVRSTKID: string;
    SalePrice: string;
    TYPE: string;
    UNITS: string;
    UNITS1: string;
    WSPrice: string;
    itm_CD: string;
    itm_NAM: string;
    subgrp: string;
  }

  interface FinalStockItemType {
    FinalStock: string;
    MRP: string;
    OrderAmount: string;
    OrderID: string;
    OrderQty: string;
    OrderRate: string;
    OrderRemarks: string;
    OrderTransID: string;
    SVRSTKID: string;
    SalePrice: string;
    SlNo: string;
    WSPrice: string;
    itm_CD: string;
    itm_Nam: string;
  }

  useEffect(() => {
    if (params.orderid) {
      const decodedOrderId = decodeURIComponent(atob(decodeURIComponent(params.orderid)));

      const decodedInfoArray = decodedOrderId.split("--");

      setFormData({
        ...formData,
        orderNo: decodedInfoArray[0],
        orderDate: decodedInfoArray[1],
        PartyName: decodedInfoArray[2],
        PartyId: decodedInfoArray[5],
        TotAmt: decodedInfoArray[3],
        orderId: decodedInfoArray[4],
        AccPartyID: decodedInfoArray[6],
      });
    }
  }, [params.orderid]);

  const fetchData = async () => {
    setLoading(true);
    const storedUserYear = localStorage.getItem("UserYear") ?? "4";
    const parts = storedUserYear.split("_");
    const year = parts[1];

    try {
      setLoading(true);
      if (formData?.orderId) {
        setLoading(true);
        let userName = session.data?.user?.name || "";
        const response = await listAPI.getorderitemlist(year, formData.orderId, userName);
        if (response) {
          setOrderItemList(response);
          const totalOrderAmount = response.reduce(
            (accumulator: number, item: { OrderAmount: string }) => accumulator + parseFloat(item.OrderAmount),
            0
          );

          setFormData((prevFormData) => ({
            ...prevFormData,
            TotAmt: totalOrderAmount.toFixed(2),
          }));
          setLoading(false);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (formData.orderId && session.data?.user.name) {
      fetchData();
    }

    if (typeof window !== "undefined" && window.localStorage) {
      const userDetails = localStorage.getItem("UserYear");
      if (userDetails) {
        const parts = userDetails.split("_");
        if (parts.length >= 4) {
          setYear(parts[1]);
          setRoute(parts[3]);
          setVehicleNumber(parts[2]);
          setUserCode(parts[0]);
        }
      }
    }

    if (session?.data?.user?.id) {
      setUserId(session?.data?.user?.id);
    }
  }, [formData.orderId, session.data?.user.name]);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await listAPI.GetStockItemListJason();
        const action = response[0]?.ActionType;
        if (action > 0) {
          const JSONData1 = JSON.parse(response[0]?.JSONData1);
          setStockList(JSONData1);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchStockData();
  }, []);

  const handleAddNewItem = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    const filteredList = stockList?.filter((item) => item?.itm_NAM.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredStockList(filteredList);
  }, [searchQuery, stockList]);

  const handleSearch = () => {
    setFilteredStockList(stockList?.filter((item) => item?.itm_NAM.toLowerCase().includes(searchQuery.toLowerCase())));
  };

  const handleOrder = (selectedItem: StockItemType) => {
    const combinedInfo = `${selectedItem.SVRSTKID}--${formData?.orderId}--${formData?.PartyId}--${formData?.AccPartyID}`;
    setLoading(true);
    const base64Encoded = btoa(combinedInfo);

    router.push(`/saveorder/${base64Encoded}`);
    // // Close the modal after selecting an item
    setShowModal(false);
  };

  const handleEdit = (selectedItem: FinalStockItemType) => {
    setLoading(true);
    const combinedInfo = `${selectedItem.SVRSTKID}--${formData?.orderId}--${formData?.PartyId}--${formData?.AccPartyID}--${selectedItem?.OrderQty}--${selectedItem?.OrderTransID}`;
    const base64Encoded = btoa(combinedInfo);
    router.push(`/saveorder/${base64Encoded}`);
    // // Close the modal after selecting an item
    setShowModal(false);
  };

  const handleDelete = async (selectedItem: FinalStockItemType) => {
    const storedUserYear = localStorage.getItem("UserYear") ?? "2023";
    const parts = storedUserYear.split("_");
    const year = parts[1];

    Swal.fire({
      title: "Do you want to delete?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await updateAPI.saveorderitem(
            selectedItem?.OrderID,
            selectedItem?.SVRSTKID,
            selectedItem?.OrderQty,
            selectedItem?.SalePrice,
            selectedItem?.OrderRemarks,
            year,
            `-${selectedItem?.OrderTransID}`
          );

          if (response) {
            console.log("RESPONSE", response);
            toast.success("Item Deleted Successfully");
            fetchData();
            router.refresh();
          }
        } catch (error) {
          console.error(error);
        }
      } else if (result.isDenied) {
        toast.warn("Changes are not saved");
      }
    });
  };

  const handlePayment = () => {
    setOpen();
  };

  const handleProductImage = async (data: StockItemType) => {
    try {
      const response = await listAPI.GetStockImagesList(data.SVRSTKID);
      setLoading(true);
      const action = response[0]?.ActionType;
      if (action > 0) {
        const JSONData1 = JSON.parse(response[0]?.JSONData1);
        if (JSONData1?.length > 0) {
          setPhotoArr(JSONData1);
          setShowModal(false);
          setShowImgModal(true);
        } else {
          setPhotoArr([]);
          toast.warn("No Images Found");
        }
      } else {
        const err = response[0]?.ErrorMessage;
        toast.error(err);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductImgClose = () => {
    setShowImgModal(false);
    setShowModal(true);
    setPhotoArr([]);
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <>
          {isOpen && (
            <CustomModal
              children={<EditNewPayment userCode={userCode} userId={userId} partyId={formData?.PartyId} />}
              title="New Payment"
            ></CustomModal>
          )}
          <div className="flex min-h-screen">
            {showImgModal && (
              <div
                id="default-modal"
                tabIndex={-1}
                aria-hidden="true"
                className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-[100000] justify-center items-center w-full md:inset-0"
              >
                <div className="relative p-4 w-full h-screen flex justify-center items-center max-w-screen max-h-screen">
                  <div className="absolute inset-0 bg-black opacity-35 w-full h-full"></div>
                  <div className="relative bg-white z-[100000] w-full md:w-fit md:max-w-[95%] rounded-lg shadow-xl">
                    <div className="flex items-center w-full p-1 border-b rounded-t dark:border-gray-600">
                      <h3 className="text-xl w-full font-semibold text-center mx-auto text-gray-900">title</h3>
                      <button
                        type="button"
                        onClick={() => handleProductImgClose()}
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
                    <div className="max-h-[calc(100vh-4rem)] overflow-y-auto md:p-2 space-y-4">
                      <Swiper loop={true} navigation={true} modules={[Navigation]} className="mySwiper mx-auto max-w-96">
                        {photoArr.length > 0 &&
                          photoArr?.map((item: ImageRecord, index: number) => {
                            let url = item.ImageLocation
                              ? item.ImageLocation
                              : `${process.env.NEXT_PUBLIC_WEBSERVICE_URL_REACT_IMAGE_URL}/${item.ImageName}`;
                            return (
                              <React.Fragment key={index}>
                                <SwiperSlide className="relative w-auto md:min-w-96">
                                  <img src={url} className="w-fit max-w-96 h-full my-auto max-h-96 mx-auto" alt="img" />
                                </SwiperSlide>
                              </React.Fragment>
                            );
                          })}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="w-full customHeightStock lg:mt-12 mt-20 overflow-auto absolute right-0  p-4 md:p-6 lg:p-8 xl:p-10">
              <div className="flex justify-start w-fit flex-row bg-blue-500 text-white font-medium text-xs capitalize shadow-lg rounded-md p-2">
                <button onClick={() => router.back()} className="flex flex-row gap-2">
                  <IoArrowBackSharp /> back
                </button>
              </div>
              <div className=" bg-slate-100  shadow-md flex items-center justify-center">
                <div className="w-full p-4">
                  <div className="flex items-center my-2 justify-between">
                    <h3 className="text-3xl md:text-xl font-semibold mb-6">Order List</h3>

                    <button onClick={handleAddNewItem} className=" font-bold py-2 px-4 rounded btn btn-primary" type="button">
                      Add New
                    </button>
                  </div>

                  <div className="bg-white shadow-md flex flex-row  relative justify-between items-start">
                    <div className="flex md:flex-row flex-col">
                      <h3 className="px-2 py-3">
                        Order No: <span className="text-error font-bold">{formData.orderNo}</span>
                      </h3>
                      <h3 className="px-2 py-3">
                        Date: <span className=" text-error font-bold">{formData.orderDate}</span>
                      </h3>
                      <h3 className="px-2 py-3">
                        Party Name: <span className=" text-error font-bold">{formData.PartyName}</span>
                      </h3>
                      <h3 className="px-2 py-3">
                        Amount: {formData.TotAmt && <span className=" text-error font-bold">{formData.TotAmt}</span>}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        handlePayment();
                      }}
                      className="flex p-1 absolute justify-between gap-3 h-fit md:h-full right-0 flex-row items-center bottom-0"
                    >
                      <h3 className="whitespace-nowrap font-semibold">Payment:</h3>
                      <Image height={100} width={100} className="size-10 rounded-md shadow-xl" src={paymentIcon} alt="payment icon" />
                    </button>
                  </div>

                  <div className="grid md:hidden mt-6 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 max-h-[40rem] overflow-y-auto">
                    {/* Card representation for smaller screens */}
                    {orderitemList.map((item: FinalStockItemType) => (
                      <div
                        key={item.itm_CD}
                        className=" bg-primary shadow-md rounded-lg overflow-hidden"
                        style={{
                          boxShadow: "5px 5px 15px 10px rgba(173, 216, 230, 0.9)",
                        }}
                      >
                        <div className="p-4">
                          <h4 className="text-lg font-semibold mb-2">{item.itm_Nam}</h4>
                          <p className="text-gray-700 mb-2">Quantity: {item.OrderQty}</p>
                          <p className="text-gray-700 mb-2">Rate: {item.OrderRate}</p>
                          <p className="text-gray-700 mb-2">Amount: {item.OrderAmount}</p>
                          <p className="text-gray-700 mb-2 flex justify-start items-center">
                            Edit:
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-sm ms-3 px-3 py-2 bg-blue-400 shadow-md rounded-lg text-gray-900"
                            >
                              <FaRegEdit size="25" />
                            </button>
                          </p>
                          <p className="text-gray-700 mb-2 flex justify-start items-center">
                            <button
                              onClick={() => handleDelete(item)}
                              className="text-sm ms-3 px-3 py-2 bg-blue-400 shadow-md rounded-lg text-gray-900"
                            >
                              Delete
                            </button>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white hidden md:block shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full w-full divide-y table divide-gray-200">
                      <thead className="bg-primary">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                            Item Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Edit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orderitemList &&
                          orderitemList.map((item) => (
                            <tr key={item.itm_CD}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.itm_Nam}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.OrderQty}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.OrderRate}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.OrderAmount}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="text-sm px-3 py-1 bg-blue-400 shadow-md rounded-lg text-gray-900"
                                >
                                  <FaRegEdit size="27" />
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="text-sm px-3 py-2 bg-blue-400 shadow-md rounded-lg text-gray-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {showModal && (
            <CustomFunctionalModal title="Select Item" close={setShowModal}>
              <div className="p-2 space-y-4">
                <div className=" h-auto shadow-slate-400 rounded-lg text-center">
                  <div className="mb-6 flex items-center">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-4 py-2 rounded input-info"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button onClick={handleSearch} className=" btn btn-info px-4 py-2 ml-2 rounded">
                      Search
                    </button>
                  </div>
                  <div className="overflow-auto max-h-96 p-2 h-auto mb-3">
                    <div className="grid grid-cols-1  gap-2">
                      {filteredStockList &&
                        filteredStockList.map((item: StockItemType, i) => {
                          let img = item.ImageFiles ? item.ImageFiles.split("|")[1] : "";
                          let url = img ? `${process.env.NEXT_PUBLIC_WEBSERVICE_URL_REACT_IMAGE_URL}/${img}` : cocnut;
                          return (
                            <div
                              key={i}
                              className="bg-gray-100 shadow-md md:max-w-full w-full flex-wrap shadow-slate-200 justify-between  flex items-center p-2 rounded"
                            >
                              <div className="flex w-full justify-between gap-2 items-center">
                                <div className="sm:text-base text-sm md:text-lg font-semibold text-warning-content">{item.itm_NAM}</div>
                                <div className="gap-1 flex flex-col items-center">
                                  <img
                                    onClick={() => handleProductImage(item)}
                                    src={url}
                                    onError={(e) => {
                                      e.currentTarget.src = cocnut; // Replace with default image on error
                                    }}
                                    alt="product img"
                                    className="size-8 border border-black"
                                  />
                                  <button
                                    className="py-1 px-2 md:px-4 md:py-2 md:text-base text-sm rounded-md bg-red-500 text-black font-semibold"
                                    onClick={() => handleOrder(item)}
                                  >
                                    select
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <div className="flex justify-center pb-4">
                    <button className="px-4 py-2 btn btn-warning rounded" onClick={() => setShowModal(!showModal)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </CustomFunctionalModal>
          )}
        </>
      )}
    </>
  );
};

export default AddItem;
