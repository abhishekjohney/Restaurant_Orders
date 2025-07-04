import { useModal } from "@/Provider";
import { ListApi } from "@/app/utils/api";
import { useState } from "react";
import { RiLoader2Fill } from "react-icons/ri";
import { toast } from "react-toastify";

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
  LocAprYN: boolean;
  place: string;
  edit: boolean;
}

type Props = {
  locationData: LocationData | Partial<LocationData>;
};

const LocationUpdateForm = (props: Props) => {
  const listAPI = new ListApi();
  const { setClose } = useModal();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmission = async (e: any) => {
    e.preventDefault();
    setSubmitted(true);
    await listAPI.getUpdatePartyGPSLocation(
      props.locationData.PartyId || "",
      props.locationData.Address || "",
      props.locationData.place || "",
      `${props.locationData.latitude},${props.locationData.longitude}`
    );
    toast.success("successfully updated");
    setSubmitted(false);
    setClose();
  };

  return (
    <div className="flex max-h-[87vh] h-full overflow-auto w-full">
      <form className="bg-white shadow-md rounded px-4 md:px-8 py-4 md:py-7 mb-4">
        <div className="flex flex-col justify-between items-center">
          <div className="flex my-2 sm:flex-row flex-col justify-between item-center w-full">
            <div className="flex items-center flex-wrap justify-between gap-2">
              <p className="font-semibold">
                Party Name:
                <strong> {props?.locationData?.PartyName}</strong>
              </p>
              <p className="font-semibold">
                Address:
                <strong> {props?.locationData?.PartyAddress}</strong>
              </p>
            </div>
          </div>
          {props?.locationData?.existing ? (
            <>
              <div>
                <div className="flex">
                  <h2 className="bg-primary w-fit rounded-sm shadow-lg px-2">
                    <strong>Existing Location Info</strong>
                  </h2>
                  (not approved)
                </div>
                <div className="flex my-2 mb-4 sm:flex-row flex-col justify-between item-center w-full">
                  <div className="flex items-start flex-wrap sm:flex-row flex-col justify-start gap-2">
                    <p className="font-semibold">
                      Lat & Long
                      <strong> {props?.locationData?.existingLatLong}</strong>
                    </p>
                    <p className="font-semibold">
                      Location:
                      <strong> {props?.locationData?.existingAddress}</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="bg-primary w-fit rounded-sm shadow-lg px-2">
                  <strong>New Locationd Info</strong>
                </h2>
                <div className="flex my-2 mb-4 sm:flex-row flex-col justify-between item-center w-full">
                  <div className="flex items-start flex-wrap sm:flex-row flex-col justify-start gap-2">
                    <p className="font-semibold">
                      Latitude:
                      <strong> {props?.locationData?.latitude}</strong>
                    </p>
                    <p className="font-semibold">
                      Longitude:
                      <strong> {props?.locationData?.longitude}</strong>
                    </p>
                    <p className="font-semibold">
                      Location:
                      <strong> {props?.locationData?.Address}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex my-2 mb-4 sm:flex-row flex-col justify-between item-center w-full">
                <div className="flex items-start flex-wrap sm:flex-row flex-col justify-start gap-2">
                  <p className="font-semibold">
                    Latitude:
                    <strong> {props?.locationData?.latitude}</strong>
                  </p>
                  <p className="font-semibold">
                    Longitude:
                    <strong> {props?.locationData?.longitude}</strong>
                  </p>
                  <p className="font-semibold">
                    Location:
                    <strong> {props?.locationData?.Address}</strong>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center w-full justify-between">
          {props?.locationData?.existing ? (
            <>
              {submitted ? (
                <>
                  <div className="lg:flex  justify-center items-center">
                    <button className=" w-full lg:w-fit  font-bold py-2 px-4 mb-2 lg:mb-0 rounded mr-4 btn btn-success">
                      <span>
                        <RiLoader2Fill className="animate-spin" color="black" size="27" />
                      </span>
                      Loading
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="lg:flex  justify-center items-center">
                    <button
                      className=" w-full lg:w-fit  font-bold py-2 px-4 mb-2 lg:mb-0 rounded mr-4 btn btn-success"
                      onClick={handleSubmission}
                      type="submit"
                    >
                      Update
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {submitted ? (
                <>
                  <div className="lg:flex  justify-center items-center">
                    <button className=" w-full lg:w-fit  font-bold py-2 px-4 mb-2 lg:mb-0 rounded mr-4 btn btn-success">
                      <span>
                        <RiLoader2Fill className="animate-spin" color="black" size="27" />
                      </span>
                      Loading
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="lg:flex  justify-center items-center">
                    <button
                      className=" w-full lg:w-fit  font-bold py-2 px-4 mb-2 lg:mb-0 rounded mr-4 btn btn-success"
                      onClick={handleSubmission}
                      type="submit"
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default LocationUpdateForm;
