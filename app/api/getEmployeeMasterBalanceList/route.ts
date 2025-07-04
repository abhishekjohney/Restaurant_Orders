import axios from "axios";
import { log } from "console";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqEmpAutoID", res.ReqEmpAutoID);
  formData.append("ReqEmpCode", res.ReqEmpCode);
  formData.append("ReqDrpType", res.ReqDrpType);
  formData.append("ReqEmpName", res.ReqEmpName);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT || "default value";
  console.log("\n", webServiceURL, "\n");
  console.log("RESULT IN SERVER", res);

  const result = await axios.post(webServiceURL, formData);
  const userdata = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json({ userdata });
}
