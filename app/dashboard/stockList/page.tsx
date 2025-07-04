"use client";

import { CanvasPreview } from "@/app/profile/_components/canvasPreview";
import { useDebounceEffect } from "@/app/profile/_components/useDebouceEffect";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import BackButton from "@/components/BackButton";
import CustomFunctionalModal from "@/components/FunctionalModal";
import { Spinner } from "@/components/Spinner";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { toast } from "react-toastify";
import Webcam from "react-webcam";
import Swal from "sweetalert2";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

type ImageRecord = {
  ActionType: number; // Numeric action identifier
  ImageLocation: string | null; // Nullable string for the image location
  ImageName: string; // Name of the image file (e.g., "1000_3_Main.jpg")
  ImageType: string; // Type of image (e.g., "Item")
  ImgEntID: number; // Unique identifier for the image entity
  ImgGroup: string; // Group or category of the image (e.g., "Main")
  ImgRemarks: string; // Remarks or description of the image
  SVRSTKID: number | string; // Stock ID or related identifier
};

const StockList = () => {
  const listAPI = new ListApi();
  const updateAPI = new UpdateAPI();
  const cocnut = "/images/noImg.jpg";

  const [stockList, setStockList] = useState<StockItemType[]>([]);
  const [filteredStockList, setFilteredStockList] = useState<StockItemType[]>([]);
  const [selected, setSelected] = useState<StockItemType>();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [modal, setModal] = useState(false);

  const [imgSrc, setImgSrc] = useState<string>("");
  const [videoWidth, setVideoWidth] = useState(480);
  const previewCanvasRef: any = useRef(null);
  const imgRef: any = useRef(null);
  const [crop, setCrop] = useState<any>();
  const [completedCrop, setCompletedCrop] = useState<any>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(16 / 16);
  const [currentPhoto, setCurrentPhoto] = useState<any>("");
  const [saveCrop, setSaveCrop] = useState(false);
  const [takenPhoto, setTakenPhoto] = useState(false);
  const [photoArr, setPhotoArr] = useState<ImageRecord[]>([]);
  const [showImgModal, setShowImgModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
      setLoading(false);
    };

    fetchData();
  }, []);

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

  useEffect(() => {
    const List = stockList?.filter((item) => item.itm_NAM.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredStockList(List);
  }, [searchTerm, stockList]);

  const handleUpdateImgBtn = async (data: StockItemType) => {
    // setSelectedImgPro(data);
    setSelected(data);
    try {
      const response = await listAPI.GetStockImagesList(data.SVRSTKID);
      setLoading(true);
      const action = response[0]?.ActionType;
      if (action > 0) {
        const JSONData1 = JSON.parse(response[0]?.JSONData1);
        console.log(JSONData1, "images");
        if (JSONData1.length > 0) {
          setPhotoArr(JSONData1);
        } else {
          setPhotoArr([]);
          toast.warn("No Images Found");
        }
        setModal(true);
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

  const webcamRef: any = useRef(null);

  useEffect(() => {
    const updateVideoWidth = () => {
      if (window.matchMedia("(max-width: 600px)").matches) {
        setVideoWidth(280);
      } else {
        setVideoWidth(480);
      }
    };
    updateVideoWidth();
    window.addEventListener("resize", updateVideoWidth);
    return () => {
      window.removeEventListener("resize", updateVideoWidth);
    };
  }, []);

  const videoConstraints = {
    width: videoWidth,
    facingMode: "user",
  };

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setTakenPhoto(true);
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const onUserMedia = (e: any) => {
    // console.log(e, "user media");
  };
  // console.log(currentPhoto, "mm");
  function onSelectFile(e: any) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
      });
      reader.readAsDataURL(e.target.files[0]);
      setTakenPhoto(true);
    }
  }

  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
        // We use canvasPreview as it's much faster than imgPreview.
        CanvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate);
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  const handleSaveAndCrop = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    const getBase64Image = () => {
      if (!imgSrc) {
        throw new Error("Crop canvas does not exist");
      }

      let da: ImageRecord = {
        ActionType: 1,
        ImageLocation: imgSrc,
        ImageName: "",
        ImageType: "Item",
        ImgEntID: photoArr.length + 1,
        ImgGroup: "Main",
        ImgRemarks: "Primary image for the item",
        SVRSTKID: selected!.SVRSTKID,
      };

      const base64Image = imgSrc;
      da.ImageLocation = base64Image;
      setPhotoArr([...photoArr, da]);
      setTakenPhoto(false);
      return base64Image;
    };
    setImgSrc("");

    setTakenPhoto(false);
    setLoading(true);
    const bas64Img = getBase64Image();
    setCurrentPhoto(bas64Img);
    setCrop(null);
    setCompletedCrop(null);
    setScale(1);
    setAspect(16 / 16);
    previewCanvasRef.current = null;
    setSaveCrop(true);
    setLoading(false);
  };

  const handleRefresh = () => {
    setCurrentPhoto("");
    setTakenPhoto(false);
    setImgSrc("");
    setCrop(null);
    setCompletedCrop(null);
    setScale(1);
    setAspect(16 / 16);
    previewCanvasRef.current = null;
    setSaveCrop(false);
  };

  const handleDeletePhoto = (id: ImageRecord) => {
    setModal(false);
    Swal.fire({
      title: "Do you want to delete this Photo?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const svrstkid = selected?.SVRSTKID || 0;
          const response = await updateAPI.UpdateStockImages(svrstkid, id.ImageName, 3, id.ImgEntID);
          console.log(response, "reponse");
          const action = response[0]?.ActionType;
          if (action > 0) {
            if (selected) handleUpdateImgBtn(selected);
          } else {
            const err = response[0]?.ErrorMessage;
            toast.warn(err);
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
          setModal(true);
        }
      } else if (result.isDenied) {
        toast.warn("Changes are not saved");
      }
    });
  };

  const handleUpdateImage = async () => {
    if (photoArr.length === 0) {
      setModal(false);
      return toast.warn("NO PHOTO FOUND");
    }

    if (!selected) {
      return toast.error("No stock item selected!");
    }

    setLoading(true);
    setModal(false);

    try {
      const cleanedImgArray = photoArr
        .flatMap((item) => (item?.ImageLocation ? item.ImageLocation : []))
        .map((data) => data.replace(/^data:image\/[^;]+;base64,/, ""));

      const updatePromises = cleanedImgArray.map(async (item) => {
        try {
          const useee = await updateAPI.UpdateStockImages(selected.SVRSTKID, item, 1, 0);
          const response = useee[0];
          const action = response?.ActionType;

          if (action > 0) {
            const JSONData1 = response?.JSONData1Remarks;
            // toast.success(JSONData1);
            return true;
          } else {
            const err = response?.ErrorMessage;
            toast.warn(`Error - ${err}`);
            return false;
          }
        } catch (error) {
          console.error("Error updating image:", error);
          throw error;
        }
      });

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);

      // Refresh UI based on results
      if (results.every((success) => success)) {
        setModal(false);
        setPhotoArr([]);
        handleRefresh();
        toast.success("Successfully added image");
        setSaveCrop(false);
        setTakenPhoto(false);
      } else {
        setModal(false);
        setTimeout(() => {
          setModal(true);
        }, 2000);
      }
    } catch (error) {
      console.error("Error in handleUpdateImage:", error);
      toast.error("An error occurred while updating images.");
    } finally {
      setLoading(false);
    }
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
    setPhotoArr([]);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {loading && <Spinner />}
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
      {modal && (
        <CustomFunctionalModal title="Update Product Image" close={setModal}>
          <div className="w-full">
            <div className="w-full border-2 p-1 border-black border-solid rounded h-fit">
              <div className="flex w-full md:flex-row flex-col">
                <div className="flex flex-col">
                  <div className="flex w-full justify-center items-start">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      onUserMedia={onUserMedia}
                    />
                  </div>
                  <div className="flex w-full my-2 gap-2 flex-wrap justify-start">
                    {saveCrop ? (
                      <button
                        onClick={() => {
                          setSaveCrop(false);
                          setTakenPhoto(false);
                        }}
                        className="bg-blue-500 rounded-md whitespace-nowrap w-fit px-3 py-2"
                      >
                        Re-take
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          capturePhoto();
                        }}
                        className="bg-blue-500 rounded-md whitespace-nowrap w-fit px-3 py-2"
                      >
                        Capture
                      </button>
                    )}

                    <button onClick={() => handleRefresh()} className="bg-blue-500 rounded-md w-fit px-3 py-2">
                      Refresh
                    </button>
                    <div className="w-fit flex gap-2 justify-start items-center">
                      <label htmlFor="rotate-input" className="w-fit align-middle flex items-center text-sm text-start font-semibold">
                        Upload Photo:
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/jpg"
                        className="shadow appearance-none border input-info rounded py-2 px-3  leading-tight w-full"
                        onChange={onSelectFile}
                      />
                    </div>
                  </div>
                </div>
                <div className=" w-full md:w-fit mx-2">
                  <Swiper loop={true} navigation={true} modules={[Navigation]} className="mySwiper mx-auto max-w-96">
                    {photoArr.length > 0 &&
                      photoArr?.map((item: ImageRecord, index: number) => {
                        let url = item.ImageLocation
                          ? item.ImageLocation
                          : `${process.env.NEXT_PUBLIC_WEBSERVICE_URL_REACT_IMAGE_URL}/${item.ImageName}`;
                        return (
                          <React.Fragment key={index}>
                            <SwiperSlide className="relative min-w-96">
                              <button
                                onClick={() => handleDeletePhoto(item)}
                                className="absolute top-2 right-2 m-1 rounded border border-solid border-black"
                                type="button"
                              >
                                <MdOutlineDelete color="red" size={25} />
                              </button>
                              <img src={url} className="w-fit max-w-96 h-full my-auto max-h-96 mx-auto" alt="img" />
                            </SwiperSlide>
                          </React.Fragment>
                        );
                      })}
                  </Swiper>
                  {photoArr.length > 0 && (
                    <button
                      type="button"
                      onClick={handleUpdateImage}
                      className="bg-blue-500 m-1 rounded-lg px-3 py-1.5 text-sm font-medium"
                    >
                      update Images
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-2 md:flex-row justify-start items-center md:items-end my-2 flex-col">
                {imgSrc && (
                  <button
                    className="bg-blue-500 rounded-md w-fit px-3 py-2 md:text-base text-sm whitespace-nowrap"
                    onClick={handleSaveAndCrop}
                  >
                    Save
                  </button>
                )}
              </div>
              <div className="flex w-full md:flex-row flex-col gap-2">
                {imgSrc && <img alt="Crop me" src={imgSrc} className="h-auto w-full" />}
              </div>
            </div>
          </div>
        </CustomFunctionalModal>
      )}
      <div className="w-full px-4 py-6 md:px-6 lg:mt-0 mt-20 lg:px-8 xl:px-10">
        <div className="flex md:flex-row  flex-col justify-between">
          <BackButton />
          <h3 className="md:text-3xl  text-xl font-semibold">Stock List Items</h3>

          <div className="md:mb-2">
            <input
              type="text"
              placeholder="Search by Item Name"
              className="w-full px-4 py-2 rounded-md input-info"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:hidden mt-6 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 max-h-[40rem] overflow-y-auto">
          {/* Card representation for smaller screens */}
          {filteredStockList?.map((item: StockItemType, index: number) => {
            let img = item.ImageFiles ? item.ImageFiles.split("|")[1] : "";
            let url = img ? `${process.env.NEXT_PUBLIC_WEBSERVICE_URL_REACT_IMAGE_URL}/${img}` : cocnut;
            console.log(img, "img-------", item.ImageFiles);
            console.log(url, "url");
            return (
              <div
                key={index}
                className="bg-blue-200 border border-blue-200 shadow-md rounded-lg overflow-hidden"
                style={{
                  boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)",
                }}
              >
                <div className="p-4">
                  <h4 className="text-lg text-warning-content font-semibold mb-2">{item.itm_NAM}</h4>
                  <div className="grid grid-cols-3">
                    <div className="col-span-2">
                      <p className=" text-warning-content mb-2">WSP: {item.WSPrice}</p>
                      <p className=" text-warning-content mb-2">SP: {item.SalePrice}</p>
                    </div>
                    <div className="col-span-1">
                      <button type="button" onClick={() => handleProductImage(item)}>
                        <img
                          src={url}
                          onError={(e) => {
                            e.currentTarget.src = cocnut;
                          }}
                          alt="product img"
                          className="size-12 border border-black me-3"
                        />
                      </button>
                    </div>
                  </div>
                  <p className="text-warning-content mb-2">MRP: {item.MRP}</p>
                  <div className="w-full flex justify-between">
                    <p className={`text-${item.FinalStock == "0" ? "error" : "success"} mb-2`}>Stock: {item.FinalStock}</p>
                    <button
                      onClick={() => handleUpdateImgBtn(item)}
                      type="button"
                      className="rounded-md text-black md:text-base text-sm bg-blue-400 px-2 py-1 md:px-4 md:py-2"
                    >
                      Update Image
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Table for larger screens */}
        <div className="hidden md:block bg-slate-500 shadow sm:rounded-lg overflow-auto mt-8 customHeightTable">
          <table className="min-w-full divide-y table divide-gray-200">
            <thead className="bg-primary sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Wholesale Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Sale Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">MRP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Update Image</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStockList?.map((item: StockItemType, index: number) => {
                let img = item.ImageFiles ? item.ImageFiles.split("|")[1] : "";
                let url = img ? `${process.env.NEXT_PUBLIC_WEBSERVICE_URL_REACT_IMAGE_URL}/${img}` : cocnut;
                return (
                  <tr key={index}>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900 flex justify-start items-center">
                        <button type="button" onClick={() => handleProductImage(item)}>
                          <img
                            src={url}
                            onError={(e) => {
                              e.currentTarget.src = cocnut;
                            }}
                            alt="product img"
                            className="size-12 border border-black me-3"
                          />
                        </button>
                        <p className="font-medium text-black">{item.itm_NAM}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.WSPrice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.SalePrice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.MRP}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.FinalStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleUpdateImgBtn(item)}
                        type="button"
                        className="rounded-md text-black md:text-base text-sm bg-blue-400 px-2 py-1 md:px-4 md:py-2"
                      >
                        Update
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
  );
};

export default StockList;
