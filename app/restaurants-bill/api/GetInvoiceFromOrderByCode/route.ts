import axios from "axios";

export async function POST(request: Request) {
  try {
    const res = await request.json();
    const formData = new FormData();

    formData.append("title", res.title);
    formData.append("description", res.description);
    formData.append("ReqAcaStart", res.ReqAcaStart);
    formData.append("ReqOrderID", res.ReqOrderID);
    formData.append("ReqOrderDate", res.ReqOrderDate);
    formData.append("ReqEntryMode", res.ReqEntryMode);
    formData.append("ReqUserCode", res.ReqUserCode);
    formData.append("ReqTransID", res.ReqTransID);

    let webServiceURL = process.env.NEXT_PUBLIC_WEBSERVICE_URL_RESTUARANT_ORDER_SYSTEM || "default value";
    console.log("\n", webServiceURL, "\n");
    console.log("\n", res, "\n");

    const result = await axios.post(webServiceURL, formData);
    const savePayment = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
    return Response.json(savePayment);
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
