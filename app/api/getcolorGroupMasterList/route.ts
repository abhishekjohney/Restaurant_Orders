
import axios from "axios";

export async function POST(request: Request) {

  const res = await request.json()

  console.log("RESULT IN SERVER",res)
  


console.log(res.title)

console.log(res.description)


      const formData = new FormData();
      formData.append("title", res.title);
      formData.append("description", res.description);
      formData.append("ReqColorName", res.ReqColorName);
      formData.append("ReqSerType", res.ReqSerType);
   
      // let webServiceURL='http://srstrades.in/WebDataProcessingServerSM.aspx'
      let webServiceURL='http://shoperp.cypherinfosolution.com/WebDataProcessingReact.aspx'

      const result = await axios.post(webServiceURL, formData);


      // console.log("RESULT DATA",result.data)
      
       const userdata = JSON.parse(
        result.data.substring(0, result.data.indexOf("||JasonEnd", 0))
  
    );

    return Response.json(userdata);
  
    
  }