import React from "react"
import { createOrUpdate, routerProps, serverResponse, stateKey } from "../../types"
import { CardTitle } from "../../components/card"
import { ApplicationContext } from "../../context"
import { can } from "../../helpers/permissions"
import { apiV1, noAccess, number, pageNotFound, setPageTitle } from "../../helpers"
import { Button, FloatingButton } from "../../components/button"
import { Option, Select } from "../../components/form"
import DataListComponent from "../../components/reusable/datalist"
import BarcodeInput from "../../components/barcode"
import NumberComponent from "../../components/reusable/number-component"
import { array, string } from "fast-web-kit"

const StockRequest: React.FunctionComponent<routerProps> = React.memo((props: routerProps) => {

    const { application } = React.useContext(ApplicationContext)

    React.useEffect(() => {
        if (can("request_stock")) {
            setPageTitle("stock request")
        }
        else {
            props.history.push(pageNotFound)
            application.dispatch({ notification: noAccess })
        }
        return () => application.unMount()
        // eslint-disable-next-line
    }, [])

    const validateForm = async (event: React.ChangeEvent<HTMLFormElement>): Promise<void> => {
        try {

            event.preventDefault()
            const errors: string[] = []
            const requestFrom = application.state.type
            const quantity = number.reFormat(application.state.quantity)

            if (string.isEmpty(application.state.productName)) {
                errors.push("")
                application.dispatch({ productNameError: "required" })
            }
            else if (string.isEmpty(application.state.productId)) {
                errors.push("")
                application.dispatch({ productNameError: "product does not exist" })
            }

            if (string.isEmpty(application.state.quantity)) {
                errors.push("")
                application.dispatch({ quantityError: "required" })
            }
            else if (quantity <= 0) {
                errors.push("")
                application.dispatch({ quantityError: "can't be less or equal to 0" })
            }


            if (string.isEmpty(requestFrom)) {
                errors.push("")
                application.dispatch({ typeError: "required" })
            }
            else {
                if (requestFrom === "branch") {
                    if (string.isEmpty(application.state.branchName)) {
                        errors.push("required")
                        application.dispatch({ branchNameError: "required" })
                    }
                    else if (string.isEmpty(application.state.branchId)) {
                        errors.push("")
                        application.dispatch({ branchNameError: "Branch does not exist" })
                    }
                }

                if (requestFrom === "store") {
                    if (string.isEmpty(application.state.storeName)) {
                        errors.push("required")
                        application.dispatch({ storeNameError: "required" })
                    }
                    else if (string.isEmpty(application.state.storeId)) {
                        errors.push("")
                        application.dispatch({ storeNameError: "store does not exist" })
                    }
                }
            }


            if (array.isEmpty(errors)) {

                const request = {
                    quantity,
                    ...application.onCreate,
                    product: application.state.productId,
                    store: string.isNotEmpty(application.state.storeId) ? application.state.storeId : null,
                    second_branch: string.isNotEmpty(application.state.branchId) ? application.state.branchId : null,
                }

                const options: createOrUpdate = {
                    method: "POST",
                    loading: true,
                    route: apiV1 + "create",
                    body: {
                        schema: "request",
                        documentData: request
                    }
                }

                const response: serverResponse = await application.createOrUpdate(options)

                if (response.success) {
                    application.unMount()
                    application.dispatch({ notification: "Request has been submitted" })
                }
                else {
                    application.dispatch({ notification: response.message })
                }

            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    return (
        <div className="row">
            <div className="col s12 m10 l8 offset-m1 offset-l2">
                <div className="card">
                    <CardTitle title="stock request" />
                    <div className="card-content">
                        <form action="#" onSubmit={validateForm}>
                            <div className="row">
                                <div className={`col s12 ${string.isNotEmpty(application.state.type) ? "m6 l6" : ""}`}>
                                    <Select
                                        name="type"
                                        label="request from"
                                        value={application.state.type}
                                        error={application.state.typeError}
                                        onChange={application.handleInputChange}
                                    >
                                        <Option label="select request from" value="" />
                                        <Option label="Branch" value="branch" />
                                        <Option label="Store" value="store" />
                                    </Select>
                                </div>
                                {
                                    string.isNotEmpty(application.state.type)
                                        ?
                                        <div className="col s12 m6 l6">
                                            <DataListComponent
                                                for={application.state.type as stateKey}
                                            />
                                        </div>
                                        : null
                                }
                            </div>
                            <div className="row">
                                <div className="col s12 m6 l6">
                                    <DataListComponent for="product" condition={{ is_store_product: false }} />
                                </div>
                                <div className="col s12 m6 l6">
                                    <BarcodeInput autoFocus={false} />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col s12 m6 l6">
                                    <NumberComponent
                                        name="quantity"
                                        label="Quantity to request"
                                        placeholder="enter requesting quantity"
                                    />
                                </div>
                                {
                                    can("view_stock")
                                        ?
                                        <div className="col s12 m6 l6">
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
                            <div className="row">
                                <div className="col center s12">
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

            {
                can("list_stock_request")
                    ?
                    <FloatingButton
                        tooltip="list stock request"
                        to="/stock/request-list"
                        icon="list_alt"
                    />
                    : null
            }
        </div>
    )

})

export default StockRequest