import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqOrderID", res.ReqOrderID);
  formData.append("ReqUserID", res.ReqUserID);
  formData.append("ReqUserAutoID", res.ReqUserAutoID);
  formData.append("ReqPartyID", res.ReqPartyID);
  formData.append("ReqRemarks", res.ReqRemarks);
  formData.append("ReqAcastart", res.ReqAcastart);
  formData.append("ReqDelDate", res.ReqDelDate);
  formData.append("ReqVehNo", res.ReqVehNo);
  formData.append("ReqAccPartyID", res.ReqAccPartyID);
  formData.append("ReqLocJason", JSON.stringify(res?.ReqLocJason));

  let webServiceURL = process.env.WEBSERVICE_URL_REACT || "default value";
  console.log("RESULT  new order", res);
  console.log("\n",webServiceURL,"\n");

  const result = await axios.post(webServiceURL, formData);
  const saveOrderResult = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json(saveOrderResult);
}
