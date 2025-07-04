"use client";

import React, { useEffect } from "react";
import { CardamomTransaction } from "@/types/index";

interface PrintReceiptProps {
  transaction: CardamomTransaction;
  onClose: () => void;
}

const PrintReceipt = ({ transaction, onClose }: PrintReceiptProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const centerText = (text: string, width: number = 40) => {
    const padding = Math.max(0, width - text.length);
    const leftPad = Math.floor(padding / 2);
    return " ".repeat(leftPad) + text;
  };

  const rightAlign = (text: string, width: number = 40) => {
    const padding = Math.max(0, width - text.length);
    return " ".repeat(padding) + text;
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatQuantity = (qty: number) => {
    return qty.toFixed(3);
  };

  const calculateRate = () => {
    if (transaction.GCRecQty && transaction.ProcAmount) {
      return transaction.ProcAmount / transaction.GCRecQty;
    }
    return 0;
  };

  const printContent = [
    "\x1B\x40", // Initialize printer
    "\x1B\x21\x30", // Double width/height
    centerText("RAJAKUMARY SPICES"),
    centerText("PRODUCERS COMPANY"),
    "\x1B\x21\x00", // Reset font
    centerText("Reg.No.ID/KTC-5/2022/14"),
    "",
    centerText("KULAPARACHAL , KURUVILACITY"),
    centerText("IDUKKI , Kerala"),
    centerText("9744768425, 8078013210"),
    "",
    centerText("Cardamom Receipt"),
    "-".repeat(40),
    `To: ${transaction.PartyName}`,
    "Address: N/A",
    `Computer Ref. No.: ${transaction.CompRefNo}`,
    `Date: ${formatDate(transaction.Cdate)}`,
    "",
    `Quantity Received: ${rightAlign(formatQuantity(transaction.GCRecQty), 25)} KG`,
    `Rate Per KG     : ${rightAlign(formatCurrency(calculateRate()), 25)}`,
    `Processing Charges: ${rightAlign(formatCurrency(transaction.ProcAmount), 24)}`,
    `Number Of Bags   : ${rightAlign(String(transaction.GCRecQty > 40 ? 2 : 1), 25)}`,
    "",
    centerText("For"),
    centerText("RAJAKUMARY SPICES PRODUCERS"),
    centerText("COMPANY"),
    "",
    centerText("Auth. Signatory"),
    "-".repeat(40),
    "\x1B\x0C", // Form feed
  ].join("\n");

  useEffect(() => {
    const print = async () => {
      try {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  @page { 
                    size: 80mm 297mm;
                    margin: 0;
                  }
                  pre {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 12px;
                    white-space: pre;
                    margin: 0;
                    padding: 0;
                  }
                </style>
              </head>
              <body>
                <pre>${printContent}</pre>
              </body>
            </html>
          `);
          iframeDoc.close();

          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          setTimeout(() => {
            document.body.removeChild(iframe);
            onClose();
          }, 500);
        }
      } catch (error) {
        console.error("Printing error:", error);
        alert("Error printing receipt");
      }
    };

    print();
  }, [transaction]);

  return null;
};

export default PrintReceipt;
