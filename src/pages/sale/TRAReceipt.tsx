import React from "react"
import { createOrUpdate, routerProps } from "../../types"
import { ApplicationContext } from "../../context"
import { can } from "../../helpers/permissions"
import { apiV1, noAccess, number, pageNotFound, setPageTitle } from "../../helpers"
import { CardTitle } from "../../components/card"
import NumberComponent from "../../components/reusable/number-component"
import { array, string } from "fast-web-kit"
import { Button } from "../../components/button"
import DataListComponent from "../../components/reusable/datalist"

const PrintTRAReceipt: React.FunctionComponent<routerProps> = React.memo((props) => {

    const { application } = React.useContext(ApplicationContext)
    const { state, dispatch } = application

    React.useEffect(() => {
        onMount()
        return () => application.unMount()
        // eslint-disable-next-line
    }, [])

    const onMount = () => {
        try {
            setPageTitle("generate TRA receipt")
            if (!can("print_tra_receipt")) {
                props.history.push(pageNotFound)
                dispatch({ notification: noAccess })
            }
        } catch (error) {
            dispatch({ notification: (error as Error).message })
        }
    }

    const validateForm = async (event: React.ChangeEvent<HTMLFormElement>) => {
        try {

            event.preventDefault()
            const errors: string[] = []
            const quantity = number.reFormat(state.quantity)
            const totalAmount = number.reFormat(state.totalAmount)

            if (string.isEmpty(state.totalAmount)) {
                errors.push("")
                dispatch({ totalAmountError: "required" })
            } else if (totalAmount <= 0) {
                errors.push("")
                dispatch({ totalAmountError: "can't be less or equal to 0" })
            }

            if (string.isEmpty(state.quantity)) {
                errors.push("")
                dispatch({ quantityError: "required" })
            } else if (quantity <= 0) {
                errors.push("")
                dispatch({ quantityError: "can't be less or equal to 0" })
            }

            if (array.isEmpty(errors)) {

                const body = {
                    profit: 0,
                    fake: true,
                    type: "sale",
                    status: "cash",
                    tra_printed: true,
                    ...application.onCreate,
                    quantity: state.quantity,
                    total_amount: totalAmount,
                    customer: state.customerId ? state.customerId : null,
                }
                const options: createOrUpdate = {
                    body: {
                        schema: "sale",
                        documentData: body
                    },
                    loading: true,
                    method: "POST",
                    route: apiV1 + "create"
                }

                const response = await application.createOrUpdate(options)

                if (response.success) {
                    application.downloadTRAReceipt("#", [response.message], response.message.customer)
                } else {
                    dispatch({ notification: response.message})
                }
            }

        } catch (error) {
            dispatch({ notification: (error as Error).message })
        }
    }

    return (
        <React.Fragment>
            <div className="row">
                <div className="col s12 m8 l8 offset-m2 offset-l2">
                    <div className="card">
                        <CardTitle title="New amount" />
                        <div className="card-content">
                            <form action="#" onSubmit={validateForm}>
                                <div className="row">
                                    <div className="col s12">
                                        <DataListComponent for="customer" />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <NumberComponent
                                            name="quantity"
                                            label="quantity"
                                            placeholder="enter quantity"
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <NumberComponent
                                            name="totalAmount"
                                            label="total amount"
                                            placeholder="enter total amount"
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12 center">
                                        <Button
                                            title="print report"
                                            loading={state.loading}
                                            disabled={state.disabled}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
})

export default PrintTRAReceipt