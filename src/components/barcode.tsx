import React from "react"
import { ApplicationContext } from "../context"
import { Input } from "./form"
import { apiV1, commonCondition, text } from "../helpers"
import { array, string } from "fast-web-kit"
import { readOrDelete } from "../types"

type BarcodeProps = {
    autoFocus: boolean
}

const BarcodeInput: React.FunctionComponent<BarcodeProps> = React.memo((props: BarcodeProps) => {
    // Accessing the application context
    const { application } = React.useContext(ApplicationContext)

    // Effect hook to handle keyboard events
    React.useEffect(() => {
        // Handler function for keydown event
        const handleKeyDown = (event: KeyboardEvent) => {
            try {
                // Array of allowed keyboard keys
                const keyboardKeys = ['Alt', 'ArrowLeft', 'PageUp', 'Clear', 'PageDown', 'Insert', 'ArrowUp', 'ArrowRight', 'Home', "Enter"]
                // Extracting the pressed key
                const { key, } = event;
                // Preventing default action if the pressed key is in the list of allowed keys
                if (array.elementExist(keyboardKeys, key))
                    event.preventDefault()
            } catch (error) {
                // Dispatching an error notification in case of an error
                application.dispatch({ notification: (error as Error).message });
            }
        };

        // Adding event listener for keydown
        document.addEventListener("keydown", handleKeyDown);

        // Cleanup function to remove event listener when component unmounts
        return function cleanup() {
            document.removeEventListener("keydown", handleKeyDown);
        }
        // eslint-disable-next-line
    }, [])

    // Effect hook to fetch product data when barcode changes
    React.useEffect(() => {
        let timeId = setTimeout(() => {
            fetchProductData()
        }, 100)
        return () => clearTimeout(timeId)
        // eslint-disable-next-line
    }, [application.state.barcode])

    // Function to fetch product data based on barcode
    async function fetchProductData() {
        try {
            // Get the barcode from application state
            const product = application.state.product
            const barcode = text.formatBarcode(application.state.barcode)

            // Fetch product data if barcode has minimum length
            if (string.getLength(barcode) >= 6) {

                if ((!product) || (product && (product.barcode !== barcode))) {

                    // Define select and condition for API query
                    const select = JSON.stringify({
                        cif: 1,
                        name: 1,
                        stock: 1,
                        barcode: 1,
                        position: 1,
                        buying_price: 1,
                        selling_price: 1,
                        reorder_stock_level: 1
                    })

                    const condition = JSON.stringify({ barcode, ...commonCondition(true) })
                    const parameters = `schema=product&condition=${condition}&select=${select}&joinForeignKeys=${false}`

                    // Define options for API request
                    const options: readOrDelete = {
                        parameters,
                        method: "GET",
                        loading: true,
                        disabled: false,
                        route: apiV1 + "read"
                    }

                    // Make API request to fetch product data
                    const response = await application.readOrDelete(options)

                    // Dispatch fetched product data to application state if successful
                    if (response.success) {
                        const product = response.message
                        application.dispatch({
                            product,
                            quantity: "1",
                            products: [product],
                            productId: product._id,
                            oldStock: product.stock,
                            stock: product.stock?.toString(),
                            productName: text.reFormat(product.name),
                            buyingPrice: product.buying_price?.toString(),
                            cif: product.cif ? product.cif?.toString() : "",
                            sellingPrice: product.selling_price?.toString(),
                            barcode: product.barcode ? product.barcode : "",
                            position: product.position ? product.position : "",
                            reorderStockLevel: product.reorder_stock_level?.toString()
                        })
                    }
                    else {
                        application.dispatch({
                            id: "",
                            cif: "",
                            stock: "",
                            oldStock: 0,
                            edit: false,
                            quantity: "",
                            position: "",
                            products: [],
                            product: null,
                            productId: "",
                            productName: "",
                            buyingPrice: "",
                            sellingPrice: "",
                            reorderStockLevel: "",
                            notification: response.message
                        })
                    }
                }
            }
        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    // Render input component for barcode scanning
    return (
        <Input
            type="text"
            name="barcode"
            label="Barcode / Serial"
            autoFocus={props.autoFocus}
            placeholder="Scan bar code here"
            error={application.state.barcodeError}
            onChange={application.handleInputChange}
            value={string.isNotEmpty(application.state.barcode) ? text.formatBarcode(application.state.barcode) : ""}
        />
    )
})

// Export BarcodeInput component
export default BarcodeInput
