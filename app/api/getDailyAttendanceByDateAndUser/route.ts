import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();

  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqAttDate", res.ReqAttDate);
  formData.append("ReqAttUser", res.ReqAttUser);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT || "default value";
  console.log("\n",webServiceURL,"\n");

  const result = await axios.post(webServiceURL, formData);
  const ResultData = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));

  return Response.json(ResultData);
}
