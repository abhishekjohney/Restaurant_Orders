const masterlists = [
    {
        name: "Company Master",
        icon: "https://cdn-icons-png.flaticon.com/128/11126/11126205.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "",
    },
    {
        name: "Company Info",
        icon: "https://cdn-icons-png.flaticon.com/128/4427/4427566.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "",
    },

    {
        name: "Comapany Selection",
        icon: "https://cdn-icons-png.flaticon.com/128/11594/11594805.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/salesman/monthlyOrders",
    },
    {
        name: "Item Master",
        icon: "https://cdn-icons-png.flaticon.com/128/1395/1395613.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/itemmaster",
    },
    {
        name: "Product Name Master",
        icon: "https://cdn-icons-png.flaticon.com/128/11743/11743436.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/departmentmaster/G",
    },
    {
        name: "Department Master ",
        icon: "https://cdn-icons-png.flaticon.com/128/1736/1736235.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/departmentmaster/D",
    },
    {
        name: "Brand ",
        icon: "https://cdn-icons-png.flaticon.com/128/5486/5486254.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/departmentmaster/B",
    },
    {
        name: "Color ",
        icon: "https://cdn-icons-png.flaticon.com/128/2071/2071669.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/departmentmaster/L",
    },
    {
        name: "Size ",
        icon: "https://cdn-icons-png.flaticon.com/128/12144/12144379.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/departmentmaster/S",
    },
    {
        name: "Style/Design ",
        icon: "https://cdn-icons-png.flaticon.com/128/4765/4765278.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/departmentmaster/Z",
    },
    {
        name: "Material ",
        icon: "https://cdn-icons-png.flaticon.com/128/2442/2442731.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/departmentmaster/M",
    },
    {
        name: "Unit",
        icon: "https://cdn-icons-png.flaticon.com/128/7170/7170545.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/departmentmaster/U",
    },
    {
        name: "Product Type",
        icon: "https://cdn-icons-png.flaticon.com/128/7170/7170545.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/departmentmaster/T",
    },
    {
        name: "Color Group Master",
        icon: "https://cdn-icons-png.flaticon.com/128/9823/9823949.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/salesman/todaysOrders",
    },
    {
        name: "Display Group Master",
        icon: "https://cdn-icons-png.flaticon.com/128/5528/5528289.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/salesman/todaysOrders",
    },
    {
        name: "VAT Master",
        icon: "https://cdn-icons-png.flaticon.com/128/10547/10547430.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/salesman/todaysOrders",
    },
    {
        name: "Batch Master",
        icon: "https://cdn-icons-png.flaticon.com/128/8091/8091837.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/salesman/todaysOrders",
    },
    {
        name: "HSN Code Master",
        icon: "https://cdn-icons-png.flaticon.com/128/2092/2092587.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/HSNCodeMasterDisplay",
    },
    {
        name: "Employee Master",
        icon: "https://cdn-icons-png.flaticon.com/128/13541/13541053.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/salesman/todaysOrders",
    },
];

const AccountList = [
    {
        name: "Account Books",
        icon: "https://cdn-icons-png.flaticon.com/128/11126/11126205.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "/itemmaster",
    },
    {
        name: "Transactions",
        icon: "https://cdn-icons-png.flaticon.com/128/4427/4427566.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "",
    },

    {
        name: "Reports",
        icon: "https://cdn-icons-png.flaticon.com/128/11594/11594805.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "",
    },
    {
        name: "Daily Transaction",
        icon: "https://cdn-icons-png.flaticon.com/128/1395/1395613.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "",
    },
    {
        name: "Billwise Payment",
        icon: "https://cdn-icons-png.flaticon.com/128/11743/11743436.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "",
    },
    {
        name: "Daily Billwise Payments ",
        icon: "https://cdn-icons-png.flaticon.com/128/1736/1736235.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "",
    },
    {
        name: "Daily Party wise Payments",
        icon: "https://cdn-icons-png.flaticon.com/128/5486/5486254.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "",
    },
    {
        name: "Cheques Management",
        icon: "https://cdn-icons-png.flaticon.com/128/2071/2071669.png?ga=GA1.1.1024160867.1704909032&semt=ais",
        redirect: "",
    },
];

export { masterlists, AccountList };
