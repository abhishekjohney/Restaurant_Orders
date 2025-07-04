import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();

  const formData = new FormData();
  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqUserCode", res.ReqUserCode);
  formData.append("ReqDate", res.ReqDate);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT as string;

  const result = await axios.post(webServiceURL, formData);

  // console.log("RESULT DATA", result.data);

  const userdata = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));

  return Response.json(userdata);
}
