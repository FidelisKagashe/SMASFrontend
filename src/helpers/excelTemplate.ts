// product template
export const productTemplate: {
    name: string
    data: {
        "NAME": string
        "STOCK": number
        "COST INSURANCE AND FREIGHT (RATE)": number | string
        "BARCODE": string
        "BUYING PRICE": number
        "SELLING PRICE": number
        "REORDER STOCK LEVEL": number
        "POSITION": string
    }[]
} = {
    name: "product import template",
    data: [
        {
            "NAME": "Sample one",
            "STOCK": 500,
            "BARCODE": "6734543643",
            "BUYING PRICE": 1000,
            "COST INSURANCE AND FREIGHT (RATE)": "",
            "SELLING PRICE": 1250,
            "REORDER STOCK LEVEL": 5,
            "POSITION": "A1"
        },
        {
            "NAME": "Sample two with USD Rate",
            "STOCK": 95,
            "BARCODE": "3421231423",
            "BUYING PRICE": 10,
            "COST INSURANCE AND FREIGHT (RATE)": 2500,
            "SELLING PRICE": 35000,
            "REORDER STOCK LEVEL": 10,
            "POSITION": "F10"
        },
        {
            "NAME": "Sample three",
            "STOCK": 1000,
            "BARCODE": "65423424342",
            "BUYING PRICE": 10000,
            "COST INSURANCE AND FREIGHT (RATE)": "",
            "SELLING PRICE": 15000,
            "REORDER STOCK LEVEL": 0,
            "POSITION": "Top Right Corner"
        },
    ]
}


export const storeProductTemplate: {
    name: string
    data: {
        "NAME": string
        "STOCK": number
    }[]
} = {
    name: "store product import template",
    data: [
        {
            "NAME": "Sample one",
            "STOCK": 500,
        },
        {
            "NAME": "Sample two",
            "STOCK": 95,
        },
        {
            "NAME": "Sample three",
            "STOCK": 1000,
        },
    ]
}