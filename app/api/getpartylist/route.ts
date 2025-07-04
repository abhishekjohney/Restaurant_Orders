import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqClass", res.ReqClass);
  formData.append("ReqSection", res.ReqSection);
  formData.append("ReqYear", res.ReqYear);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT || "default value";

  const result = await axios.post(webServiceURL, formData);
  const userdata = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json({ userdata });
}
