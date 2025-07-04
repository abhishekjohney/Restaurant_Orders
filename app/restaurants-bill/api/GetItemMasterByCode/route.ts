import axios from "axios";

const isEncrypted = process.env.NEXT_APP_IS_ENCRYPTED as string;
const encryptMode = process.env.NEXT_APP_ENCRYPT_MODE as string;

export async function POST(request: Request) {
  try {
    const res = await request.json();
    const formData = new FormData();

    formData.append("title", res.title);
    formData.append("description", res.description);
    formData.append("ReqItemCode", res.ReqItemCode);
    formData.append("ReqPartyCode", res.ReqPartyCode);
    formData.append("ReqWithStock", res.ReqWithStock);

    let webServiceURL = process.env.WEBSERVICE_URL_REACT_LOCATION_REPORTS as string;
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
