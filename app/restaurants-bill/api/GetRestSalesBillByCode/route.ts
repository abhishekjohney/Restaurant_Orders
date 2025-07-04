import axios from "axios";

export async function POST(request: Request) {
  try {
    const res = await request.json();
    const formData = new FormData();

    formData.append("title", res.title);
    formData.append("description", res.description);
    formData.append("ReqSvrCode", res.ReqSvrCode);
    formData.append("ReqAcaStart", res.ReqAcaStart);
    formData.append("ReqTransID", res.ReqTransID);
    formData.append("ReqEntryMode", res.ReqEntryMode);
    formData.append("ReqUserCode", res.ReqUserCode);

    let webServiceURL = process.env.NEXT_PUBLIC_WEBSERVICE_URL_RESTUARANT_ORDER_SYSTEM || "default value";
    console.log("\n", webServiceURL, "\n");
    console.log("\n", res, "\n");

    const result = await axios.post(webServiceURL, formData);
    const userdata = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
    return Response.json({ userdata });
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
