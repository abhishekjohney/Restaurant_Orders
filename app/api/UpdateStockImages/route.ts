import axios from "axios";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqActionType", res.ReqActionType);
  formData.append("ReqImgEntID", res.ReqImgEntID);
  formData.append("ReqSVRSTKID", res.ReqSVRSTKID);
  formData.append("ReqImgRemarks", res.ReqImgRemarks);
  formData.append("ReqImgGroup", res.ReqImgGroup);
  formData.append("ReqImageType", res.ReqImageType);
  formData.append("imagestring1", res.imagestring1);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT || "default value";
  console.log("\n", webServiceURL, "\n");
  console.log(res, "update data");

  const result = await axios.post(webServiceURL, formData);
  const userdata = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json({ userdata });
}
