"use client";

import { AccountLedgerItemType, SelectedPartyDetailsInterface } from "@/types";

function PrintPartyListLedger({
  buyerName,
  buyerNameAdd,
  selectedBillItem,
  accountLedger,
}: {
  buyerName: string;
  buyerNameAdd: string;
  selectedBillItem: SelectedPartyDetailsInterface[];
  accountLedger: AccountLedgerItemType[];
}) {
  return (
    <div className="">
      <div className="container max-w-screen w-[95%] mx-auto">
        {selectedBillItem &&
          selectedBillItem?.map((item: SelectedPartyDetailsInterface, index: number) => (
            <div key={index} className="h-auto w-full rounded-lg">
              <label className="block text-warning-content text-lg font-bold mb-2">Party Accounts Details</label>
              <div className="flex mb-3 justify-start font-semibold text-base gap-3 items-center">
                <h2>{buyerName}</h2>
                <h2>{buyerNameAdd}</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 max-h-full shadow-lg">
                <div className=" w-full   bg-white">
                  {/* Additional details table */}
                  <table className="bg-white  table rounded-lg shadow-md">
                    {/* Table headers */}
                    <thead className="">
                      <tr>
                        <th className="py-2 px-4 text-left text-warning-content">Date</th>
                        <th className="py-2 px-4 text-left text-warning-content">Debit</th>
                        <th className="py-2 px-4 text-left text-warning-content">Credit</th>
                        <th className="py-2 px-4 text-left text-warning-content">Balance</th>
                      </tr>
                    </thead>
                    {/* Table body */}
                    <tbody>
                      {accountLedger &&
                        accountLedger.map((listItem: AccountLedgerItemType, index: number) => (
                          <tr key={index}>
                            <td className={`py-2 px-4 text-black  items-center`}>
                              <div className="mr-2">
                                {listItem.CT_DT
                                  ? new Intl.DateTimeFormat("en-IN").format(
                                      new Date(parseInt(listItem.CT_DT.replace("/Date(", "").replace(")/", ""), 10))
                                    )
                                  : ""}
                              </div>
                              <div className="mr-2 text-black">{listItem.TRANSTYPE}</div>
                              {/* <div className=" text-black">{listItem.BALANCE}</div> */}
                            </td>
                            <td className={`py-2 px-4 text-black`}>{listItem.CDRAMOUNT}</td>
                            <td className={`py-2 px-4 text-black`}>{listItem.CCRAMOUNT}</td>
                            <td className={`py-2 px-4 text-black`}>{listItem.BALANCE}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default PrintPartyListLedger;
