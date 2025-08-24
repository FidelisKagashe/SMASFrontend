import React from "react";
import { ActionButton, FloatingButton } from "../../../components/button";
import Filter from "../../../components/filter";
import Pagination from "../../../components/pagination";
import Search from "../../../components/search";
import { apiV1, commonCondition, getDate, noAccess, number, pageNotFound, setPageTitle, text } from "../../../helpers";
import { can } from "../../../helpers/permissions";
import translate from "../../../helpers/translator";
import { createOrUpdate, routerProps } from "../../../types";
import Report from "../../report/components/report";
import Invoice from "../../sale/invoice";
import { ApplicationContext } from "../../../context";
import { Link } from "react-router-dom";
import Modal from "../../../components/modal";
import { array, object } from "fast-web-kit";
import { Checkbox } from "../../../components/form";

type ListMode = "order" | "proforma" | "invoice" | "done";

const OrderList: React.FunctionComponent<routerProps> = React.memo((props: routerProps) => {
    const { application } = React.useContext(ApplicationContext);
    const [inputValues, setInputValues] = React.useState<any>({});

    React.useEffect(() => {
        if (
            can("list_order") ||
            can("list_proforma_invoice") ||
            can("list_done_proforma_invoice")
        ) {
            const pathname = props.location.pathname;
            const mode = (
                pathname.includes("proforma-done-list") ? "done" :
                pathname.includes("order-list") ? "order" :
                pathname.includes("proforma-invoice-list") ? "proforma" :
                "invoice"
            ) as ListMode;

            let title: string;
            switch (mode) {
                case "order": title = "Orders"; break;
                case "proforma": title = "Proforma Invoices"; break;
                case "invoice": title = "Invoices"; break;
                case "done": title = "Done Proforma Invoices"; break;
            }
            setPageTitle(title);

            application.dispatch({ pathname });
            onMount(mode);
        } else {
            props.history.push(pageNotFound);
            application.dispatch({ notification: noAccess });
        }

        return () => application.unMount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const { value, name }: any = event.target;
            const sale = application.state.accountData?.sales?.filter((saleData: any) => saleData._id === name)[0];

            if (sale) {
                const saleQuantity = sale.quantity;
                const userInputValue = Number(value);

                if (userInputValue <= saleQuantity) {
                    const newInputValues = {
                        ...inputValues,
                        [name]: userInputValue,
                    };
                    setInputValues(newInputValues);
                } else {
                    application.dispatch({ notification: "input quantity exceeds sale quantity" });
                }
            }
        } catch (error) {
            application.dispatch({ notification: (error as Error).message });
        }
    };

    async function onMount(type: ListMode): Promise<void> {
        try {
            let baseFilter: any;

            if (type === "done") {
            // Only filter by invoice type and visibility
            baseFilter = {
                visible: true,
                type: "invoice",
            };
            } else {
            baseFilter = { ...commonCondition(true) };
            if (props.location.state) {
                const { propsCondition }: any = props.location.state;
                if (propsCondition) {
                baseFilter = { ...baseFilter, ...propsCondition };
                application.dispatch({ propsCondition });
                }
            }
            if (type === "order") {
                baseFilter.type = "order";
            } else if (type === "proforma") {
                baseFilter.type = "proforma";
                // no status filter, since proforma in DB also lack status
            } else if (type === "invoice") {
                baseFilter.type = "invoice";
                // omit status filter for direct invoices too
            }
            }

            const sort = JSON.stringify({ createdAt: -1 });
            const condition = JSON.stringify(baseFilter);
            const select = { branch: 0, updated_by: 0, created_by: 0, updatedAt: 0, __v: 0 };
            const parameters =
            `schema=order` +
            `&condition=${condition}` +
            `&select=${JSON.stringify(select)}` +
            `&sort=${sort}` +
            `&page=${application.state.page}` +
            `&limit=${application.state.limit}` +
            `&joinForeignKeys=true`;

            application.mount({
            route: `${apiV1}list`,
            parameters,
            condition: "orders",
            sort: "createdAt",
            order: -1,
            collection: "orders",
            schema: "order",
            select,
            joinForeignKeys: true,
            fields: ["number", "reference"],
            });
        } catch (error) {
            application.dispatch({ notification: (error as Error).message });
        }
    }

    const printInvoice = (order: any, type?: string): void => {
        try {
            setPageTitle(application.state.pathname.includes("order") && !type ? "order invoice" : type ? "delivery note" : "proforma invoice");
            application.dispatch({
                sales: order.sales,
                type: type ? type : "",
                customer: order.customer,
                orderNumber: order.number,
                branch: application.user?.branch,
            });
            setTimeout(() => { window.print(); }, 1000);
        } catch (error) {
            application.dispatch({ notification: (error as Error).message });
        } finally {
            updateOrder(order._id);
        }
    };

    const renderList = () => {
        try {
            return application.state.orders.map((order: any, index: number) => (
                <tr key={order._id} onClick={() => application.selectList(order._id)}>
                    {(can("delete_order") || can("delete_proforma_invoice")) && (application.state.condition !== "deleted") ? (
                        <td data-label={translate("select")}>
                            <Checkbox
                                onChange={() => application.selectList(order._id)}
                                checked={application.state.ids.indexOf(order._id) >= 0}
                                onTable
                            />
                        </td>
                    ) : null}
                    <td data-label="#">{index + 1}</td>
                    <td data-label={translate("customer")} className="">
                        <Link to={can("view_customer") ? {
                            pathname: order.customer ? "/customer/view" : "#",
                            state: { customer: order.customer?._id },
                        } : "#"} className="bold">
                            {order.customer ? text.reFormat(order.customer.name) : translate("n/a")}
                        </Link>
                    </td>
                    <td className="right-align" data-label={translate("number")}>
                        {order.number}
                    </td>
                    <td className="right-align" data-label={translate("product")}>
                        {number.format(order.sales.length)}
                    </td>
                    <td className="right-align text-primary" data-label={translate("amount")}>
                        {number.format(
                            order.sales.map((sale: any) => sale.total_amount).reduce((a: number, b: number) => a + b, 0)
                        )}
                    </td>
                    <td className="center" data-label={translate("date")}>
                        {getDate(order.createdAt)}
                    </td>
                    <td className="center" data-label={translate("status")}>
                        <span className={`badge ${array.elementExist(order.sales.map((sale: any) => sale.status), "credit") ? "error" : "success"}`}>
                            {translate(array.elementExist(order.sales.map((sale: any) => sale.status), "credit") ? "credit" : "cash")}
                        </span>
                    </td>
                    <td className="center">
                        <span className={`badge ${order.is_verified ? "success" : "error"}`}>
                            {translate(order.is_verified ? "verified" : "not verified")}
                        </span>
                    </td>
                    {!application.state.pathname.includes("order") && (
                        <td className="center">
                            <span className={`badge ${order.verified_sales ? "success" : "warning"}`}>
                                {translate(order.verified_sales ? "confirmed" : "pending")}
                            </span>
                        </td>
                    )}
                    <td className="center">
                        <div className="action-button">
                            {(can("view_order") || can("view_proforma_invoice") || can("verify_order")) ? (
                                <>
                                    {application.state.pathname.includes("order") && !order.is_printed && (
                                        <ActionButton
                                            to="#"
                                            type="success"
                                            icon="local_shipping"
                                            position="left"
                                            tooltip="print delivery note"
                                            onClick={() => printInvoice(order, "note")}
                                        />
                                    )}
                                    {!order.is_printed && (
                                        <ActionButton
                                            to="#"
                                            type="primary"
                                            icon="print"
                                            position="left"
                                            tooltip="print"
                                            onClick={() => printInvoice(order)}
                                        />
                                    )}
                                    {can("verify_order") && !order.is_verified && application.state.pathname.includes("order") && (
                                        <ActionButton
                                            to="#"
                                            position="left"
                                            type="warning"
                                            icon="done_all"
                                            tooltip="verify order"
                                            onClick={() => {
                                                application.toggleComponent("modal");
                                                setInputValues(order.verified_sales || {});
                                                application.dispatch({ accountData: order });
                                            }}
                                        />
                                    )}
                                    {can("confirm_invoice") && !application.state.pathname.includes("order") && order.status !== "done" && !order.verified_sales && (
                                            <ActionButton
                                                to="#"
                                                position="left"
                                                type="success"
                                                icon="check_circle"
                                                tooltip="confirm invoice"
                                                onClick={() => confirmInvoice(order._id)}
                                            />
                                    )}
                                    {(can("view_order") || can("view_proforma_invoice")) ? (
                                        <ActionButton
                                            to={{
                                                pathname: application.state.pathname.includes("order") ? "/sale/order-view" : "/sale/proforma-invoice-view",
                                                state: { order: order._id },
                                            }}
                                            type="info"
                                            icon="visibility"
                                            position="left"
                                            tooltip="view"
                                        />
                                    ) : null}
                                    {can("print_tra_receipt") && !order.tra_printed && (
                                        <ActionButton
                                            to="#"
                                            type="success"
                                            icon="receipt"
                                            tooltip="print tra receipt"
                                            onClick={() => updateOrderTRAStatus(order)}
                                        />
                                    )}
                                </>
                            ) : null}
                        </div>
                    </td>
                </tr>
            ));
        } catch (error) {
            application.dispatch({ notification: (error as Error).message });
        }
    };

    const renderFilter = React.useCallback(() => {
        return (
            <Filter
                sort={application.state.sort}
                order={application.state.order}
                limit={application.state.limit}
                filter={application.filterData}
                limits={application.state.limits}
                condition={application.state.condition}
                sorts={application.getSortOrCondition("sort")}
                conditions={application.getSortOrCondition("condition")}
            />
        );
    }, [application]);

    const updateOrder = async (orderID: string) => {
        try {
            const options: createOrUpdate = {
                loading: false,
                method: "PUT",
                route: apiV1 + "update",
                body: {
                    schema: "order",
                    condition: { _id: orderID },
                    newDocumentData: {
                        $set: {
                            is_printed: true,
                        },
                    },
                },
            };

            const response = await application.createOrUpdate(options);

            if (response.success) {
                const pathname = props.location.pathname;
                const mode = pathname.includes("proforma-done-list")
                    ? "done"
                    : pathname.includes("order-list")
                    ? "order"
                    : pathname.includes("proforma-invoice-list")
                    ? "proforma"
                    : "invoice";
                onMount(mode);
            } else {
                application.dispatch({ notification: response.message });
            }
        } catch (error) {
            application.dispatch({ notification: (error as Error).message });
        }
    };

    const verifyOrder = async () => {
        try {
            if (object.isEmpty(inputValues)) {
                application.dispatch({ notification: "Please fill all fields" });
            } else {
                application.toggleComponent("modal");

                const falsyValues: boolean[] = [];
                const sales = application.state.accountData?.sales;

                for (const sale of sales) {
                    const inputQuantity = inputValues[sale._id];

                    if (inputQuantity && inputQuantity > 0) {
                        if (inputQuantity === sale.quantity) {
                            falsyValues.push(true);
                        } else {
                            falsyValues.push(false);
                        }
                    } else {
                        falsyValues.push(false);
                    }
                }

                const options: createOrUpdate = {
                    method: "PUT",
                    loading: true,
                    route: apiV1 + "update",
                    body: {
                        schema: "order",
                        condition: { _id: application.state.accountData._id },
                        newDocumentData: {
                            $set: {
                                verified_sales: inputValues,
                                is_verified: !array.hasFalsyValues(falsyValues),
                            },
                        },
                    },
                };

                const response = await application.createOrUpdate(options);

                if (response.success) {
                    if (!array.hasFalsyValues(falsyValues)) {
                        application.dispatch({ notification: "Order verified successfully" });
                    } else {
                        application.dispatch({ notification: "order has been updated" });
                    }
                    const pathname = props.location.pathname;
                    const mode = pathname.includes("proforma-done-list")
                        ? "done"
                        : pathname.includes("order-list")
                        ? "order"
                        : pathname.includes("proforma-invoice-list")
                        ? "proforma"
                        : "invoice";
                    onMount(mode);
                } else {
                    application.dispatch({ notification: response.message });
                }
            }
        } catch (error) {
            application.dispatch({ notification: (error as Error).message });
        }
    };

    const updateOrderTRAStatus = async (order: any) => {
        try {
            const body = { order: order._id };
            const options: createOrUpdate = {
                body,
                loading: true,
                method: "PUT",
                route: apiV1 + "sale/order-update",
            };

            const response = await application.createOrUpdate(options);

            if (response.success) {
                application.downloadTRAReceipt(order.number, order.sales, order.customer);
            } else {
                application.dispatch({ notification: response.message });
            }
        } catch (error) {
            application.dispatch({ notification: (error as Error).message });
        }
    };

    const confirmInvoice = async (invoiceId: string) => {
        try {
            // Get current user from application context
            const user = application.user;

            // Verify we have valid user data
            if (!user || !user._id || !user.branch) {
                throw new Error("User information is missing");
            }

            const options: createOrUpdate = {
                loading: true,
                method: "PUT",
                route: apiV1 + "order/confirm-proforma", // Correct endpoint
                body: {
                    orderId: invoiceId,
                    updated_by: user._id,   // Required by backend
                    branch: user.branch     // Required by backend
                },
                
            };

            const response = await application.createOrUpdate(options);

            if (response.success) {
                application.dispatch({ 
                    notification: "Invoice confirmed successfully" 
                });

                // Remove from current list
                const updatedOrders = application.state.orders.filter(
                    (order) => order._id !== invoiceId
                );
                application.dispatch({ orders: updatedOrders });

                // Redirect to "Done Proforma Invoice" list
                props.history.push("/sale/proforma-done-list");
                setPageTitle("Done Proforma Invoices");
                await onMount("done");
            } else {
                application.dispatch({ notification: response.message });
            }
        } catch (error) {
            application.dispatch({ 
                notification: (error as Error).message || "Confirmation failed"
            });
            console.log("Error confirming invoice:", error);
        }
    };

    const deleteOrders = async () => {
        try {
            const options: createOrUpdate = {
                loading: true,
                method: "PUT",
                body: application.state.ids,
                route: apiV1 + "order/delete",
            };

            const response = await application.createOrUpdate(options);

            if (response.success) {
                const filteredOrders = application.state.orders.filter(
                    (order: any) => !application.state.ids.includes(order?._id)
                );
                application.dispatch({ orders: filteredOrders, ids: [], notification: response.message });
            } else {
                application.dispatch({ notification: response.message });
            }
        } catch (error) {
            application.dispatch({ notification: (error as Error).message });
        }
    };

    return (
        <>
            <div className="hide-on-print">
                <Modal
                    title="order verification"
                    buttonTitle="verify order"
                    buttonAction={verifyOrder}
                    toggleComponent={application.toggleComponent}
                >
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>product</th>
                                <th className="right-align">{translate("quantity")}</th>
                                <th className="center">{translate("quantity taken")}</th>
                                <th className="right-align">{translate("remaining")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {application.state.accountData?.sales?.map((sale: any, index: number) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{text.reFormat(sale.product?.name)}</td>
                                    <td className="right-align">{number.format(sale.quantity)}</td>
                                    <td>
                                        <input
                                            min="1"
                                            type="number"
                                            id={sale._id}
                                            name={sale._id}
                                            disabled={inputValues?.[sale._id] === sale.quantity}
                                            onChange={handleInputChange}
                                            max={sale.quantity.toString()}
                                            value={inputValues?.[sale._id] || ""}
                                            style={{
                                                width: "0",
                                                height: "10px",
                                                borderRadius: 0,
                                                textAlign: "center",
                                            }}
                                        />
                                    </td>
                                    <td className="right-align">
                                        {number.format(sale.quantity - (inputValues?.[sale._id] || 0))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Modal>
                {renderFilter()}
                <div className="card list">
                    <Search
                        onChange={application.handleInputChange}
                        onClick={application.searchData}
                        value={application.state.searchKeyword}
                        refresh={async () => {
                            const pathname = props.location.pathname;
                            const mode = pathname.includes("proforma-done-list")
                                ? "done"
                                : pathname.includes("order-list")
                                ? "order"
                                : pathname.includes("proforma-invoice-list")
                                ? "proforma"
                                : "invoice";
                            await onMount(mode);
                        }}
                        select={application.selectList}
                    >
                        {application.state.ids.length > 0 &&
                        ((can("delete_order") || can("delete_proforma_invoice")) &&
                        application.state.condition !== "deleted") ? (
                            <>
                                {(can("delete_order") || can("delete_proforma_invoice")) &&
                                application.state.condition !== "deleted" ? (
                                    <ActionButton
                                        to="#"
                                        type="error"
                                        icon="delete"
                                        tooltip="delete"
                                        position="left"
                                        onClick={deleteOrders}
                                    />
                                ) : null}
                            </>
                        ) : null}
                    </Search>
                    <div className="card-content">
                        <table>
                            <thead>
                                <tr onClick={() => application.selectList()}>
                                    {(can("delete_order") || can("delete_proforma_invoice")) &&
                                    application.state.condition !== "deleted" ? (
                                        <th>
                                            <Checkbox
                                                onChange={() => application.selectList()}
                                                checked={
                                                    application.state.ids.length > 0 &&
                                                    application.state[application.state.collection]?.length ===
                                                        application.state.ids.length
                                                }
                                                onTable
                                            />
                                        </th>
                                    ) : null}
                                    <th>#</th>
                                    <th className="">{translate("customer")}</th>
                                    <th className="right-align">{translate("number")}</th>
                                    <th className="right-align">{translate("products")}</th>
                                    <th className="right-align">{translate("amount")}</th>
                                    <th className="center">{translate("date")}</th>
                                    <th className="center">{translate("status")}</th>
                                    <th className="center">{translate("verified")}</th>
                                    {!application.state.pathname.includes("order") && (
                                        <th className="center">{translate("invoice status")}</th>
                                    )}
                                    <th className="center">{translate("options")}</th>
                                </tr>
                            </thead>
                            <tbody>{renderList()}</tbody>
                        </table>
                    </div>
                    <Pagination
                        paginate={application.paginateData}
                        currentPage={application.state.page}
                        nextPage={application.state.nextPage}
                        pageNumbers={application.state.pageNumbers}
                        previousPage={application.state.previousPage}
                    />
                </div>
                {(can("create_order") || can("create_proforma_invoice")) ? (
                    <FloatingButton
                        to={
                            application.state.pathname.includes("order")
                                ? "/sale/order-form"
                                : "/sale/proforma-invoice-form"
                        }
                        tooltip={
                            application.state.pathname.includes("order")
                                ? "new order"
                                : "new proforma invoice"
                        }
                        icon="add_circle"
                    />
                ) : null}
            </div>
            <Report
                title=""
                report={application.state.pathname.includes("order") ? "order" : "proforma_invoice"}
                number={application.state.orderNumber}
                type={
                    application.state.pathname.includes("order") && application.state.type.trim() === ""
                        ? "order"
                        : application.state.type === "note"
                        ? "delivery"
                        : "invoice"
                }
                branch={application.state.branch}
                customer={application.state.customer}
            >
                <Invoice
                    sales={application.state.sales}
                    type={
                        application.state.pathname.includes("order") && application.state.type.trim() === ""
                            ? "order"
                            : application.state.type === "note"
                            ? "delivery"
                            : "invoice"
                    }
                />
            </Report>
        </>
    );
});

export default OrderList;