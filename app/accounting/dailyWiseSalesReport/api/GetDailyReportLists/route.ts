import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();

  const formData = new FormData();
  formData.append("title", res.title);
  formData.append("description", res.description);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT_ACCOUNTS_REPORTS as string;

  const result = await axios.post(webServiceURL, formData);

  // console.log("RESULT DATA", result.data);

  const userdata = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));

  return Response.json(userdata);
}
