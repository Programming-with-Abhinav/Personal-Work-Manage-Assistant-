const account = {
    "customer per days": 1000,
    "profit per Head": 1000,
    "margin per Head": 100,
    "Shop open weekly": 7,
    "Shop open month":30,
    "Shop open year": 365,
    "timeframe selection": "custom",
    "working days": 2,
};

const computationResult = (() =>{
    let totalDays = 0;

    if (account["timeframe selection"] === "custom") {
        totalDays = account["working days"];
    } else if (account["timeframe selection"] === "weekly"){
        totalDays = account["Shop open weekly"];
    } else if (account["timeframe selection"] === "month"){
        totalDays = account["Shop open month"];
    } else if (account["timeframe selection"] === "year"){
        totalDays = account["Shop open year"];
    }

    let profit = account["customer per days"]*account["profit per Head"]*totalDays;
    let weekly = account["customer per days"]*account["Shop open weekly"]*account["profit per Head"];
    let month = account["customer per days"]*account["Shop open month"]*account["profit per Head"];
    let year = account["customer per days"] * account["Shop open year"] * account["profit per Head"];
    let margin = account["customer per days"]*account["margin per Head"]*totalDays;
    let gst = margin * 0.2;
    let tax = margin * 0.18;
    let netProfit = margin - (gst + tax);

    return{
        "Cost Cut Profit": margin,
        "Month in profit": month,
        "Year in profit": year,
        "GST Collection": gst,
        "IncomeTAX": tax,
        "Week in profit": weekly,
        "Net Take-Home Profit": netProfit ,
        "Profit": profit,
    }
})();

console.log("=== BUSINESS REPORT ===", { 
    accountData: account, 
    results: computationResult 
});
