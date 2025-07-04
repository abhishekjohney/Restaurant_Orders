import axios from "axios";

export async function POST(request: Request) {
  try {
    const res = await request.json();
    const formData = new FormData();

    formData.append("title", res.title);
    formData.append("description", res.description);
    formData.append("ReqYear", res.ReqYear);
    formData.append("ReqDate", res.ReqDate);
    formData.append("ReqUserID", res.ReqUserID);
    formData.append("ReqUserTypeID", res.ReqUserTypeID);

    let webServiceURL = process.env.NEXT_PUBLIC_WEBSERVICE_URL_RESTUARANT_ORDER_SYSTEM || "default value";
    console.log("\n", webServiceURL, "\n");
    console.log("\n", res, "\n");

    const result = await axios.post(webServiceURL, formData);
    const userdata = JSON.parse(result.data.substring(0, result.data.indexOf("||JasonEnd", 0)));
    return Response.json({ userdata });
  } catch (error) {
    return Response.json({ error: "Internal server error while processing GetStockOrderMasterListJason" });
  }
}
