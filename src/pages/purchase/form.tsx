// external dependencies
import React from "react"
import { Button, FloatingButton } from "../../components/button"
import { CardTitle } from "../../components/card"
import { Input } from "../../components/form"
import { apiV1, noAccess, number, pageNotFound, setPageTitle, text } from "../../helpers"
import { can } from "../../helpers/permissions"
import { createOrUpdate, readOrDelete, routerProps, serverResponse } from "../../types"
import { ApplicationContext } from "../../context"
import { array, string } from "fast-web-kit"
import DataListComponent from "../../components/reusable/datalist"
import NumberComponent from "../../components/reusable/number-component"

// purchase form memorized function component
const PurchaseForm: React.FunctionComponent<routerProps> = React.memo((props: routerProps) => {

    // application context
    const { application } = React.useContext(ApplicationContext)

    // component mounting
    React.useEffect(() => {

        // checking user permission
        if (can("create_purchase") || can("edit_purchase")) {
            onMount()
            application.dispatch({ date: new Date().toISOString().substring(0, 10) })
        }
        else {
            props.history.push(pageNotFound)
            application.dispatch({ notification: noAccess })
        }

        // component unmounting
        return () => application.unMount()

        // eslint-disable-next-line
    }, [])

    // loading component data
    async function onMount(): Promise<void> {
        try {

            if (props.location.pathname.includes("store"))
                application.dispatch({ isStoreProduct: true })

            setPageTitle("new purchase")

            if (props.location.state) {

                const { product, purchase, supplier }: any = props.location.state

                if (product) {

                    application.dispatch({
                        products: [product],
                        productId: product._id,
                        buyingPrice: product.buying_price,
                        sellingPrice: product.selling_price,
                        productName: text.reFormat(product.name),
                        isStoreProduct: product.is_store_product,
                        reorderStockLevel: product.reorder_stock_level,
                    })

                }
                else if (purchase) {

                    // parameters, condition select and joining foreign keys
                    const joinForeignKeys: boolean = true
                    const condition: string = JSON.stringify({ _id: purchase })
                    const parameters: string = `schema=purchase&condition=${condition}&joinForeignKeys=${joinForeignKeys}&select=`

                    // request options
                    const options: readOrDelete = {
                        parameters,
                        method: "GET",
                        loading: true,
                        disabled: false,
                        route: apiV1 + "read"
                    }

                    // api request
                    const response: serverResponse = await application.readOrDelete(options)

                    if (response.success) {
                        setPageTitle("edit purchase")
                        application.dispatch({
                            edit: true,
                            id: response.message._id,
                            purchase: response.message,
                            stock: response.message.quantity?.toString(),
                            date: response.message.date.substring(0, 10),
                            paidAmount: response.message.paid_amount?.toString(),
                            totalAmount: response.message.total_amount?.toString(),
                            productId: text.reFormat(response.message.product._id),
                            productName: text.reFormat(response.message.product.name),
                            buyingPrice: response.message.product.buying_price?.toString(),
                            sellingPrice: response.message.product.selling_price?.toString(),
                            invoiceNumber: response.message.number ? response.message.number : "",
                            reorderStockLevel: response.message.product.reorder_stock_level?.toString(),
                        })

                        if (response.message.supplier) {
                            application.dispatch({
                                suppliers: [response.message.supplier],
                                supplierId: response.message.supplier._id,
                                useSupplierAccount: response.message.use_supplier_account ? "yes" : "no",
                                supplierName: `${text.reFormat(response.message.supplier.name)} - ${response.message.supplier.phone_number}`
                            })
                        }

                    }
                    else
                        application.dispatch({ notification: response.message })
                }
                else if (supplier) {
                    application.dispatch({
                        supplier: supplier,
                        suppliers: [supplier],
                        supplierId: supplier._id,
                        supplierName: `${text.reFormat(supplier.name)} - ${supplier.phone_number}`
                    })
                }
            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    // get amount
    React.useEffect(() => {
        if (string.isNotEmpty(application.state.productId) && !application.state.edit) {
            const amount: string = (number.reFormat(application.state.stock) * number.reFormat(application.state.buyingPrice)).toString()
            const adjustment: string = (number.reFormat(application.state.stock) + number.reFormat(application.state.quantity)).toString()
            application.dispatch({ adjustment })
            application.dispatch({ paidAmount: amount })
            application.dispatch({ totalAmount: amount })
        }
        // eslint-disable-next-line
    }, [application.state.buyingPrice, application.state.stock, application.state.productName])

    // validating form
    const validateForm = async (event: React.ChangeEvent<HTMLFormElement>): Promise<void> => {
        try {

            // prevent form default submit
            event.preventDefault()

            const errors: string[] = []
            const stock = number.reFormat(application.state.stock)
            const paid_amount = number.reFormat(application.state.paidAmount)
            const total_amount = number.reFormat(application.state.totalAmount)
            const buying_price = number.reFormat(application.state.buyingPrice)
            const selling_price = number.reFormat(application.state.sellingPrice)
            const reorder_stock_level = number.reFormat(application.state.reorderStockLevel)

            // validating form fields
            if (string.isEmpty(application.state.productName)) {
                errors.push("")
                application.dispatch({ productNameError: "required" })
            }
            else if (string.isEmpty(application.state.productId)) {
                errors.push("")
                application.dispatch({ productNameError: "product does not exist" })
            }

            if (buying_price === 0) {
                errors.push("")
                application.dispatch({ buyingPriceError: "required" })
            }
            else if (buying_price < 0) {
                errors.push("")
                application.dispatch({ buyingPriceError: "can't be less than zero" })
            }

            if (selling_price === 0) {
                errors.push("")
                application.dispatch({ sellingPriceError: "required" })
            }
            else if (selling_price < buying_price) {
                errors.push("")
                application.dispatch({ sellingPriceError: "can't be less than buying price" })
            }

            if (string.isEmpty(application.state.stock)) {
                errors.push("")
                application.dispatch({ stockError: "required" })
            }
            else if (stock <= 0) {
                errors.push("")
                application.dispatch({ stockError: "can't be less or equal to zero" })
            }

            if (reorder_stock_level < 0) {
                errors.push("")
                application.dispatch({ stockError: "can't be less than zero" })
            }

            if (string.isEmpty(application.state.date)) {
                errors.push("")
                application.dispatch({ dateError: "required" })
            }

            if (string.isEmpty(application.state.totalAmount)) {
                errors.push("")
                application.dispatch({ totalAmountError: "required" })
            }
            else if (total_amount <= 0) {
                errors.push("")
                application.dispatch({ totalAmountError: "can't be less or equal to zero" })
            }

            if (paid_amount > total_amount) {
                errors.push("")
                application.dispatch({ paidAmountError: "can't be greater than total amount" })
            }
            else if (paid_amount < 0) {
                errors.push("")
                application.dispatch({ paidAmountError: "can't be less than 0" })
            }

            if (array.isEmpty(errors)) {

                // request options
                const options: createOrUpdate = {
                    loading: true,
                    method: application.state.edit ? "PUT" : "POST",
                    route: apiV1 + (application.state.edit ? "purchase/update" : "purchase/create"),
                    body: !application.state.edit
                        ?
                        {
                            paid_amount,
                            total_amount,
                            buying_price,
                            selling_price,
                            quantity: stock,
                            reorder_stock_level,
                            ...application.onCreate,
                            date: application.state.date,
                            product: application.state.productId,
                            supplier: string.isNotEmpty(application.state.supplierId) ? application.state.supplierId : null,
                            number: string.isNotEmpty(application.state.invoiceNumber) ? application.state.invoiceNumber : null,
                        }
                        :
                        {
                            paid_amount,
                            visible: true,
                            ...application.onUpdate,
                            date: application.state.date,
                            _id: application.condition._id,
                            number: string.isNotEmpty(application.state.invoiceNumber) ? application.state.invoiceNumber : null,
                        }
                }

                // api request
                const response: serverResponse = await application.createOrUpdate(options)

                if (response.success) {
                    application.unMount()
                    application.dispatch({
                        notification: response.message,
                        isStoreProduct: application.state.isStoreProduct
                    })
                }
                else
                    application.dispatch({ notification: response.message })

            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    // component view
    return (
        <>
            <div className="row">
                <div className="col s12 m10 l8 offset-m1 offset-l2">
                    <div className="card">
                        <CardTitle title={`${application.state.edit ? "edit" : "new"} purchase`} />
                        <div className="card-content">
                            <form action="#" onSubmit={validateForm}>
                                <div className="row">
                                    <div className="col s12 m6 l6">
                                        <DataListComponent
                                            for="product"
                                            isPurchase={true}
                                            disabled={application.state.edit}
                                            condition={{ is_store_product: application.state.isStoreProduct }}
                                        />
                                    </div>
                                    <div className="col s12 m6 l6">
                                        <NumberComponent
                                            name="stock"
                                            label="purchased stock"
                                            disabled={application.state.edit}
                                            placeholder="Enter stock purchased"
                                        />
                                    </div>
                                </div>
                                {
                                    can("view_stock") && !application.state.edit
                                        ?
                                        <div className="row">
                                            <div className="col s12 m6 l6">
                                                <NumberComponent
                                                    disabled
                                                    name="quantity"
                                                    label="stock available"
                                                    placeholder="stock available"
                                                />
                                            </div>
                                            <div className="col s12 m6 l6">
                                                <NumberComponent
                                                    disabled
                                                    label="new stock"
                                                    name="adjustment"
                                                    placeholder="new stock"
                                                />
                                            </div>
                                        </div>
                                        : null
                                }
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
                                                            disabled={application.state.edit}
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
                                                            disabled={application.state.edit}
                                                        />
                                                    </div>
                                                    : null
                                            }
                                        </div>
                                        : null
                                }
                                <div className="row">
                                    <div className="col s12 m6 l6">
                                        <NumberComponent
                                            name="totalAmount"
                                            label="total amount"
                                            placeholder="Enter total amount"
                                            disabled={application.state.edit && application.state.purchase?.editable}
                                        />
                                    </div>
                                    <div className="col s12 m6 l6">
                                        <NumberComponent
                                            name="paidAmount"
                                            label="paid amount"
                                            placeholder="Enter paid amount"
                                            disabled={application.state.edit && application.state.purchase?.editable}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12 m6 l6">
                                        <NumberComponent
                                            name="reorderStockLevel"
                                            label="re-order stock level"
                                            disabled={application.state.edit}
                                            placeholder="Enter re-order stock level (stock alert)"
                                        />
                                    </div>
                                    <div className="col s12 m6 l6">
                                        <Input
                                            type="date"
                                            name="date"
                                            label="purchase Date"
                                            value={application.state.date}
                                            error={application.state.dateError}
                                            onChange={application.handleInputChange}
                                            max={new Date().toISOString().substring(0, 10)}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12 m6 l6">
                                        <DataListComponent
                                            for="supplier"
                                            disabled={application.state.edit}
                                        />
                                    </div>
                                    <div className="col s12 m6 l6">
                                        <Input
                                            type="text"
                                            name="invoiceNumber"
                                            label="invoice number"
                                            value={application.state.invoiceNumber}
                                            onChange={application.handleInputChange}
                                            placeholder="Enter purchase invoice number"
                                            error={application.state.invoiceNumberError}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12 center">
                                        <Button
                                            title={application.buttonTitle}
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
                can("list_purchase")
                    ?
                    <FloatingButton
                        tooltip="list purchases"
                        to={application.state.isStoreProduct ? "/store/purchase-list" : "/purchase/list"}
                    />
                    : null
            }
        </>
    )
})

// exporting component
export default PurchaseForm