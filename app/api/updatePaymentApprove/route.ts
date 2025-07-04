import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqCurDate", res.ReqCurDate);
  formData.append("ReqAprUser", res.ReqAprUser);
  formData.append("ReqAprCodes", res.ReqAprCodes);
  formData.append("ReqUpdType", res.ReqUpdType);
  formData.append("ReqAprSts", res.ReqAprSts);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT || "default value";
  console.log("\n", webServiceURL, "\n");
  console.log(res);

  const result = await axios.post(webServiceURL, formData);
  const savePayment = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json(savePayment);
}
