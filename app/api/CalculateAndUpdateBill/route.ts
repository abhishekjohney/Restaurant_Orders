import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();

  const formData = new FormData();
  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqJSonData", res.ReqJSonData);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT_SALES_BILL || "default value";
  console.log("\n", res, "\n");
  console.log("\n", webServiceURL, "\n");

  // const result = await axios.post('0000000000000000', formData);
  const result = await axios.post(webServiceURL, formData);
  const saveOrderResult = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json(saveOrderResult);
}
