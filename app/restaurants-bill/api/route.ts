import { DecryptFunction } from "@/lib/helper-function";
import axios from "axios";

const isEncrypted = process.env.NEXT_APP_IS_ENCRYPTED as string;
const encryptMode = process.env.NEXT_APP_ENCRYPT_MODE as string;

export async function POST(request: Request) {
  try {
    const res = await request.json();
    const formData = new FormData();

    formData.append("title", res.title);
    formData.append("description", res.description);
    formData.append("ReqYear", res.ReqYear);
    formData.append("ReqDate", res.ReqDate);
    formData.append("ReqUserID", res.ReqUserID);
    formData.append("ReqUserTypeID", res.ReqUserTypeID);

    let webServiceURL = process.env.NEXT_PUBLIC_WEBSERVICE_URL_RESTUARANT_ORDER_SYSTEM as string;
    console.log("\n", webServiceURL, "\n");
    console.log("\n", res, "\n");

    const result = await axios.post(webServiceURL, formData);
    const ResultData = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
    return Response.json(ResultData);
  } catch (error) {
    const errorResponse = [
      {
        ActionType: -5,
        ErrorCode: "500",
        ErrorMessage: "Internal server error",
        JSONData1: "",
        JSONData2Remarks: "",
        JSONData3: "",
        JSONData3Remarks: "",
        JSONData4: null,
        JSONData4Remarks: null,
        JSONData5: null,
        JSONData5Remarks: null,
        SuccessMessage: null,
      },
    ];
    return Response.json(errorResponse);
  }
}
