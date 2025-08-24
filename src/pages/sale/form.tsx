import React from "react"
import { createOrUpdate, readOrDelete, routerProps, serverResponse } from "../../types"
import { ApplicationContext } from "../../context"
import { can } from "../../helpers/permissions"
import { apiV1, noAccess, number, pageNotFound, setPageTitle, text } from "../../helpers"
import { array, string } from "fast-web-kit"
import { CardTitle } from "../../components/card"
import DataListComponent from "../../components/reusable/datalist"
import NumberComponent from "../../components/reusable/number-component"
import { Checkbox, Input, Option, Select } from "../../components/form"
import { ActionButton, Button, FloatingButton } from "../../components/button"
import translate from "../../helpers/translator"
import { Link } from "react-router-dom"
import Report from "../report/components/report"
import Invoice from "./invoice"
import Modal from "../../components/modal"
import BarcodeInput from "../../components/barcode"
import DepositOrWithdraw from "../../components/deposit_withdraw"

const SaleForm: React.FunctionComponent<routerProps> = React.memo((props: routerProps) => {

    const { application } = React.useContext(ApplicationContext)

    React.useEffect(() => {
        onMount()
        // eslint-disable-next-line
    }, [application.state.customerId])

    // get total amount
    React.useEffect(() => {
        const totalAmount = array.computeMathOperation(
            application.state.sales.map((sale) => sale.total_amount),
            "+"
        )
        application.dispatch({ totalAmount: totalAmount.toString() })
        // eslint-disable-next-line
    }, [application.state.sales])


    async function onMount(): Promise<void> {
        try {

            if (can("create_sale") || can("create_order") || can("create_proforma_invoice")) {

                const pathname = props.history.location.pathname
                let customerId: string = application.state.customerId
                let customerIsSelected = string.isNotEmpty(customerId)
                const pos = pathname.includes("invoice") ? "invoice" : pathname.includes("order") ? "order" : "cart"
                const title = pos === "cart" ? "new sale" : pos === "order" ? "new order" : "new proforma invoice"
                application.dispatch({
                    pos,
                    title,
                    date: new Date().toISOString()
                })
                setPageTitle(title)


                if (props.location.state) {

                    const { customer, product }: any = props.location.state

                    if (customer) {

                        customerIsSelected = true
                        customerId = customer._id

                        application.dispatch({
                            customer,
                            customers: [customer],
                            customerId: customer._id,
                            customerName: `${text.reFormat(customer.name)} - ${customer.phone_number}`
                        })
                    }
                    else if (product && !product.is_store_product) {
                        application.dispatch({
                            products: [product],
                            productId: product._id,
                            stock: product.stock?.toString(),
                            productName: text.reFormat(product.name),
                            buyingPrice: product.buying_price?.toString(),
                            sellingPrice: product.selling_price?.toString(),
                        })
                    }

                }

                let saleCondition = {
                    $expr: {
                        $and: [
                            { $eq: ["$visible", true] },
                            {
                                $or: [
                                    { "$eq": ["$type", "cart"] },
                                    { "$eq": ["$type", "order"] }
                                ]
                            },
                            { $eq: ["$created_by", { $toObjectId: application.user._id }] },
                            { $eq: ["$branch", { $toObjectId: application.user.branch._id }] }
                        ]
                    }
                }

                if (customerIsSelected) {
                    saleCondition = {
                        $expr: {
                            ...saleCondition.$expr,
                            $and: [
                                ...saleCondition.$expr.$and,
                                { $eq: ["$customer", { $toObjectId: customerId }] }
                            ]
                        }
                    }
                }

                const condition = JSON.stringify({
                    $expr: {
                        ...saleCondition.$expr,
                    }
                })

                const parameters: string = `condition=${condition}&branch=${application.user.branch._id}`

                // request options
                const options: readOrDelete = {
                    parameters,
                    method: "GET",
                    loading: true,
                    disabled: false,
                    route: apiV1 + "sale/cart-list"
                }

                if (customerIsSelected || (pos === "cart")) {
                    // api request
                    const response: serverResponse = await application.readOrDelete(options)

                    if (response.success) {
                        let orderCount = response.message.orderCount + 1
                        const sales = response.message.sales.message
                        const firstSale = sales[0]

                        if (firstSale) {

                            const { customer } = firstSale

                            if (customer) {
                                application.dispatch({
                                    customer,
                                    customers: [customer],
                                    customerId: customer._id,
                                    customerName: `${text.reFormat(customer.name)} - ${customer.phone_number}`
                                })
                            }

                            if (firstSale.number)
                                orderCount = Number(firstSale.number)

                        }

                        application.dispatch({
                            sales,
                            schema: "sale",
                            collection: "sales",
                            orderNumber: orderCount,
                            notification: array.isEmpty(sales) ? "No sale has been found" : "",
                            totalAmount: array.computeMathOperation(
                                sales.map((sale: any) => sale.total_amount),
                                "+"
                            ).toString()
                        })

                    }
                    else {
                            const messageType = application.state.pos === "invoice"
                                ? "proforma invoice"
                                : application.state.pos;
                            application.dispatch({ notification: `${messageType} has been saved successfully` });
                        }

                }

            }
            else {
                props.history.push(pageNotFound)
                application.dispatch({ notification: noAccess })
            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    const validateForm = async (event: React.ChangeEvent<HTMLFormElement>): Promise<void> => {
        try {

            event.preventDefault()
            const errors: string[] = []

            const userDebtLimit = application.user.debt_limit
            const userCurrentDebt = application.user.current_debt_limit
            const stock: number = number.reFormat(application.state.stock)
            const quantity: number = number.reFormat(application.state.quantity)
            const buyingPrice: number = number.reFormat(application.state.buyingPrice)
            const sellingPrice: number = number.reFormat(application.state.sellingPrice)

            // product validation
            if (string.isEmpty(application.state.productName)) {
                errors.push("")
                application.dispatch({ productNameError: "required" })
            }
            else if (string.isEmpty(application.state.productId)) {
                errors.push("")
                application.dispatch({ productNameError: "product does not exist" })
            }
            else if (buyingPrice <= 0) {
                errors.push("")
                application.dispatch({ productNameError: "update product buying price" })
            }

            // product value validation
            if (string.isNotEmpty(application.state.productId)) {

                if (string.isEmpty(application.state.quantity)) {
                    errors.push("")
                    application.dispatch({ quantityError: "required" })
                }
                else if (quantity <= 0) {
                    errors.push("")
                    application.dispatch({ quantityError: "can't be less or equal to zero" })
                }

                if (string.isEmpty(application.state.sellingPrice)) {
                    errors.push("")
                    application.dispatch({ sellingPriceError: "required" })
                }
                else if (sellingPrice <= 0) {
                    errors.push("")
                    application.dispatch({ sellingPriceError: "can't be less or equal to zero" })
                }

                if (application.state.pos !== "invoice") {

                    if (string.isEmpty(application.state.stock)) {
                        errors.push("")
                        application.dispatch({ stockError: "required" })
                    }
                    else if ((stock <= 0) || (quantity > stock)) {
                        errors.push("")
                        application.dispatch({ stockError: "no enough stock" })
                    }

                }

            }

            if (userDebtLimit > 0 && (application.state.status === "credit")) {
                const total_amount = quantity * sellingPrice
                if ((total_amount + userCurrentDebt) > userDebtLimit) {
                    errors.push("")
                    application.dispatch({ notification: "You have reached your debt limit" })
                }
            }

            // customer validation
            if ((application.state.pos !== "cart") || (application.state.status === "credit")) {

                if (string.isEmpty(application.state.customerName)) {
                    errors.push("")
                    application.dispatch({ customerNameError: "required" })
                }
                else if (string.isEmpty(application.state.customerId)) {
                    errors.push("")
                    application.dispatch({ customerNameError: "customer does not exist" })
                }
            }

            if ((sellingPrice - buyingPrice) < 0) {
                errors.push("")
                application.dispatch({ sellingPriceError: "can't sell on loss" })
            }

            if (array.isEmpty(errors)) {

                const sale = {
                    quantity,
                    ...application.onCreate,
                    selling_price: sellingPrice,
                    product: application.state.productId,
                    order_number: application.state.orderNumber,
                    type: application.state.pos === "cart" ? "cart" : "order",
                    status: application.state.pos === "invoice" ? "invoice" : application.state.status,
                    customer: string.isNotEmpty(application.state.customerId) ? application.state.customerId : null,
                    createdAt: application.state.date ? new Date(application.state.date).toISOString() : new Date().toISOString(),
                }

                // request options
                const options: createOrUpdate = {
                    body: sale,
                    loading: true,
                    method: "POST",
                    route: apiV1 + "sale/add-to-cart"
                }

                const response: serverResponse = await application.createOrUpdate(options)


                if (response.success) {
                    application.dispatch({
                        stock: "",
                        barcode: "",
                        products: [],
                        quantity: "",
                        position: "",
                        product: null,
                        productId: "",
                        categoryId: "",
                        productName: "",
                        buyingPrice: "",
                        sellingPrice: "",
                        reorderStockLevel: "",
                        notification: "Product has been added to cart",
                        sales: [response.message, ...application.state.sales],
                    })
                }
                else
                    application.dispatch({ notification: response.message })
            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    const removeFromCart = async (id?: string): Promise<void> => {
        try {
            // build request options
            const options: createOrUpdate = {
                loading: true,
                method: "POST",
                route: apiV1 + "sale/remove-from-cart",
                body: id
                    ? [{ id, ...application.onUpdate }]
                    : application.state.ids.map((cartId: string) => ({ id: cartId, ...application.onUpdate }))
            };

            // perform API call
            const response: serverResponse = await application.createOrUpdate(options);

            if (response.success) {
                // compute updated sales list
                const newList = id
                    ? application.state.sales.filter((sale: any) => sale._id !== id)
                    : application.state.sales.filter((sale: any) => !application.state.ids.includes(sale._id));

                // dispatch updates based on single vs. bulk remove
                if (id) {
                    application.dispatch({
                        sales: newList,
                        secondAccounts: [],
                        secondAccount: "",
                        secondAccountData: null
                    });
                } else {
                    application.dispatch({
                        sales: newList
                    });
                }

                // notify user
                const messagePrefix = id ? "Product has" : "Products have";
                application.dispatch({
                    notification: `${messagePrefix} been removed from cart`,
                    ids: []
                });
            } else {
                application.dispatch({ notification: response.message });
            }
        } catch (error) {
            application.dispatch({ notification: (error as Error).message });
        }
    };


    const renderSales = React.useCallback(() => {
        try {

            return array.sort(application.state.sales, "desc", "_id").map((sale: any, index: number) => (
                <tr key={sale._id}>
                    <td data-label={translate("select")}>
                        <Checkbox
                            onTable
                            onChange={() => application.selectList(sale._id)}
                            checked={array.elementExist(application.state.ids, sale._id)}
                        />
                    </td>
                    <td data-label="#">{index + 1}</td>
                    <td className="" data-label={translate("product")}>
                        <Link
                            to={{
                                state: { product: sale.product._id },
                                pathname: can("view_product") ? "/product/view" : "#"
                            }}
                        >
                            {text.reFormat(sale.product.name)}
                        </Link>
                    </td>
                    <td className="center" data-label={translate("quantity")}>
                        <input
                            min="1"
                            type="number"
                            id={sale._id}
                            name={sale._id}
                            onBlur={quantityChange}
                            defaultValue={sale.quantity}
                            style={{
                                width: "0",
                                height: "10px",
                                borderRadius: 0,
                                textAlign: "center"
                            }}
                            data-position="left"
                            data-tooltip={number.format(sale.quantity)}
                        />
                    </td>
                    <td className="right-align" data-label={translate("amount")}>
                        <span className={`text-${sale.status === "credit" ? "error" : "primary"}`}>
                            {number.format(sale.total_amount)}
                        </span>
                    </td>
                    <td className="center">
                        <div className="action-button">
                            <ActionButton
                                to="#"
                                type="error"
                                icon="delete"
                                position="left"
                                tooltip="remove"
                                onClick={() => removeFromCart(sale._id)}
                            />
                        </div>
                    </td>
                </tr>
            ))

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
        // eslint-disable-next-line
    }, [application.state.sales, application.state.ids])

    const quantityChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        try {

            const { name, value } = event.target
            const newQuantity = Number(value)

            if (newQuantity >= 1) {
                const sale = application.state.sales.filter((saleData: any) => saleData._id === name)[0]
                if (sale && (sale.quantity !== newQuantity)) {
                    const productOldStock = sale.quantity + sale.product.stock
                    if (newQuantity <= productOldStock) {

                        const options: createOrUpdate = {
                            route: apiV1 + "sale/change-quantity",
                            method: "POST",
                            loading: true,
                            body: {
                                _id: sale._id,
                                quantity: newQuantity,
                                ...application.onUpdate
                            }
                        }

                        const response: serverResponse = await application.createOrUpdate(options)


                        if (response.success) {

                            const newSales = [response.message, ...application.state.sales.filter((saleData: any) => saleData._id !== sale._id)]

                            application.dispatch({
                                sales: newSales,
                            })

                            const field: any = document.getElementById(sale._id)

                            if (field) {
                                field.value = ""
                            }

                        }
                        else {
                            onMount()
                            application.dispatch({ notification: response.message })
                        }

                    }
                    else {
                        application.dispatch({ notification: "no enough stock" })
                    }
                }
            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    // saving cart
    const saveSales = async (printTra?: boolean): Promise<void> => {
        try {

            const options: createOrUpdate = {
                loading: true,
                method: "POST",
                route: apiV1 + "sale/save",
                body: {
                    printTra,
                    ...application.onUpdate,
                    number: application.state.orderNumber,
                    sales: application.state.sales.map((sale) => (sale._id)),
                    customer: string.isNotEmpty(application.state.customerId) ? application.state.customerId : null,
                }
            }

            const response = await application.createOrUpdate(options)

            if (response.success) {
                if (printTra) {
                    application.downloadTRAReceipt(application.state.orderNumber.toString())
                } else {
                    application.unMount()
                    application.dispatch({ notification: response.message })
                }
            }
            else
                application.dispatch({ notification: response.message })


        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    // print receipt
    const printReceipt = (): void => {
        try {

            let title = application.state.pos === "cart" || application.state.pos === "order" ? `order_invoice` : "proforma_invoice"
            const customerName = string.isNotEmpty(application.state.customerName) ?
                application.state.customerName.split("-")[0]
                : null
            title = text.format(`${customerName ? `${customerName}` : ""}${title} ${application.state.orderNumber}`)

            document.title = title
            window.print()

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    async function loadCustomerData(): Promise<void> {
        try {

            if (string.isNotEmpty(application.state.customerId)) {

                const options: readOrDelete = {
                    method: "GET",
                    loading: true,
                    disabled: false,
                    parameters: `customer=${application.state.customerId}`,
                    route: apiV1 + "sale/customer-data"
                }


                const response: serverResponse = await application.readOrDelete(options)

                if (response.success) {
                    const { sales, debts } = response.message
                    application.dispatch({
                        debt: debts ? debts[0] : { paid_amount: 0, remain_amount: 0, total_amount: 0 },
                        sale: sales ? sales[0] : { total_sales: 0 }
                    })
                }
            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    return (
        <>
            <div className="row hide-on-print">
                <div className="col s12 m5 l4">
                    <div className="card">
                        <CardTitle title={application.state.title} />
                        <div className="card-content">
                            <form action="#" onSubmit={validateForm}>
                                <div className="row">
                                    <div className="col s12">
                                        <DataListComponent
                                            for="customer"
                                            disabled={!array.isEmpty(application.state.sales) && string.isNotEmpty(application.state.customerId)}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <DataListComponent
                                            for="product"
                                            condition={{ is_store_product: false }}
                                        />
                                    </div>
                                </div>
                                {
                                    can("view_barcode")
                                        ?
                                        <div className="row">
                                            <div className="col s12">
                                                <BarcodeInput autoFocus />
                                            </div>
                                        </div>
                                        : null
                                }
                                {
                                    can("view_stock")
                                        ?
                                        <div className="row">
                                            <div className="col s12">
                                                <NumberComponent
                                                    disabled
                                                    name="stock"
                                                    label="stock available"
                                                    placeholder="stock available"
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
                                                    placeholder="enter selling price"
                                                    disabled={!can("adjust_selling_price")}
                                                />
                                            </div>
                                        </div>

                                        : null
                                }

                                <div className="row">
                                    <div className="col s12">
                                        <NumberComponent
                                            name="quantity"
                                            label="quantity"
                                            placeholder="enter quantity"
                                        />
                                    </div>
                                </div>

                                {
                                    application.state.pos !== "invoice"
                                        ?
                                        <div className="row">
                                            <div className="col s12">
                                                <Select
                                                    name="status"
                                                    label="status"
                                                    value={application.state.status}
                                                    error={application.state.statusError}
                                                    onChange={application.handleInputChange}
                                                >
                                                    <Option label="Cash" value="cash" />
                                                    <Option label="Credit" value="credit" />
                                                </Select>
                                            </div>
                                        </div>
                                        : null

                                }
                                {
                                    can("back_date_sale")
                                        ?
                                        <div className="row">
                                            <div className="col s12">
                                                <Input
                                                    type="datetime-local"
                                                    name="date"
                                                    label="date"
                                                    placeholder="Enter date"
                                                    value={application.state.date}
                                                    error={application.state.dateError}
                                                    onChange={application.handleInputChange}
                                                    max={new Date().toISOString().substring(0, 10)}
                                                />
                                            </div>
                                        </div>
                                        : null
                                }
                                {
                                    can("view_account") &&
                                    <div className="row">
                                        <div className="col s12">
                                            <DepositOrWithdraw type="deposit" />
                                        </div>
                                    </div>
                                }
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
                        <div className="card-content">
                            <table>
                                <caption className="text-primary">
                                    <span>{translate("Customer Buying Items")}</span>&nbsp;-&nbsp;
                                    <span>
                                        {number.format(application.state.totalAmount)}
                                    </span>
                                </caption>
                                <thead>
                                    <tr onClick={() => application.selectList()}>
                                        <th>
                                            <Checkbox
                                                onTable
                                                onChange={() => application.selectList()}
                                                checked={(application.state.ids.length > 0) && (application.state[application.state.collection]?.length === application.state.ids.length)}
                                            />
                                        </th>
                                        <th>#</th>
                                        <th className="">{translate("product")}</th>
                                        <th className="center">{translate("quantity")}</th>
                                        <th className="right-align">{translate("amount")}</th>
                                        <th className="center">{translate("remove")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderSales()}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td>
                                            <span className="bold text-primary uppercase">{translate("total")}</span>
                                        </td>
                                        <td colSpan={2}></td>
                                        <td className="center">
                                            <span className="bold">
                                                {
                                                    number.format(
                                                        array.computeMathOperation(
                                                            application.state.sales.map((sale: any) => sale.quantity),
                                                            "+"
                                                        )
                                                    )
                                                }
                                            </span>
                                        </td>
                                        <td className="right-align">
                                            <span className="bold text-primary">
                                                {number.format(application.state.totalAmount)}
                                            </span>
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div style={{ paddingTop: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                            <div className="action-button">
                                {
                                    string.isNotEmpty(application.state.customerId)
                                        ?
                                        <ActionButton
                                            to="#"
                                            tooltip={`View customer details`}
                                            position="left"
                                            type="warning"
                                            icon="person"
                                            onClick={async () => {
                                                await loadCustomerData()
                                                application.toggleComponent("modal")
                                            }}
                                        />
                                        : null
                                }
                                {
                                    application.state.sales.length > 0
                                        ?
                                        <>
                                            <ActionButton
                                                to="#"
                                                tooltip="print"
                                                position="left"
                                                type="info"
                                                icon="print"
                                                onClick={printReceipt}
                                            />
                                            <ActionButton
                                                to="#"
                                                tooltip="save"
                                                position="left"
                                                type="primary"
                                                icon="save"
                                                onClick={() => saveSales(false)}
                                            />
                                            {
                                                can("print_tra_receipt") &&
                                                <ActionButton
                                                    to="#"
                                                    tooltip="print tra receipt"
                                                    position="left"
                                                    type="success"
                                                    icon="receipt"
                                                    onClick={() => {
                                                        saveSales(true)
                                                    }}
                                                />
                                            }
                                            {
                                                application.state.ids.length > 0
                                                    ?
                                                    <ActionButton
                                                        to="#"
                                                        tooltip="remove"
                                                        position="left"
                                                        type="error"
                                                        icon="delete"
                                                        onClick={() => removeFromCart()}
                                                    />
                                                    : null
                                            }
                                        </>
                                        : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                can("list_sale") || can("list_order") || can("list_proforma_invoice")
                    ?
                    <FloatingButton
                        to={application.state.pos === "cart" ? "/sale/list" : application.state.pos === "order" ? "/sale/order-list" : "/sale/proforma-invoice-list"}
                        tooltip={`list ${application.state.pos === "cart" ? "sales" : application.state.pos}`}
                        icon="list_alt"
                    />
                    : null
            }

            <Report
                title=""
                report="sales"
                number={application.state.orderNumber}
                type={application.state.pos}
                branch={application.user.branch}
                customer={application.state.customerId ? application.state.customer : null}
            >
                <Invoice sales={application.state.sales} type={application.state.pos} />
            </Report>
            <Modal
                buttonTitle="continue"
                title={application.state.customerName}
                toggleComponent={application.toggleComponent}
                buttonAction={() => application.toggleComponent("modal")}
            >
                <div className="customer-data">
                    <h2 className="text-error">Debts</h2>
                    <div className="debts">
                        <div className="debt-item">
                            <span>Total Amount:</span>
                            <span className="total-amount text-primary semibold">&nbsp;{number.format(application.state.debt?.total_amount)}</span>
                        </div>
                        <div className="debt-item">
                            <span>Paid Amount:</span>
                            <span className="paid-amount text-success semibold">&nbsp;{number.format(application.state.debt?.paid_amount)}</span>
                        </div>
                        <div className="debt-item">
                            <span>Remaining Amount:</span>
                            <span className="remain-amount text-error semibold">&nbsp;{number.format(application.state.debt?.remain_amount)}</span>
                        </div>
                    </div>
                    <h2 className="text-success">Sales</h2>
                    <div className="sales">
                        <div className="sales-item">
                            <span>Total Sales Contribution:</span>
                            <span className="total-sales text-success semibold">&nbsp;{number.format(application.state.sale?.total_sales)}</span>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
})

export default SaleForm