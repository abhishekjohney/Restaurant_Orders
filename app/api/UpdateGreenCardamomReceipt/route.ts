import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqJSonData", res.ReqJSonData);

  let webServiceURL = process.env.CARDAMOM_API_URL || "default value";
  console.log("\n", webServiceURL, "\n");
  console.log("\n", res, "\n");

  const result = await axios.post(webServiceURL, formData);
  const savePayment = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json(savePayment);
}
