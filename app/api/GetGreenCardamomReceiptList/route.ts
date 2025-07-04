import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("Reqdate1", res.Reqdate1);
  formData.append("Reqdate2", res.Reqdate2);
  formData.append("Reqparty", res.Reqparty);
  formData.append("ReqRefNo", res.ReqRefNo);

  let webServiceURL = process.env.CARDAMOM_API_URL || "default value";
  console.log("\n", webServiceURL, "\n");
  console.log("\n", res, "\n");

  const result = await axios.post(webServiceURL, formData);
  const userdata = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json({ userdata });
}
