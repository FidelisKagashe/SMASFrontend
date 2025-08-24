// dependencies
import React from "react"
import { ActionButton, Button, FloatingButton } from "../../components/button"
import { CardTitle } from "../../components/card"
import { Input } from "../../components/form"
import { apiV1, noAccess, number, pageNotFound, setPageTitle, storage, text } from "../../helpers"
import { can } from "../../helpers/permissions"
import translate from "../../helpers/translator"
import { createOrUpdate, routerProps, serverResponse } from "../../types"
import { array, string } from "fast-web-kit"
import { ApplicationContext } from "../../context"
import DataListComponent from "../../components/reusable/datalist"
import NumberComponent from "../../components/reusable/number-component"

// bulk purchase memorized function component
const BulkPurchase: React.FunctionComponent<routerProps> = React.memo((props: routerProps) => {

    // application context
    const { application } = React.useContext(ApplicationContext)

    // component mounting
    React.useEffect(() => {
        if (can("create_purchase")) {
            setPageTitle("bulk purchase")
            const purchases = storage.retrieve("purchases")
            if (props.location.state) {
                const { supplier }: any = props.location.state
                if (supplier) {
                    application.dispatch({
                        suppliers: [supplier],
                        supplierId: supplier._id,
                        supplierName: `${text.reFormat(supplier.name)} - ${supplier.phone_number}`
                    })
                }
            }

            if (props.location.pathname.includes("store"))
                application.dispatch({ isStoreProduct: true })

            if (array.hasElements(purchases)) {
                const purchase = purchases[0]
                application.dispatch({
                    purchases,
                    supplierId: purchase.supplier,
                    invoiceNumber: purchase.number,
                    supplierName: purchase.supplierName,
                })
            }

        }
        else {
            props.history.push(pageNotFound)
            application.dispatch({ notification: noAccess })
        }

        return () => application.unMount()

        // eslint-disable-next-line
    }, [])

    // validating form
    const validateForm = async (event: React.ChangeEvent<HTMLFormElement>): Promise<void> => {
        try {

            // prevent form default submit
            event.preventDefault()

            const errors: string[] = []
            // const fee = number.reFormat(application.state.fee)
            // const account = application.state.secondAccountData
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

            if (string.isEmpty(application.state.supplierName)) {
                errors.push("")
                application.dispatch({ supplierNameError: "required" })
            }
            else if (string.isEmpty(application.state.supplierId)) {
                errors.push("")
                application.dispatch({ supplierNameError: "supplier does not exist" })
            }

            if (string.isEmpty(application.state.invoiceNumber)) {
                errors.push("")
                application.dispatch({ invoiceNumberError: "required" })
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

                const purchase = {
                    paid_amount,
                    total_amount,
                    buying_price,
                    selling_price,
                    quantity: stock,
                    reorder_stock_level,
                    ...application.onCreate,
                    date: application.state.date,
                    product: application.state.productId,
                    supplier: application.state.supplierId,
                    number: application.state.invoiceNumber,
                    productName: application.state.productName,
                    supplierName: application.state.supplierName,
                }

                const purchases: any = [purchase, ...application.state.purchases]
                application.dispatch({ purchases })
                storage.store("purchases", purchases)
                application.dispatch({
                    date: "",
                    stock: "",
                    quantity: "",
                    adjustment: "",
                    paidAmount: "",
                    productName: "",
                    buyingPrice: "",
                    totalAmount: "",
                    sellingPrice: "",
                    reorderStockLevel: "",
                    notification: "purchase has been added",
                })
            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    // save purchases
    const savePurchases = async (): Promise<void> => {
        try {

            // request options
            const options: createOrUpdate = {
                method: "POST",
                loading: true,
                body: application.state.purchases,
                route: apiV1 + "purchase/bulk-create",
            }

            // api request
            const response: serverResponse = await application.createOrUpdate(options)

            if (response.success) {
                application.unMount()
                storage.remove("purchases")
                application.dispatch({
                    notification: response.message
                })
            }
            else
                application.dispatch({ notification: response.message })


        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    const removePurchase = (purchase: any): void => {
        try {
            const index = application.state.purchases.indexOf(purchase)
            application.state.purchases.splice(index, 1)
            storage.store("purchases", application.state.purchases)
            application.dispatch({ notification: "purchase has been removed" })
        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    const renderPurchases = React.useCallback(() => {
        try {
            return application.state.purchases.map((purchase: any, index: number) => {
                return (
                    <tr key={index}>
                        <td data-label="#">{index + 1}</td>
                        <td data-label={translate("product")} className="sticky">{text.reFormat(purchase.productName)}</td>
                        <td className="right-align" data-label={translate("quantity")}>{number.format(purchase.quantity)}</td>
                        <td className="right-align text-primary" data-label={translate("total amount")}>{number.format(purchase.total_amount)}</td>
                        <td className="center">
                            <div className="action-button">
                                <ActionButton
                                    to="#"
                                    type="error"
                                    icon="delete"
                                    position="left"
                                    tooltip="remove purchase"
                                    onClick={() => removePurchase(purchase)}
                                />
                            </div>
                        </td>
                    </tr>
                )
            })
        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
        // eslint-disable-next-line
    }, [application.state.purchases])

    // get amount
    React.useEffect(() => {
        if (string.isNotEmpty(application.state.productId)) {
            const amount: string = (number.reFormat(application.state.stock) * number.reFormat(application.state.buyingPrice)).toString()
            const adjustment: string = (number.reFormat(application.state.stock) + number.reFormat(application.state.quantity)).toString()
            application.dispatch({ adjustment })
            application.dispatch({ paidAmount: amount })
            application.dispatch({ totalAmount: amount })
        }
        // eslint-disable-next-line
    }, [application.state.buyingPrice, application.state.stock, application.state.productName])

    // component view
    return (
        <>
            <div className="row">
                <div className="col s12 m5 l4">
                    <div className="card">
                        <CardTitle title="new purchase" />
                        <div className="card-content">
                            <form action="#" onSubmit={validateForm}>
                                <div className="row">
                                    <div className="col s12">
                                        <DataListComponent
                                            for="product"
                                            isPurchase={true}
                                            condition={{ is_store_product: application.state.isStoreProduct }}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <NumberComponent
                                            name="stock"
                                            label="purchased stock"
                                            placeholder="Enter stock purchased"
                                        />
                                    </div>
                                </div>
                                {
                                    can("view_stock")
                                        ?
                                        <>
                                            <div className="row">
                                                <div className="col s12">
                                                    <NumberComponent
                                                        disabled
                                                        name="quantity"
                                                        label="stock available"
                                                        placeholder="stock available"
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col s12">
                                                    <NumberComponent
                                                        disabled
                                                        label="new stock"
                                                        name="adjustment"
                                                        placeholder="new stock"
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col s12">
                                                    <NumberComponent
                                                        name="reorderStockLevel"
                                                        label="re-order stock level"
                                                        placeholder="Enter re-order stock level (stock alert)"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                        : null
                                }
                                {
                                    can("view_buying_price")
                                        ?
                                        <div className="row">
                                            <div className="col s12">
                                                <NumberComponent
                                                    name="buyingPrice"
                                                    label="buying price"
                                                    placeholder="Enter buying price"
                                                />
                                            </div>
                                        </div>
                                        : null
                                }
                                {
                                    can("view_selling_price")
                                        ?
                                        <div className="row">
                                            <div className="col s12">
                                                <NumberComponent
                                                    name="sellingPrice"
                                                    label="selling price"
                                                    placeholder="Enter selling price"
                                                />
                                            </div>
                                        </div>
                                        : null
                                }
                                <div className="row">
                                    <div className="col s12">
                                        <NumberComponent
                                            name="totalAmount"
                                            label="total amount"
                                            placeholder="Enter total amount"
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <NumberComponent
                                            name="paidAmount"
                                            label="paid amount"
                                            placeholder="Enter paid amount"
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <Input
                                            name="date"
                                            type="date"
                                            label="Purchase Date"
                                            value={application.state.date}
                                            error={application.state.dateError}
                                            onChange={application.handleInputChange}
                                            max={new Date().toISOString().substring(0, 10)}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <DataListComponent
                                            for="supplier"
                                            disabled={array.hasElements(application.state.purchases)}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <Input
                                            type="text"
                                            name="invoiceNumber"
                                            label="invoice number"
                                            value={application.state.invoiceNumber}
                                            onChange={application.handleInputChange}
                                            placeholder="Enter purchase invoice number"
                                            error={application.state.invoiceNumberError}
                                            disabled={array.hasElements(application.state.purchases)}
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
                <div className="col s12 m7 l8">
                    <div className="card">
                        <CardTitle title="Purchases" />
                        <div className="card-content">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th className="sticky">{translate("product")}</th>
                                        {/* <th>{translate("supplier")}</th> */}
                                        <th className="right-align">{translate("quantity")}</th>
                                        <th className="right-align">{translate("total amount")}</th>
                                        <th className="center">{translate("remove")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderPurchases()}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td className="text-primary uppercase bold" colSpan={3}>
                                            {translate("total")}
                                        </td>
                                        <td className="right-align text-primary bold">
                                            {
                                                number.format(
                                                    application.state.purchases.map((purchase: any) => purchase.total_amount).reduce((a: number, b: number) => a + b, 0)
                                                )
                                            }
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        {
                            application.state.purchases.length > 0
                                ?
                                <div style={{ paddingTop: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                    <div className="action-button">
                                        <ActionButton
                                            to="#"
                                            tooltip="save"
                                            position="left"
                                            type="primary"
                                            icon="save"
                                            onClick={savePurchases}
                                        />
                                    </div>
                                </div>
                                : null
                        }
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
export default BulkPurchase