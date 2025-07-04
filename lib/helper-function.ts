import { AES, enc, mode, pad } from "crypto-ts";

export const getNextDay = (): Date => {
  const currentDate = new Date();
  const tomorrow = new Date(currentDate);
  // tomorrow.setDate(currentDate.getDate() + 1); // Get tomorrow's date
  tomorrow.setDate(currentDate.getDate());
  return tomorrow;
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Add leading zero if necessary
  const day = ("0" + date.getDate()).slice(-2); // Add leading zero if necessary
  return `${year}-${month}-${day}`;
};
export const formatDate2 = (date: Date): string => {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Add leading zero if necessary
  const day = ("0" + date.getDate()).slice(-2); // Add leading zero if necessary
  return `${day}-${month}-${year}`;
};
export function swapDate(strAcaTo: string): string {
  const [day, month, year] = strAcaTo.split("-");
  return `${year}-${month}-${day}`;
}

export function swapDateBack(strAcaTo: string): string {
  const [year, month, day] = strAcaTo.split("-");
  return `${day}-${month}-${year}`;
}

export function getCurrentTime() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function getTodayDate(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = today.getFullYear();

  return `${day}-${month}-${year}`;
}
export function getTodayDateForInput(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = today.getFullYear();

  return `${year}-${month}-${day}`;
}

const encryptionKey = enc.Utf8.parse("A1758A8801264C06780787999E36139F");
const iv = enc.Utf8.parse("qojHDrL6GHsmfkcN");
const key = "4aef4053efdf8b92dc6fc6c84f170bdbf64cc3f73da80078a61d9f4f392d81e3";

export const EncryptFunction = (data: string) => {
  const encrypted = AES.encrypt(enc.Utf8.parse(data), encryptionKey, {
    iv: iv,
    mode: mode.CBC,
    padding: pad.PKCS7,
  });
  return encrypted.toString(); // Returns Base64 encrypted string
};

export const DecryptFunction = (data: string) => {
  const stringRes = JSON.stringify(data);
  const res2 = stringRes.split("||JasonEnd")[0];
  const sanitizedRes = res2.replace(/^"|"$/g, "");
  const decrypted = AES.decrypt(sanitizedRes, encryptionKey, {
    iv: iv,
    mode: mode.CBC,
    padding: pad.PKCS7,
  });
  return decrypted.toString(enc.Utf8); // Returns the original string
};

export const encryptedData = (text: string) => {
  return AES.encrypt(text, key).toString();
};

export const decryptData = (encryptedText: string) => {
  try {
    const decrypted = AES.decrypt(encryptedText, key);
    const str = decrypted.toString(enc.Utf8);
    return str.length > 0 ? str : "error 1";
  } catch (e) {
    return "error 2";
  }
};

export const convertSendFormatIntoInputFormat = (dateStr: string) => {
  const [day, month, year] = dateStr.split("-");
  return `${year}-${month}-${day}`;
};

export const convertInputDateToSendFormat = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

export function getCurrentDateFormatted(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(today.getDate()).padStart(2, "0");

  return `${day}-${month}-${year}`;
}
export function getCurrentDateFormattedToInput(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
