import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqYear", res.ReqYear);
  formData.append("ReqAccName", res.ReqAccName);
  formData.append("ReqAccCode", res.ReqAccCode);
  formData.append("ReqToDate", res.ReqToDate);
  formData.append("ReqFDate", res.ReqFDate);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT || "default value";
  console.log("\n", res, "\n");
  console.log("\n", webServiceURL, "\n");

  const result = await axios.post(webServiceURL, formData);
  const userdata = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json(userdata);
}
