
import axios from "axios";

export async function POST(request: Request) {
    const res = await request.json();


    console.log("SERVER DATA",res)

    const formData = new FormData();
    formData.append("title", res.title);
    formData.append("description", res.description);
    formData.append("ReqMntid", res.ReqMntid);
    formData.append("ReqUserID", res.ReqUserID);
    formData.append("ReqUserTypeID", res.ReqUserTypeID);
    formData.append("ReqYear", res.ReqYear);

    // let webServiceURL='http://srstrades.in/WebDataProcessingServerSM.aspx'
    let webServiceURL = process.env.WEBSERVICE_URL_REACT|| "default value";

    const result = await axios.post(webServiceURL, formData);

    const userdata = JSON.parse(
        result.data.substring(0, result.data.indexOf("||JasonEnd", 0))
    );

    return Response.json({ userdata });
}
