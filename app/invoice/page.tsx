// "use client";

// import {
//     PDFViewer,
//     Page,
//     Document,
//     View,
//     StyleSheet,
//     Text,
// } from "@react-pdf/renderer";

// // import Invoice from "@/components/Pdf/Invoice";

// export default function Pdftest() {
//     return (
//         <PDFViewer className="h-screen w-full">
//             <Document title="Invoice">
//                 <Page size="A4" style={styles.page}>
//                     <InvoiceHeader />
//                     <View style={styles.tableContainer}>
//                         <InvoiceTableHeader />
//                         <InvoiceTableRow />
//                     </View>

//                     <InvoiceFooter />
//                 </Page>
//             </Document>
//         </PDFViewer>
//     );
// }

// const InvoiceTableHeader = () => (
//     <View style={styles.container}>
//         <Text style={styles.qty}>#</Text>
//         <Text style={styles.description}>Item Description</Text>
//         <Text style={styles.qty}>Department</Text>
//         <Text style={styles.rate}>Cost Price</Text>
//         <Text style={styles.amount}>Sales Price</Text>
//     </View>
// );

// const InvoiceTableRow = () => {
//     const total = items.reduce(
//         (acc, item) => parseFloat(item.SalePrice) + acc,
//         0
//     );
//     const rows = items.map((item, index) => (
//         <View style={styles.row} key={item.id.toString()}>
//             <Text style={styles.qty}>{index + 1}</Text>
//             <Text style={styles.description}>{item.ItemDesc}</Text>
//             <Text style={styles.qty}>{item.Department}</Text>
//             <Text style={styles.rate}>{item.CostPrice}</Text>
//             <Text style={styles.amount}>{item.SalePrice}</Text>
//         </View>
//     ));
//     return (
//         <>
//             {rows}
//             <Text>Amount to pay: {total}</Text>
//         </>
//     );
// };
// const InvoiceHeader = () => {
//     return (
//         <>
//             <View style={styles.header} fixed>
//                 <Text>Cloud Commerce</Text>
//                 <Text>Contact at: 903423423 </Text>
//             </View>
//         </>
//     );
// };

// const InvoiceFooter = () => {
//     return (
//         <>
//             <View style={styles.footerLine} fixed></View>
//         </>
//     );
// };

// const borderColor = "#90e5fc";
// const styles = StyleSheet.create({
//     row: {
//         flexDirection: "row",
//         borderBottomColor: "#bff0fd",
//         borderBottomWidth: 1,
//         alignItems: "center",
//         height: 24,
//         fontStyle: "bold",
//     },
//     tableContainer: {
//         flexDirection: "row",
//         flexWrap: "wrap",
//         marginTop: 24,
//         borderWidth: 1,
//         borderColor: "#bff0fd",
//     },
//     page: {
//         padding: "20px",
//         fontSize: "12px",
//     },
//     header: {
//         backgroundColor: "gray",
//         padding: "5px",
//         width: "100%",
//         fontSize: "15px",
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "stretch",
//     },
//     footerLine: {
//         width: "80%",
//         height: "6px",
//         backgroundColor: "black",
//         position: "absolute",
//         bottom: "10px",
//         marginHorizontal: "20px",
//     },
//     container: {
//         flexDirection: "row",
//         borderBottomColor: "#bff0fd",
//         backgroundColor: "#bff0fd",
//         borderBottomWidth: 1,
//         alignItems: "center",
//         height: 24,
//         textAlign: "center",
//         fontStyle: "bold",
//         flexGrow: 1,
//     },
//     description: {
//         width: "60%",
//         borderRightColor: borderColor,
//         borderRightWidth: 1,
//     },
//     qty: {
//         width: "10%",
//         borderRightColor: borderColor,
//         borderRightWidth: 1,
//     },
//     rate: {
//         width: "15%",
//         borderRightColor: borderColor,
//         borderRightWidth: 1,
//     },
//     amount: {
//         width: "15%",
//     },
// });

// const items = [
//     {
//         id: 1,
//         Barcode: "1",
//         PLUCode: "BS00001",
//         ItemDesc: "Cardamom EC 100 gm",
//         SalePrice: "300",
//         PurPrice: "0.00",
//         Department: "Species",
//         DGID: "0",
//         DisplayGroup: "",
//         CostPrice: "0.00",
//         SaleDis: "0.00",
//     },
//     {
//         id: 2,
//         Barcode: "1",
//         PLUCode: "BS00001",
//         ItemDesc: "Cardamom EC 100 gm",
//         SalePrice: "300",
//         PurPrice: "0.00",
//         Department: "Species",
//         DGID: "0",
//         DisplayGroup: "",
//         CostPrice: "0.00",
//         SaleDis: "0.00",
//     },
//     {
//         id: 3,
//         Barcode: "1",
//         PLUCode: "BS00001",
//         ItemDesc: "Cardamom EC 100 gm",
//         SalePrice: "300",
//         PurPrice: "0.00",
//         Department: "Species",
//         DGID: "0",
//         DisplayGroup: "",
//         CostPrice: "0.00",
//         SaleDis: "0.00",
//     },
//     {
//         id: 4,
//         Barcode: "1",
//         PLUCode: "BS00001",
//         ItemDesc: "Cardamom EC 100 gm",
//         SalePrice: "300",
//         PurPrice: "0.00",
//         Department: "Species",
//         DGID: "0",
//         DisplayGroup: "",
//         CostPrice: "0.00",
//         SaleDis: "0.00",
//     },
//     {
//         id: 5,
//         Barcode: "1",
//         PLUCode: "BS00001",
//         ItemDesc: "Cardamom EC 100 gm",
//         SalePrice: "300",
//         PurPrice: "0.00",
//         Department: "Species",
//         DGID: "0",
//         DisplayGroup: "",
//         CostPrice: "0.00",
//         SaleDis: "0.00",
//     },
//     {
//         id: 6,
//         Barcode: "1",
//         PLUCode: "BS00001",
//         ItemDesc: "Cardamom EC 100 gm",
//         SalePrice: "300",
//         PurPrice: "0.00",
//         Department: "Species",
//         DGID: "0",
//         DisplayGroup: "",
//         CostPrice: "0.00",
//         SaleDis: "0.00",
//     },
//     {
//         id: 7,
//         Barcode: "1",
//         PLUCode: "BS00001",
//         ItemDesc: "Cardamom EC 100 gm",
//         SalePrice: "300",
//         PurPrice: "0.00",
//         Department: "Species",
//         DGID: "0",
//         DisplayGroup: "",
//         CostPrice: "0.00",
//         SaleDis: "0.00",
//     },
//     {
//         id: 8,
//         Barcode: "1",
//         PLUCode: "BS00001",
//         ItemDesc: "Cardamom EC 100 gm",
//         SalePrice: "300",
//         PurPrice: "0.00",
//         Department: "Species",
//         DGID: "0",
//         DisplayGroup: "",
//         CostPrice: "0.00",
//         SaleDis: "0.00",
//     },
//     {
//         id: 9,
//         Barcode: "1",
//         PLUCode: "BS00001",
//         ItemDesc: "Cardamom EC 100 gm",
//         SalePrice: "300",
//         PurPrice: "0.00",
//         Department: "Species",
//         DGID: "0",
//         DisplayGroup: "",
//         CostPrice: "0.00",
//         SaleDis: "0.00",
//     },
//     // Add more department objects as needed
// ];

export default function Pdftest() {
    <>
        PDF react-pdf wont compile with next app
        dir:https://github.com/diegomura/react-pdf/issues/2535
    </>;
}
