import React from "react"
import { createOrUpdate, readOrDelete, routerProps, serverResponse } from "../../types"
import { ApplicationContext } from "../../context"
import { can } from "../../helpers/permissions"
import { apiV1, getDate, noAccess, number, pageNotFound, setPageTitle, text } from "../../helpers"
import { ActionButton, FloatingButton } from "../../components/button"
import ListComponentFilter from "../../components/reusable/list-component-filter"
import translate from "../../helpers/translator"
import Modal from "../../components/modal"
import DataListComponent from "../../components/reusable/datalist"
import BarcodeInput from "../../components/barcode"
import NumberComponent from "../../components/reusable/number-component"
import { array, string } from "fast-web-kit"

const StockRequestList: React.FunctionComponent<routerProps> = React.memo((props: routerProps) => {

    const { application } = React.useContext(ApplicationContext)

    React.useEffect(() => {
        if (can("list_stock_request")) {
            setPageTitle("stock requests")
            onMount()
        }
        else {
            props.history.push(pageNotFound)
            application.dispatch({ notification: noAccess })
        }
        return () => application.unMount()
        // eslint-disable-next-line
    }, [])

    async function onMount(): Promise<void> {
        try {

            const joinForeignKeys = true
            const sort = JSON.stringify({ createdAt: -1 })
            application.dispatch({
                joinForeignKeys,
                schema: "request",
                collection: "requests",
            })
            const select = JSON.stringify({})
            const branchId = application.user.branch?._id
            const condition = JSON.stringify({
                $expr: {
                    $or: [
                        { $eq: ["$branch", branchId] },
                        { $eq: ["$second_branch", branchId] }
                    ]
                }
            })
            const parameters = `schema=request&condition=${condition}&select=${select}&page=1&limit=${application.state.limit}&joinForeignKeys=${joinForeignKeys}&sort=${sort}`
            const options: readOrDelete = {
                parameters,
                method: "GET",
                loading: true,
                disabled: false,
                route: apiV1 + "list"
            }
            const response: serverResponse = await application.readOrDelete(options)

            if (response.success) {
                application.dispatch({
                    order: -1,
                    sort: "created time",
                    condition: "requests",
                    limit: response.message.limit,
                    page: response.message.currentPage,
                    nextPage: response.message.nextPage,
                    requests: response.message.documents,
                    pages: response.message.totalDocuments,
                    previousPage: response.message.previousPage,
                })

            } else {
                application.dispatch({ notification: response.message })
            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    const renderList = React.useCallback(() => {
        try {

            return application.state.requests.map((request: any, index: number) => (
                <tr key={request?._id}>
                    <td data-label="#">
                        {index + 1}
                    </td>
                    <td className="text-primary sticky">
                        {text.reFormat(request?.product?.name)}
                    </td>
                    <td className="right-align">
                        {number.format(request?.quantity)}
                    </td>
                    <td>
                        {text.reFormat(request?.created_by.username)}
                    </td>
                    <td>
                        {
                            request?.updated_by
                                ?
                                text.reFormat(request?.updated_by.username)
                                : translate("n/a")
                        }
                    </td>
                    <td>
                        <span className={`badge ${request?.status === "approved" ? "success" : ((request?.status === "pending") && request?.visible) ? "primary" : "error"}`}>
                            {request?.visible ? text.reFormat(request?.status) : "Declined"}
                        </span>
                    </td>
                    <td className="center">
                        {getDate(request?.createdAt)}
                    </td>
                    <td className="center">
                        {request?.createdAt !== request?.updatedAt ? getDate(request?.updatedAt) : translate("n/a")}
                    </td>
                    {
                        can("approve_stock_request") && (request?.status === "pending") && request?.visible
                            ?
                            <td className="center sticky-right">
                                <div className="action-button">
                                    {
                                        can("approve_stock_request")
                                            ?
                                            <>
                                                <ActionButton
                                                    to="#"
                                                    icon="done_all"
                                                    type="success"
                                                    tooltip="approve"
                                                    onClick={() => {
                                                        application.dispatch({
                                                            request
                                                        })
                                                        setTimeout(() => {
                                                            application.toggleComponent("modal")
                                                        }, 500)
                                                    }}
                                                />
                                                <ActionButton
                                                    to="#"
                                                    icon="cancel"
                                                    type="error"
                                                    tooltip="delete"
                                                    onClick={() => {
                                                        application.dispatch({ ids: [request?._id] })
                                                        setTimeout(() => {
                                                            application.openDialog("deleted")
                                                        }, 100)
                                                    }}
                                                />
                                            </>
                                            : null

                                    }
                                </div>
                            </td>
                            : null
                    }
                </tr>
            ))

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
        //eslint-disable-next-line
    }, [application.state.requests])

    const validateForm = async (e: any): Promise<void> => {
        try {

            e.preventDefault()
            const errors: string[] = []
            const request = application.state.request
            const stock = number.reFormat(application.state.stock)


            if (string.isEmpty(application.state.productName)) {
                errors.push("")
                application.dispatch({ productNameError: "required" })
            }
            else if (string.isEmpty(application.state.productId)) {
                errors.push("")
                application.dispatch({ productNameError: "product does not exist" })
            }

            if (string.isEmpty(application.state.stock)) {
                errors.push("")
                application.dispatch({ stockError: "required" })
            }
            else if (stock <= 0) {
                errors.push("")
                application.dispatch({ stockError: "can't be less or equal to 0" })
            }

            if (!request) {
                errors.push("")
                application.toggleComponent("modal")
                application.dispatch({ notification: "please select request" })
            }
            else {
                if (request?.quantity > stock) {
                    errors.push("")
                    application.dispatch({ stockError: "No enough stock" })
                }
            }

            if (array.isEmpty(errors)) {

                application.toggleComponent("modal")

                const options: createOrUpdate = {
                    loading: true,
                    method: "PUT",
                    route: apiV1 + "request/approve",
                    body: {
                        stock_before: stock,
                        requestId: request?._id,
                        ...application.onUpdate,
                        second_product: application.state.productId,
                    }
                }

                const response = await application.createOrUpdate(options)

                if (response.success) {
                    application.unMount()
                    onMount()
                    application.dispatch({ notification: response.message })
                } else {
                    application.dispatch({ notification: response.message })
                }

            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    return (
        <>
            <ListComponentFilter />
            <div className="card list">
                <div className="card-content">
                    <table>
                        <thead>
                            <tr>
                                <th>{translate("#")}</th>
                                <th className="sticky">{translate("requesting product")}</th>
                                <th className="right-align">{translate("quantity")}</th>
                                <th>{translate("requested by")}</th>
                                <th>{translate("approved by")}</th>
                                <th className="center">{translate("status")}</th>
                                <th className="center">{translate("requested moment")}</th>
                                <th className="center">{translate("updated moment")}</th>
                                {
                                    can("approve_stock_request")
                                        ?
                                        <th className="center sticky-right">{translate("options")}</th>
                                        : null
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {renderList()}
                        </tbody>
                    </table>
                </div>
            </div>
            {
                can("request_stock")
                    ?
                    <FloatingButton
                        tooltip="stock request"
                        to="/stock/request"
                        icon="add_circle"
                    />
                    : null
            }
            <Modal
                buttonTitle="Approve"
                buttonAction={validateForm}
                title="Stock Request Approval Page"
                toggleComponent={application.toggleComponent}
            >
                <form action="#" onSubmit={validateForm}>
                    <div className="row">
                        <div className="col s12 m6 l6">
                            <DataListComponent
                                for="product"
                                condition={{ is_store_product: true }}
                            />
                        </div>
                        <div className="col s12 m6 l6">
                            <BarcodeInput autoFocus={false} />
                        </div>
                    </div>
                    <div className="row">
                        {
                            can("view_stock")
                                ?
                                <div className="col s12">
                                    <NumberComponent
                                        disabled
                                        name="stock"
                                        label="stock available"
                                        placeholder="Stock available"
                                    />
                                </div>
                                : null
                        }
                    </div>
                </form>
            </Modal>
        </>
    )

})

export default StockRequestList
