import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqSvrcode", res.ReqSvrcode);
  formData.append("ReqUser", res.ReqUser);
  formData.append("ReqAcaStart", res.ReqAcaStart);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT_SALES_BILL || "default value";
  console.log("\n", webServiceURL, "\n");
  console.log("\n", res, "\n");

  const result = await axios.post(webServiceURL, formData);
  const userdata = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json(userdata);
}
