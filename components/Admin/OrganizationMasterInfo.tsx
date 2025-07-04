// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

function OrganizationMasterInfo() {
  const updateAPI = new UpdateAPI();
  const listAPI = new ListApi();
  const [OrgMasterList, setOrgMasterList] = useState([]);
  const [formData, setFormData] = useState<OrgMstrType>(null);

  const router = useRouter();
  // console.log("Router Object:", router);

  const session = useSession();

  const searchParams = useSearchParams();

  interface OrgMstrType {
    ACAEND: number | null;
    ACASTART: number | null;
    ATT: number | null;
    AccGroupType: number | null;
    ActionType: number | null;
    BANKACCNO: string | null;
    BULKSMSHISTORY: boolean;
    BarCodeLabelType: number | null;
    BarcodePageType: number | null;
    CHKSMSNO: boolean;
    CheckOutTime: null;
    DRWOPNCOM: string | null;
    DefMailTo: null;
    FAX: string | null;
    LVSTARTMODE: number | null;
    LinkSalesToAddressBook: boolean;
    MOPayBillingNo: boolean;
    MailCredentialsID: null;
    MailCredentialsPass: null;
    MailFrom: null;
    MailHost: null;
    MailPort: number | null;
    ORGADDRESS: String | null;
    ORGAUTOID: number | null;
    ORGCITY: string | null;
    ORGCODE: number | null;
    ORGDISPLAYNAME: string | null;
    ORGDISTRICT: string | null;
    ORGNAME: string | null;
    ORGNATION: string | null;
    ORGPLACE: string | null;
    ORGREGNO: string | null;
    ORGSTATE: string | null;
    ORGSTREET: string | null;
    OthItmCode: number | null;
    PANNO: null;
    PARTYRATESAVE: number | null;
    PDPORT: number | null;
    PH: string | null;
    PLUCODEPRX: string | null;
    PLUCODETYPE: number | null;
    POSTSMS: boolean;
    PRTPORT: string | null;
    PUSHOWBTCH: boolean;
    PUSHOWDIS: boolean;
    PUSHOWFLAG: boolean;
    PUSHOWFREE: boolean;
    PUSHOWLOOSE: boolean;
    PUSHOWMFRC: boolean;
    PUSHOWMRP: boolean;
    PUSHOWREM: boolean;
    PUSHOWTP: boolean;
    PUSHOWVAT: boolean;
    PuNavType: number | null;
    RateNCostingType: number | null;
    SASHOWBTCH: boolean;
    SASHOWDIS: boolean;
    SASHOWFLAG: boolean;
    SASHOWFREE: boolean;
    SASHOWLOOSE: boolean;
    SASHOWMFRC: boolean;
    SASHOWMRP: boolean;
    SASHOWREM: boolean;
    SASHOWTP: boolean;
    SASHOWVAT: boolean;
    SMSDomainName: string | null;
    SMSFooter: string | null;
    SMSHeader: string | null;
    SMSPassWord: string | null;
    SMSProvider: number | null;
    SMSRATE: number | null;
    SMSSID: string | null;
    SMSUserName: string | null;
    SOCID: number | null;
    SPLS: string | null;
    STKRPERRW: number | null;
    SVRUPDYN: boolean;
    SaleNavType: number | null;
    SalesRateType: number | null;
    StateCode: number | null;
    TCOMPANY: string | null;
    TINNO: string | null;
    VATNO: string | null;
    WEBsite: string | null;
    brach: null;
    director: string | null;
    email: string | null;
    wof1: boolean;
    wof2: boolean;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (session.data?.user.role === "admin") {
        try {
          const response = await listAPI.getOrgMasterForEdit();

          if (response) {
            console.log("Response Today Order ADMIN ", response);
            // Ensure responseData is an array before setting stockList
            setOrgMasterList(response);

            setFormData({
              ...formData,
              ACAEND: response[0].ACAEND,
              ACASTART: response[0].ACASTART,
              ATT: response[0].ATT,
              AccGroupType: response[0].AccGroupType,
              ActionType: response[0].ActionType,
              BANKACCNO: response[0].BANKACCNO,
              BULKSMSHISTORY: response[0].BULKSMSHISTORY,
              BarCodeLabelType: response[0].BarCodeLabelType,
              BarcodePageType: response[0].BarcodePageType,
              CHKSMSNO: response[0].CHKSMSNO,
              CheckOutTime: response[0].CheckOutTime,
              DRWOPNCOM: response[0].DRWOPNCOM,
              DefMailTo: response[0].DefMailTo,
              FAX: response[0].FAX,
              LVSTARTMODE: response[0].LVSTARTMODE,
              LinkSalesToAddressBook: response[0].LinkSalesToAddressBook,
              MOPayBillingNo: response[0].MOPayBillingNo,
              MailCredentialsID: response[0].MailCredentialsID,
              MailCredentialsPass: response[0].MailCredentialsPass,
              MailFrom: response[0].MailFrom,
              MailHost: response[0].MailHost,
              MailPort: response[0].MailPort,
              ORGADDRESS: response[0].ORGADDRESS,
              ORGAUTOID: response[0].ORGAUTOID,
              ORGCITY: response[0].ORGCITY,
              ORGCODE: response[0].ORGCODE,
              ORGDISPLAYNAME: response[0].ORGDISPLAYNAME,
              ORGDISTRICT: response[0].ORGDISTRICT,
              ORGNAME: response[0].ORGNAME,
              ORGNATION: response[0].ORGNATION,
              ORGPLACE: response[0].ORGPLACE,
              ORGREGNO: response[0].ORGREGNO,
              ORGSTATE: response[0].ORGSTATE,
              ORGSTREET: response[0].ORGSTREET,
              OthItmCode: response[0].OthItmCode,
              PANNO: response[0].PANNO,
              PARTYRATESAVE: response[0].PARTYRATESAVE,
              PDPORT: response[0].PDPORT,
              PH: response[0].PH,
              PLUCODEPRX: response[0].PLUCODEPRX,
              PLUCODETYPE: response[0].PLUCODETYPE,
              POSTSMS: response[0].POSTSMS,
              PRTPORT: response[0].PRTPORT,
              PUSHOWBTCH: response[0].PUSHOWBTCH,
              PUSHOWDIS: response[0].PUSHOWDIS,
              PUSHOWFLAG: response[0].PUSHOWFLAG,
              PUSHOWFREE: response[0].PUSHOWFREE,
              PUSHOWLOOSE: response[0].PUSHOWLOOSE,
              PUSHOWMFRC: response[0].PUSHOWMFRC,
              PUSHOWMRP: response[0].PUSHOWMRP,
              PUSHOWREM: response[0].PUSHOWREM,
              PUSHOWTP: response[0].PUSHOWTP,
              PUSHOWVAT: response[0].PUSHOWVAT,
              PuNavType: response[0].PuNavType,
              RateNCostingType: response[0].RateNCostingType,
              SASHOWBTCH: response[0].SASHOWBTCH,
              SASHOWDIS: response[0].SASHOWDIS,
              SASHOWFLAG: response[0].SASHOWFLAG,
              SASHOWFREE: response[0].SASHOWFREE,
              SASHOWLOOSE: response[0].SASHOWLOOSE,
              SASHOWMFRC: response[0].SASHOWMFRC,
              SASHOWMRP: response[0].SASHOWMRP,
              SASHOWREM: response[0].SASHOWREM,
              SASHOWTP: response[0].SASHOWTP,
              SASHOWVAT: response[0].SASHOWVAT,
              SMSDomainName: response[0].SMSDomainName,
              SMSFooter: response[0].SMSFooter,
              SMSHeader: response[0].SMSHeader,
              SMSPassWord: response[0].SMSPassWord,
              SMSProvider: response[0].SMSProvider,
              SMSRATE: response[0].SMSRATE,
              SMSSID: response[0].SMSSID,
              SMSUserName: response[0].SMSUserName,
              SOCID: response[0].SOCID,
              SPLS: response[0].SPLS,
              STKRPERRW: response[0].STKRPERRW,
              SVRUPDYN: response[0].SVRUPDYN,
              SaleNavType: response[0].SaleNavType,
              SalesRateType: response[0].SalesRateType,
              StateCode: response[0].StateCode,
              TCOMPANY: response[0].TCOMPANY,
              TINNO: response[0].TINNO,
              VATNO: response[0].VATNO,
              WEBsite: response[0].WEBsite,
              brach: response[0].brach,
              director: response[0].director,
              email: response[0].email,
              wof1: response[0].wof1,
              wof2: response[0].wof2,
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchData();
  }, [session.data?.user.role]);

  console.log(OrgMasterList);

  const handleSave = async () => {
    try {
      const response = await updateAPI.UpdateOrgMaster(formData);

      if (response) {
        console.log(response[0].InfoField);

        if (
          response[0].InfoField == "Updated" &&
          response[0].ActionType === 0
        ) {
          toast.success("Employee Updated successfully");
        } else {
          toast.warning("Failed to Update Employee");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="lg:flex mt-1">
        <div className="p-4 w-full lg:w-1/4 lg:order-last">
          {/* Centered column with buttons */}
          <div className="flex flex-col items-center h-full">
            <div className="lg:flex lg:flex-col items-center">
              <button
                className="w-28 bg-success px-3 py-2 text-white mr-2 mb-2 lg:mr-0 rounded-md"
                onClick={handleSave}
              >
                Save
              </button>
              <button className="w-28 bg-error text-white px-4 py-2 mr-2 lg:mr-0 rounded-md mb-2">
                Quit
              </button>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-4/5  lg:order-first md:mt-2 overflow-y-auto ">
          <div className="lg:flex">
            <div className="w-full pl-4">
              <div className="md:flex items-center">
                <label className="text-gray-600 mr-2">Name:</label>
                <input
                  type="text"
                  className="rounded-md  shadow-md py-2 pl-2 input-primary w-full"
                  value={formData?.ORGNAME as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      ORGNAME: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 mr-2">Address:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                  value={formData?.ORGADDRESS as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      ORGADDRESS: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 mr-2">Street:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                  value={formData?.ORGSTREET as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      ORGSTREET: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 mr-2">Place:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                  value={formData?.ORGPLACE as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      ORGPLACE: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 mr-2">City:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                  value={formData?.ORGCITY as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      ORGCITY: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 mr-2">District:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                  value={formData?.ORGDISTRICT as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      Designation: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 mr-2">State:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                  value={formData?.ORGSTATE as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      ORGSTATE: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 mr-2">Country:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                  value={formData?.ORGNATION as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      ORGNATION: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 mr-2">PhoneNo:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                  value={formData?.PH as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      PH: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 mr-2">PinCode:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                  value={formData?.FAX as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      FAX: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 mr-2">EmailAddress:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                  value={formData?.email as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 text-left lg:w-48 mr-2">
                  WebSite:
                </label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                  value={formData?.WEBsite as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      WEBsite: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center">
                <label className="text-gray-600 mr-2 mt-2">PANNo:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full mr-2 mt-2"
                  value={formData?.VATNO as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      VATNO: e.target.value,
                    }))
                  }
                />
                <label className="text-gray-600 mr-2 mt-2">GSTNO:</label>
                <input
                  type="text"
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full mt-2"
                  value={formData?.TINNO as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      TINNO: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:flex items-center mt-2">
                <label className="text-gray-600 mr-2">AccountDetails:</label>
                <textarea
                  className="rounded-md input-primary shadow-md py-2 pl-2  w-full resize-none"
                  rows={3}
                  value={formData?.BANKACCNO as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      BANKACCNO: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrganizationMasterInfo;
