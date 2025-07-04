import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqItemCode", res.ReqItemCode);
  formData.append("ReqPartyCode", res.ReqPartyCode);
  formData.append("ReqWithStock", res.ReqWithStock);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT_LOCATION_REPORTS || "default value";
  console.log("\n", webServiceURL, "\n");
  console.log("SERVER DATA", res);

  const result = await axios.post(webServiceURL, formData);
  const userdata = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json({ userdata });
}
