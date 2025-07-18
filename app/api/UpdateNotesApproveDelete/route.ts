import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqAprUser", res.ReqAprUser);
  formData.append("ReqNCRID", res.ReqNCRID);
  formData.append("ReqApryn", res.ReqApryn);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT || "default value";
  console.log("\n", webServiceURL, "\n");
  console.log(res);

  const result = await axios.post(webServiceURL, formData);
  const savePayment = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json(savePayment);
}
