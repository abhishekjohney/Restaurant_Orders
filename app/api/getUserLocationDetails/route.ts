import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const res = await request.json();

  console.log(res);

  // `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&json`
  // `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  // `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=lgfskagf@8758askljdghf87tasdf`
  // `https://us1.locationiq.com/v1/reverse?key=pk.69153a5545ad0c24c5184b6671ea0ff4&lat=${latitude}&lon=${longitude}&format=json&`

  try {
    let webServiceURL = `https://us1.locationiq.com/v1/reverse?key=pk.278ea62d29f9ca225d3eb6ed93d24766&lat=${res?.latitude}&lon=${res?.longitude}&format=json&`;
    const result = await axios.get(webServiceURL);
    return NextResponse.json(result.data);
  } catch (error) {
    // console.log(error);
    return NextResponse.json(error);
  }
}
