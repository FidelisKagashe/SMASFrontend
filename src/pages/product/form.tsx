// dependencies
import React from "react"
import { Link } from "react-router-dom"
import { Button, FloatingButton } from "../../components/button"
import { CardTitle } from "../../components/card"
import { Input } from "../../components/form"
import Modal from "../../components/modal"
import { apiV1, noAccess, number, pageNotFound, setPageTitle, text } from "../../helpers"
import { productTemplate } from "../../helpers/excelTemplate"
import { can } from "../../helpers/permissions"
import translate from "../../helpers/translator"
import { createOrUpdate, routerProps, serverResponse, readOrDelete } from "../../types"
import { ApplicationContext } from "../../context"
import { array, string } from "fast-web-kit"
import DataListComponent from "../../components/reusable/datalist"
import BarcodeInput from "../../components/barcode"
import NumberComponent from "../../components/reusable/number-component"

// product memorized functional component
const ProductForm: React.FunctionComponent<routerProps> = React.memo((props: routerProps) => {

    // application context
    const { application } = React.useContext(ApplicationContext)

    // component mounting
    React.useEffect(() => {

        // checking user access
        if (can("edit_product") || can("create_product")) {
            onMount()
        }
        else {
            props.history.push(pageNotFound)
            application.dispatch({ notification: noAccess })
        }

        // component unmounting
        return () => application.unMount()

        // eslint-disable-next-line
    }, [])

    React.useEffect(() => {
        const product = application.state.product
        if (product) {
            application.dispatch({
                edit: true,
                id: product._id
            })
        }
        // eslint-disable-next-line
    }, [application.state.productId])

    async function onMount(): Promise<void> {
        try {

            const pathname: string = props.location.pathname
            const title: string = pathname.includes("store") ? "store product" : "product"
            application.dispatch({
                pathname,
                isStoreProduct: pathname.includes("store")? true : false
            })

            setPageTitle(`new ${title}`)
            // editing or creating ?
            if (props.location.state) {

                // getting product from router component state
                const { product }: any = props.location.state

                // verifying product has been provided
                if (product) {

                    const joinForeignKeys: boolean = true
                    const select: string = JSON.stringify({
                        cif: 1,
                        name: 1,
                        code: 1,
                        stock: 1,
                        store: 1,
                        barcode: 1,
                        quantity: 1,
                        category: 1,
                        position: 1,
                        buying_price: 1,
                        selling_price: 1,
                        is_store_product: 1,
                        reorder_stock_level: 1,
                        branch: 0,
                        created_by: 0,
                        updated_by: 0,
                    })
                    const condition: string = JSON.stringify({ _id: product })
                    const parameters: string = `schema=product&condition=${condition}&select=${select}&joinForeignKeys=${joinForeignKeys}`

                    // request options
                    const options: readOrDelete = {
                        parameters,
                        method: "GET",
                        loading: true,
                        disabled: false,
                        route: apiV1 + "read",
                    }

                    // api request
                    const response: serverResponse = await application.readOrDelete(options)

                    if (response.success) {
                        setPageTitle(`edit ${title}`)

                        console.log(response.message)

                        application.dispatch({
                            edit: true,
                            id: response.message._id,
                            oldStock: response.message.stock,
                            stock: response.message.stock?.toString(),
                            quantity: response.message.quantity?.toString(),
                            productName: text.reFormat(response.message.name),
                            isStoreProduct: response.message?.is_store_product,
                            buyingPrice: response.message.buying_price?.toString(),
                            sellingPrice: response.message.selling_price?.toString(),
                            productCode: response.message.code ? response.message.code : "",
                            cif: response.message.cif ? response.message.cif.toString() : "",
                            reorderStockLevel: response.message.reorder_stock_level?.toString(),
                            barcode: response.message.barcode ? response.message.barcode.toString() : "",
                            position: response.message.position ? text.reFormat(response.message.position) : "",
                        })

                        if (response.message.is_store_product) {
                            application.dispatch({
                                stores: [response.message.store],
                                storeId: response.message.store._id,
                                storeName: text.reFormat(response.message.store.name),
                            })
                        }

                        if (response.message.category) {
                            application.dispatch({
                                categories: [response.message.category],
                                categoryId: response.message.category._id,
                                categoryName: text.reFormat(response.message.category.name),
                            })
                        }
                    }
                    else
                        application.dispatch({ notification: response.message })
                }
            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    // function for validating form
    const submitForm = async (event: React.ChangeEvent<HTMLFormElement>): Promise<void> => {
        try {

            // preventing form default submit
            event.preventDefault()

            // variable to hold errors
            const errors: string[] = []
            const cif = number.reFormat(application.state.cif)
            const stock = number.reFormat(application.state.stock)
            const buying_price = number.reFormat(application.state.buyingPrice)
            const selling_price = number.reFormat(application.state.sellingPrice)
            const reorder_stock_level = number.reFormat(application.state.reorderStockLevel)

            // for product adjustment
            const stockDifference = (stock - application.state.oldStock) * -1
            let quantity = application.state.edit ? number.reFormat(application.state.quantity) - stockDifference : number.reFormat(application.state.stock)

            // stock leveling to avoid negative sold
            quantity = (quantity < stock) ? stock : quantity

            if (string.isEmpty(application.state.productName)) {
                errors.push("")
                application.dispatch({ productNameError: "required" })
            }

            // if (can("view_category") && string.isEmpty(application.state.categoryName)) {
            //     errors.push("")
            //     application.dispatch({ categoryNameError: "required" })
            // }
            // else if (string.isNotEmpty(application.state.categoryName) && string.isEmpty(application.state.categoryId)) {
            //     errors.push("")
            //     application.dispatch({ categoryNameError: "category does not exist" })
            // }

            if (buying_price < 0) {
                errors.push("")
                application.dispatch({ buyingPriceError: "can't be less than zero" })
            }
            else if (buying_price > selling_price) {
                errors.push("")
                application.dispatch({ buyingPriceError: "can't be greater than selling price" })
            }
            else if (string.isNotEmpty(application.state.cif) && string.isEmpty(application.state.buyingPrice) && !application.state.edit) {
                errors.push("")
                application.dispatch({ buyingPriceError: "required" })
            }

            if (selling_price < 0) {
                errors.push("")
                application.dispatch({ sellingPriceError: "can't be less or equal to zero" })
            }

            if (stock < 0) {
                errors.push("")
                application.dispatch({ stockError: "can't be less than zero" })
            }

            if (reorder_stock_level < 0) {
                errors.push("")
                application.dispatch({ reorderStockLevelError: "can't be less than zero" })
            }

            if (application.state.edit) {
                if (buying_price <= 0) {
                    errors.push("")
                    application.dispatch({ buyingPrice: "can't be less or equal to zero" })
                }

                if (selling_price <= 0) {
                    errors.push("")
                    application.dispatch({ sellingPrice: "can't be less or equal to zero" })
                }
            }

            if (application.state.isStoreProduct) {
                if (string.isEmpty(application.state.storeName)) {
                    errors.push("")
                    application.dispatch({ storeNameError: "required" })
                }
                else if (string.isEmpty(application.state.storeId)) {
                    errors.push("")
                    application.dispatch({ storeNameError: "store does not exist" })
                }
            }

            // checking if there's no error occured
            if (array.isEmpty(errors) && string.isEmpty(application.state.productNameError)) {

                const creatorOrModifier = application.state.edit ? application.onUpdate : application.onCreate
                const product = {
                    cif,
                    stock,
                    quantity,
                    buying_price,
                    selling_price,
                    visible: true,
                    reorder_stock_level,
                    ...creatorOrModifier,
                    position: text.format(application.state.position),
                    is_store_product: application.state.isStoreProduct,
                    name: text.format(application.state.productName).toLowerCase(),
                    store: application.state.isStoreProduct ? application.state.storeId : null,
                    code: string.isNotEmpty(application.state.productCode) ? application.state.productCode : null,
                    category: string.isNotEmpty(application.state.categoryId) ? application.state.categoryId : null,
                    barcode: string.isNotEmpty(application.state.barcode) ? text.formatBarcode(application.state.barcode) : null,
                }

                // request options
                const options: createOrUpdate = {
                    loading: true,
                    method: application.state.edit ? "PUT" : "POST",
                    route: apiV1 + (application.state.edit ? "product/update" : "product/create"),
                    body: application.state.edit
                        ?
                        {
                            ...product,
                            _id: application.state.id,
                            old_stock: application.state.oldStock,
                        }
                        : product
                }

                // api request
                const response: serverResponse = await application.createOrUpdate(options)

                // checking if request was processed successfull
                if (response.success) {
                    application.unMount()
                    application.dispatch({ notification: response.message, isStoreProduct: application.state.isStoreProduct })
                }
                else
                    application.dispatch({ notification: response.message })

            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    // function for uploading contacts from excel
    const uploadProducts = async (): Promise<void> => {
        try {

            // validating if products have been added to list array
            if (application.state.list.length > 0) {

                // close model
                application.toggleComponent("modal")

                // validating products
                const errors: string[] = []
                const validProducts: any[] = []
                const invalidProducts: any[] = []

                for (const product of application.state.list) {
                    if (product["NAME"] === undefined)
                        invalidProducts.push({ ...product, NAME: "", ERROR: "Name is required" })
                    else if (product["STOCK"] === undefined)
                        invalidProducts.push({ ...product, STOCK: "", ERROR: "STOCK is required" })
                    else if (Number(product["STOCK"]) < 0)
                        invalidProducts.push({ ...product, ERROR: "STOCK can't be less than zero" })
                    else if ((product["BUYING PRICE"] === undefined) && (product["COST INSURANCE AND FREIGHT (RATE)"] !== undefined))
                        invalidProducts.push({ ...product, ERROR: "BUYING PRICE is required" })
                    else if (Number(product["BUYING PRICE"]) < 0)
                        invalidProducts.push({ ...product, ERROR: "BUYING PRICE can't be less than zero" })
                    else if (product["SELLING PRICE"] === undefined)
                        invalidProducts.push({ ...product, ERROR: "SELLING PRICE is required" })
                    else if (Number(product["BUYING PRICE"]) > Number(product["SELLING PRICE"]))
                        invalidProducts.push({ ...product, ERROR: "BUYING PRICE can't be greater than SELLING PRICE" })
                    else if ((product["REORDER STOCK LEVEL"] !== undefined) && Number(product["REORDER STOCK LEVEL"]) < 0)
                        invalidProducts.push({ ...product, ERROR: "Reorder stock level can't be less than 0" })
                    else
                        validProducts.push(product)
                }

                if (can("view_category") && string.isEmpty(application.state.categoryId)) {
                    errors.push("")
                    application.dispatch({ categoryNameError: "Required" })
                }

                // clear product list
                application.dispatch({ list: [] })

                // checking if there's no invalid product
                if (array.isEmpty(invalidProducts) && array.isEmpty(errors)) {

                    const errors: string[] = []

                    if (application.state.isStoreProduct) {
                        if (string.isEmpty(application.state.storeName)) {
                            errors.push("")
                            application.dispatch({ storeNameError: "required" })
                        }
                        else if (string.isEmpty(application.state.storeId)) {
                            errors.push("")
                            application.dispatch({ storeNameError: "store does not exist" })
                        }
                    }

                    if (array.isEmpty(errors)) {

                        // request options
                        const options: createOrUpdate = {
                            route: apiV1 + "product/bulk-create",
                            method: "POST",
                            loading: true,
                            body: validProducts.map((product: any) => {

                                const stock = Number(product["STOCK"])
                                const quantity = stock
                                const name = text.format(product["NAME"])
                                const position = string.isNotEmpty(product["POSITION"]) ? text.format(product["POSITION"]) : null
                                const buying_price = Number(product["BUYING PRICE"])
                                let selling_price = Number(product["SELLING PRICE"])
                                const barcode = string.isNotEmpty(product["BARCODE"]) ? text.format(product["BARCODE"]) : null
                                const code = string.isNotEmpty(product["CODE"]) ? product["CODE"] : null
                                const is_store_product = application.state.isStoreProduct
                                const store = string.isNotEmpty(application.state.storeId) ? application.state.storeId : null
                                const reorder_stock_level = Number(product["REORDER STOCK LEVEL"])
                                const cif = Number(product["COST INSURANCE AND FREIGHT (RATE)"])

                                selling_price = cif > 0 ? cif * selling_price : selling_price

                                return {
                                    cif,
                                    code,
                                    name,
                                    store,
                                    stock,
                                    barcode,
                                    quantity,
                                    position,
                                    buying_price,
                                    selling_price,
                                    is_store_product,
                                    ...application.onCreate,
                                    reorder_stock_level: reorder_stock_level ? reorder_stock_level : 0,
                                }
                            })
                        }

                        // making api request
                        const response: serverResponse = await application.createOrUpdate(options)

                        // checking if request was processed successfully
                        if (response.success) {

                            application.unMount()
                            onMount()

                            application.dispatch({ notification: response.message })

                        }
                        else {
                            application.dispatch({ notification: response.message })
                        }
                    }
                }
                else
                    application.arrayToExcel([...invalidProducts, validProducts], "product validation error")

            }
            else
                application.dispatch({ filesError: "File is required or file has no product(s)" })

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    // cif and buying price change
    // const getSellingPrice = () => {
    //     try {
    //         if (string.isNotEmpty(application.state.buyingPrice)) {
    //             if (string.isNotEmpty(application.state.cif)) {
    //                 const cifInNumber = number.reFormat(application.state.cif)
    //                 if (cifInNumber > 0) {
    //                     const buyingPrice = number.reFormat(application.state.buyingPrice)
    //                     const priceInTZS = number.format(cifInNumber * buyingPrice)
    //                     application.dispatch({ priceInTZS, sellingPrice: priceInTZS })
    //                 }
    //                 else {
    //                     application.dispatch({
    //                         priceInTZS: "",
    //                         sellingPrice: ""
    //                     })
    //                 }
    //             }
    //             else {
    //                 application.dispatch({
    //                     priceInTZS: "",
    //                     sellingPrice: ""
    //                 })
    //             }
    //         }
    //         else {
    //             application.dispatch({
    //                 cif: "",
    //                 priceInTZS: "",
    //                 sellingPrice: ""
    //             })
    //         }
    //     } catch (error) {
    //         application.dispatch({ notification: (error as Error).message })
    //     }
    // }

    // returning component view
    return (
        <>
            <Modal
                buttonTitle="Import"
                buttonAction={uploadProducts}
                title="Import products from excel"
                toggleComponent={application.toggleComponent}
            >
                <form action="#">
                    <div className="row">
                        <div className="col s12">
                            <Input
                                type="file"
                                label="Choose file"
                                name="files"
                                error={application.state.filesError}
                                onChange={application.handleFileChange}
                                accept=".xls,.xlsx"
                            />
                        </div>
                    </div>
                </form>
                <div className="col s12 right-align">
                    <Link to="#" className="guest-link right-link" onClick={() => application.arrayToExcel(productTemplate.data, productTemplate.name)}>
                        {translate("Download sample product template")}
                    </Link>
                </div>
            </Modal>
            <div className="row">
                <div className="col s12 m10 l8 offset-l2 offset-m1">
                    <div className="card">
                        <CardTitle title={`${application.state.edit ? "edit" : "new"} ${application.state.isStoreProduct ? "store" : ""} product`} />
                        <div className="card-content">
                            <form action="#" onSubmit={submitForm}>
                                {
                                    can("view_category")
                                        ?
                                        <div className="row">
                                            <div className="col s12">
                                                <DataListComponent for="category" />
                                            </div>
                                        </div>
                                        : null
                                }
                                {
                                    application.state.isStoreProduct
                                        ?
                                        <div className="row">
                                            <div className="col s12">
                                                <DataListComponent for="store" />
                                            </div>
                                        </div>
                                        : null
                                }
                                <div className="row">
                                    <div className="col s12 m6 l6">
                                        <DataListComponent for="product" condition={{ is_store_product: application.state.isStoreProduct }} />
                                    </div>
                                    <div className="col s12 m6 l6">
                                        <BarcodeInput autoFocus={false} />
                                    </div>
                                </div>
                                {
                                    can("view_buying_price") || can("view_selling_price")
                                        ?
                                        <div className="row">
                                            {
                                                can("view_buying_price")
                                                    ?
                                                    <div className={`col s12 ${can("view_selling_price") ? "m6 l6" : ""}`}>
                                                        <NumberComponent
                                                            name="buyingPrice"
                                                            label="buying price"
                                                            placeholder="Enter buying price"
                                                        />
                                                    </div>
                                                    : null
                                            }
                                            {
                                                can("view_selling_price")
                                                    ?
                                                    <div className={`col s12 ${can("view_buying_price") ? "m6 l6" : ""}`}>
                                                        <NumberComponent
                                                            name="sellingPrice"
                                                            label="selling price"
                                                            placeholder="Enter selling price"
                                                        />
                                                    </div>
                                                    : null
                                            }
                                        </div>
                                        : null
                                }
                                <div className="row">
                                    {
                                        can("view_stock")
                                            ?
                                            <div className="col s12 m6 l6">
                                                <NumberComponent
                                                    label="stock"
                                                    name="stock"
                                                    placeholder="Enter stock available"
                                                    disabled={!can("adjust_stock") && application.state.edit}
                                                />
                                            </div>
                                            : null
                                    }
                                    <div className={`col s12 ${can("view_stock") ? "m6 l6" : ""}`}>
                                        <NumberComponent
                                            label="reorder stock level"
                                            name="reorderStockLevel"
                                            placeholder="Enter re-order stock level (stock alert)"
                                        />
                                    </div>
                                </div>
                                {/* <div className="row">
                                    {
                                        can("view_buying_price")
                                            ?
                                            <div className="col s12 m6 l6">
                                                <Input
                                                    type="text"
                                                    name="cif"
                                                    onKeyUp={getSellingPrice}
                                                    error={application.state.cifError}
                                                    label="cost insurance and freight (rate)"
                                                    onChange={application.handleInputChange}
                                                    placeholder="Enter selling price coefficient"
                                                    value={application.state.cif ? number.format(application.state.cif) : ""}
                                                />
                                            </div>
                                            : null
                                    }
                                </div> */}
                                <div className="row">
                                    <div className="col s12 m6 l6">
                                        <Input
                                            type="text"
                                            label="position"
                                            name="position"
                                            value={application.state.position}
                                            placeholder="Enter product position"
                                            error={application.state.positionError}
                                            onChange={application.handleInputChange}
                                        />
                                    </div>
                                    <div className="col s12 m6 l6">
                                        <Input
                                            type="text"
                                            label="code"
                                            name="productCode"
                                            placeholder="Enter product code"
                                            value={application.state.productCode}
                                            onChange={application.handleInputChange}
                                            error={application.state.productCodeError}
                                        />
                                    </div>
                                </div>
                                {
                                    !application.state.edit
                                        ?
                                        <div className="col s12 right-align">
                                            <Link to="#" className="guest-link right-link" onClick={() => application.toggleComponent("modal")}>
                                                {translate("Upload or Import from Excel")}
                                            </Link>
                                        </div>
                                        : null
                                }
                                <div className="row">
                                    <div className="col s12 center">
                                        <Button
                                            title={application.state.edit ? "update" : "create"}
                                            loading={application.state.loading}
                                            disabled={application.state.disabled}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {
                can("list_product") || can("list_store_product")
                    ?
                    <FloatingButton
                        to={application.state.isStoreProduct ? "/store/product-list" : "/product/list"}
                        tooltip={application.state.isStoreProduct ? "list store products" : "List products"}
                    />
                    : null
            }
        </>
    )

})

// exporting component
export default ProductForm