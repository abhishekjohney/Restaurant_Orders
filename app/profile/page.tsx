"use client";
import BackButton from "@/components/BackButton";
import CustomModal from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import React, { useCallback, useEffect, useRef, useState } from "react";

import Webcam from "react-webcam";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop, convertToPixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useSession } from "next-auth/react";
import { useDebounceEffect } from "./_components/useDebouceEffect";
import { CanvasPreview } from "./_components/canvasPreview";
import CustomFunctionalModal from "@/components/FunctionalModal";
import { LoginApi } from "../utils/api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function centerAspectCrop(mediaWidth: any, mediaHeight: any, aspect: any) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

type Props = {};

const page = (props: Props) => {
  const session = useSession();
  const user: any = session?.data?.user;

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(true);

  const LoginAPI = new LoginApi();
  const profileImg = "/images/NoPhoto.jpg";

  const [imgSrc, setImgSrc] = useState<string>("");
  const [videoWidth, setVideoWidth] = useState(480);
  const previewCanvasRef: any = useRef(null);
  const imgRef: any = useRef(null);
  const hiddenAnchorRef: any = useRef(null);
  const blobUrlRef = useRef("");
  const [crop, setCrop] = useState<any>();
  const [completedCrop, setCompletedCrop] = useState<any>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(9 / 16);
  const [currentPhoto, setCurrentPhoto] = useState<any>("");
  const [saveCrop, setSaveCrop] = useState(false);
  const [modalPhoto, setModalPhoto] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [userName, setUserName] = useState<any>("");
  const [password, setPassword] = useState({
    old: "",
    new: "",
    verify: "",
  });
  const [submit, setSubmit] = useState(false);

  const webcamRef: any = useRef(null);

  // useEffect(() => {
  //   if (userDetails?.ImageFile !== "noPhoto.jpg") {
  //     let url = `${process.env.REACT_APP_ERP_LOGIN_USER_IMAGE_URL}${userDetails?.ImageFile}`;
  //     setCurrentPhoto(url);
  //   } else {
  //     let url = `${process.env.REACT_APP_ERP_STUDENT_IMAGE_URL}${userDetails?.ImageFile}`;
  //     setCurrentPhoto(url);
  //   }
  // }, [userDetails]);

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
    setImgSrc(imageSrc);
  }, [webcamRef]);

  useEffect(() => {
    if (session?.data?.user) {
      setUserName(session?.data?.user?.name);
    }
  }, [session?.data?.user]);

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
    }
  }

  function onImageLoad(e: any) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  async function onDownloadCropClick() {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error("Crop canvas does not exist");
    }

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(completedCrop.width * scaleX, completedCrop.height * scaleY);
    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      throw new Error("No 2d context");
    }

    ctx.drawImage(previewCanvas, 0, 0, previewCanvas.width, previewCanvas.height, 0, 0, offscreen.width, offscreen.height);
    // You might want { type: "image/jpeg", quality: <0 to 1> } to
    // reduce image size
    const blob = await offscreen.convertToBlob({
      type: "image/png",
    });

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = URL.createObjectURL(blob);

    if (hiddenAnchorRef.current) {
      hiddenAnchorRef.current.href = blobUrlRef.current;
      hiddenAnchorRef.current.click();
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

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(0);
    } else {
      setAspect(9 / 16);

      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerAspectCrop(width, height, 16 / 9);
        setCrop(newCrop);
        // Updates the preview
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    }
  }

  const handleSaveAndCrop = () => {
    const getBase64Image = () => {
      if (!previewCanvasRef.current) {
        throw new Error("Crop canvas does not exist");
      }

      const canvas = previewCanvasRef.current;
      const base64Image = canvas.toDataURL("image/png");
      return base64Image;
    };

    setModalPhoto(false);
    setLoading(true);
    const bas64Img = getBase64Image();
    setCurrentPhoto(bas64Img);
    setImgSrc("");
    setCrop(null);
    setCompletedCrop(null);
    setScale(1);
    setAspect(16 / 9);
    previewCanvasRef.current = null;
    setSaveCrop(true);
    setLoading(false);
  };

  const handleRefresh = () => {
    setCurrentPhoto("");
    setImgSrc("");
    setCrop(null);
    setCompletedCrop(null);
    setScale(1);
    setAspect(16 / 9);
    previewCanvasRef.current = null;
    setSaveCrop(false);
  };

  const handleProfileUpdate = () => {
    setModalPhoto(true);
  };

  const handlePasswordChange = () => {
    setModalPassword(true);
  };

  const handleChangePassword = async () => {
    if (!password?.new) return toast.warn("Password is required");
    if (!password?.new) return toast.warn("Password is required");
    if (!password?.verify) return toast.warn("Password is required");
    if (password?.new !== password?.verify) return toast.warn("Password is not match");
    setSubmit(true);
    setModalPassword(false);
    Swal.fire({
      title: "Are you sure?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await LoginAPI.ChangeERPProfilePassWord(user?.id, password?.old, password?.new);
          const succ = parseInt(response[0]?.ActionType);
          if (succ > 0) {
            toast.success(response[0]?.JSONData1Remarks);
            setPassword({ new: "", old: "", verify: "" });
            setModalPassword(false);
          } else {
            toast.warn(response[0]?.JSONData1Remarks);
            setPassword({ new: "", old: "", verify: "" });
          }
          setSubmit(false);
        } catch (error) {
          setSubmit(false);
          toast.error("Error");
        }
      } else if (result.isDenied) {
        setSubmit(false);
        toast.warn("Changes are not saved");
      }
    });
    // const response = await LoginAPI.ChangeERPProfilePassWord(user?.id, password?.old, password?.new);
    // const succ = parseInt(response[0]?.ActionType);
    // if (succ > 0) {
    //   toast.success(response[0]?.JSONData1Remarks);
    //   setPassword({ new: "", old: "", verify: "" });
    //   setModalPassword(false);
    // } else {
    //   toast.warn(response[0]?.JSONData1Remarks);
    //   setPassword({ new: "", old: "", verify: "" });
    // }
  };

  return (
    <div className="flex min-h-screen">
      {loading && <Spinner />}
      <div className="w-full mt-[75px] md:mt-20 lg:mt-0 overflow-auto absolute right-0  py-6 px-5 p-4 md:p-6 lg:p-8 xl:p-10">
        {modalPhoto && (
          <CustomFunctionalModal close={setModalPhoto} title={"Update Profile Photo"}>
            <div className="md:basis-[80%] w-full border-2 p-1 border-black border-solid rounded max-h-[500px] h-fit">
              <div className="flex w-full justify-center items-start">
                <Webcam
                  ref={webcamRef}
                  audio={true}
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

                <button onClick={() => setImgSrc("")} className="bg-blue-500 rounded-md w-fit px-3 py-2">
                  Refresh
                </button>
                <div className="w-full flex gap-2 justify-start items-center">
                  <label htmlFor="rotate-input" className="w-fit align-middle flex items-center text-sm text-start font-semibold">
                    Upload Photo:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="shadow appearance-none border input-info rounded py-2 px-3  leading-tight w-full"
                    onChange={onSelectFile}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-2 md:flex-row justify-start items-center md:items-end my-2 flex-col">
                <div className="flex gap-1 flex-col w-fit">
                  <label
                    htmlFor="scale-input"
                    className="w-full basis-[30%] align-middle flex items-center text-sm text-start font-semibold"
                  >
                    Scale:
                  </label>
                  <input
                    id="scale-input"
                    type="number"
                    className="max-w-60  shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                    step="0.1"
                    value={scale}
                    disabled={!imgSrc}
                    onChange={(e) => setScale(Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-1 flex-col w-fit">
                  <label
                    htmlFor="rotate-input"
                    className="w-full basis-[30%] align-middle flex items-center text-sm text-start font-semibold"
                  >
                    Rotate:
                  </label>
                  <input
                    id="rotate-input"
                    type="number"
                    className="max-w-60  shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                    value={rotate}
                    disabled={!imgSrc}
                    onChange={(e) => setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))}
                  />
                </div>
                <div className="flex w-fit gap-1">
                  <div className="flex h-fit items-end my-auto">
                    <button
                      className="bg-blue-500 rounded-md md:text-base text-sm w-fit px-3 py-2 whitespace-nowrap"
                      onClick={handleToggleAspectClick}
                    >
                      Toggle aspect {aspect ? "off" : "on"}
                    </button>
                  </div>
                  <div className="flex h-fit items-end my-auto">
                    {imgSrc ? (
                      <button
                        className="bg-blue-500 rounded-md w-fit px-3 py-2 md:text-base text-sm whitespace-nowrap"
                        onClick={handleSaveAndCrop}
                      >
                        Save
                      </button>
                    ) : (
                      <button className="bg-blue-500 rounded-md w-fit px-3 py-2 whitespace-nowrap md:text-base text-sm" disabled>
                        Save
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex w-full md:flex-row flex-col gap-2">
                {!!imgSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    // minWidth={400}
                    maxWidth={500}
                    minHeight={100}
                    // circularCrop
                  >
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={imgSrc}
                      className="h-[400px] max-w-96 w-full"
                      style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                )}
                {!!completedCrop && (
                  <>
                    <div>
                      <canvas
                        ref={previewCanvasRef}
                        style={{
                          border: "1px solid black",
                          objectFit: "contain",
                          width: completedCrop.width,
                          height: completedCrop.height,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </CustomFunctionalModal>
        )}
        {modalPassword && (
          <CustomFunctionalModal title={"Change Password"} close={setModalPassword}>
            <div className=" p-3 formBackground flex flex-col gap-2">
              <div className="min-w-96 w-full flex gap-2 flex-col">
                <div className="flex gap-2 w-full">
                  <label
                    htmlFor=""
                    className="w-full basis-[50%] whitespace-nowrap align-middle flex items-center text-sm text-start font-semibold"
                  >
                    Old Password
                  </label>
                  <input
                    value={password?.old}
                    onChange={(e) => setPassword({ ...password, old: e.target.value })}
                    type="text"
                    className=" shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight "
                  />
                </div>
                <div className="flex gap-2 w-full">
                  <label
                    htmlFor=""
                    className="w-full basis-[50%] whitespace-nowrap align-middle flex items-center text-sm text-start font-semibold"
                  >
                    New Password
                  </label>
                  <input
                    value={password?.new}
                    onChange={(e) => setPassword({ ...password, new: e.target.value })}
                    type="text"
                    className=" shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight "
                  />
                </div>
                <div className="flex gap-2 w-full">
                  <label
                    htmlFor=""
                    className="w-full basis-[50%] whitespace-nowrap align-middle flex items-center text-sm text-start font-semibold"
                  >
                    Confirm Password
                  </label>
                  <input
                    value={password?.verify}
                    onChange={(e) => setPassword({ ...password, verify: e.target.value })}
                    type="text"
                    className=" shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight "
                  />
                </div>
              </div>
              {submit ? (
                <button type="button" disabled className="bg-blue-500 rounded-md w-full px-3 py-2">
                  Submit
                </button>
              ) : (
                <button onClick={handleChangePassword} type="submit" className="bg-blue-500 rounded-md w-full px-3 py-2">
                  Submit
                </button>
              )}
            </div>
          </CustomFunctionalModal>
        )}
        {/* Form */}
        <div className="md:block hidden mb-2">
          <BackButton />
        </div>
        <div className="md:hidden shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
          <div className="flex  w-full justify-between items-center">
            <BackButton />
            <h3 className=" text-xl font-semibold">Profile</h3>
          </div>
        </div>
        <div className="bg-white shadow-md rounded px-3 md:px-8 py-2 md:py-7 mb-4">
          <div className=" justify-between items-center">
            <div className="flex my-2 mb-4 sm:flex-row flex-col justify-between item-center w-full">
              <h3 className="text-2xl md:block hidden font-semibold">Profile</h3>
            </div>
            <div className="flex flex-col py-2 formBackground w-full px-3 gap-2">
              <div className="flex w-full md:flex-row flex-col gap-2">
                <div className="w-full flex flex-col gap-2 max-h-[500px] h-fit">
                  <div className="w-full rounded h-full border-2 border-black border-solid">
                    <div className="flex gap-2 md:flex-row flex-col-reverse p-1 w-full">
                      <div className="w-full flex flex-col gap-2">
                        <div className="flex gap-2 w-full">
                          <label htmlFor="" className="w-full basis-[30%] align-middle flex items-center text-sm text-start font-semibold">
                            User Name
                          </label>
                          <input
                            type="text"
                            value={userName}
                            className=" shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight "
                          />
                        </div>
                        <div className="grid md:basis-[60%] grid-cols-2 h-fit md:grid-cols-4 justify-start items-end w-full gap-2">
                          <button onClick={handleProfileUpdate} type="button" className="bg-blue-500 rounded-md w-full h-fit px-3 py-2">
                            Update Profile
                          </button>
                          <button onClick={handlePasswordChange} type="button" className="bg-blue-500 rounded-md w-full h-fit px-3 py-2">
                            Change Password
                          </button>
                          <button className="md:block hidden"></button>
                          <button className="md:block hidden"></button>
                        </div>
                      </div>
                      <div className="flex flex-col justify-evenly gap-2 px-2 rounded">
                        <img alt="uploaded pic" className="size-40 mx-auto" src={currentPhoto ? currentPhoto : profileImg} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
