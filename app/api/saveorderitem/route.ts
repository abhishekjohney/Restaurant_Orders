import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqOrderID", res.ReqOrderID);
  formData.append("ReqSVRSTKID", res.ReqSVRSTKID);
  formData.append("ReqOrderQty", res.ReqOrderQty);
  formData.append("ReqOrderRate", res.ReqOrderRate);
  formData.append("ReqOrderRemarks", res.ReqOrderRemarks);
  formData.append("ReqUserTypeID", res.ReqUserTypeID);
  formData.append("RReqAcastart", res.ReqAcastart);
  formData.append("ReqOrderTransID", res.ReqOrderTransID);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT || "default value";
  console.log("\n", webServiceURL, "\n");

  const result = await axios.post(webServiceURL, formData);
  const saveOrder = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json(saveOrder);
}
