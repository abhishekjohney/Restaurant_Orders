import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const res = await request.json();
  const formData = new FormData();

  formData.append("title", res.title);
  formData.append("description", res.description);
  formData.append("ReqGroupType", res.ReqGroupType);
  formData.append("ReqGrpid", res.ReqGrpid);

  let webServiceURL = process.env.WEBSERVICE_URL_REACT || "default value";
  console.log("RESULT  new order", res);
  console.log("\n",webServiceURL,"\n");

  const result = await axios.post(webServiceURL, formData);
  const ResultData = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
  return Response.json(ResultData);
}
