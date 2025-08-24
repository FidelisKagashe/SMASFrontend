// dependencies
import React from "react"
import { ActionButton } from "../../components/button"
import Pagination from "../../components/pagination"
import Search from "../../components/search"
import { apiV1, commonCondition, getDate, noAccess, number, pageNotFound, setPageTitle, text } from "../../helpers"
import { can } from "../../helpers/permissions"
import translate from "../../helpers/translator"
import { createOrUpdate, routerProps } from "../../types"
import { ApplicationContext } from "../../context"
import { Link } from "react-router-dom"
import ListComponentFilter from "../../components/reusable/list-component-filter"
import { Checkbox } from "../../components/form"

// sale list memorized function component
const SaleList: React.FunctionComponent<routerProps> = React.memo((props: routerProps) => {

    // application context
    const { application } = React.useContext(ApplicationContext)

    // component mounting
    React.useEffect(() => {

        if (can("list_sale")) {
            setPageTitle("sales")
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

    async function onMount(): Promise<void> {
        try {

            // creating initial condition
            let initialCondition: object = commonCondition(true)

            // checking if condition has been passed from other components
            if (props.location.state) {
                const { propsCondition }: any = props.location.state
                if (propsCondition) {
                    initialCondition = { ...initialCondition, ...propsCondition }
                    application.dispatch({ propsCondition })
                }
            }

            // parameters, sort, condition, select and foreign key
            const sort: string = JSON.stringify({ createdAt: -1 })
            const condition: string = JSON.stringify({ ...initialCondition, type: "sale", status: { $ne: "invoice" }, fake: { $ne: true} })
            const select: object = {
                type: 0,
                branch: 0,
                stock_before: 0,
                stock_after: 0,
                created_by: 0,
                updated_by: 0,
                updatedAt: 0,
                __v: 0,
                use_customer_account: 0,
                account: 0,
                category: 0,
                reference: 0,
                disabled: 0,
                number: 0,
            }
            const joinForeignKeys: boolean = true
            const parameters: string = `schema=sale&condition=${condition}&select=${JSON.stringify(select)}&sort=${sort}&page=${application.state.page}&limit=${application.state.limit}&joinForeignKeys=${joinForeignKeys}`

            // making api request
            application.mount({
                route: `${apiV1}list`,
                parameters,
                condition: "sales",
                sort: "createdAt",
                order: -1,
                collection: "sales",
                schema: "sale",
                select,
                joinForeignKeys,
                fields: ["reference"]
            })

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    const renderList = React.useCallback(() => {
        try {
            return application.state.sales.map((sale: any, index: number) => (
                <tr key={sale?._id} onClick={() => application.selectList(sale?._id)}>
                    {
                        can("delete_sale") && (application.state.condition !== "deleted")
                            ? <td data-label={translate("select")}>
                                <Checkbox
                                    onChange={() => application.selectList(sale?._id)}
                                    checked={application.state.ids.indexOf(sale?._id) >= 0}
                                    onTable
                                />
                            </td>
                            : null
                    }
                    <td data-label="#">{index + 1}</td>
                    <td data-label={translate("product")} className="sticky">
                        <Link to={can("view_product") ? {
                            pathname: "/product/view",
                            state: { product: sale?.product?._id }
                        } : "#"} className="bold">
                            {text.reFormat(sale?.product?.name)}&nbsp;{sale?.category ? `(${text.reFormat(sale?.category?.name)})` : null}
                        </Link>
                    </td>
                    <td className="right-align" data-label={translate("quantity")}>
                        {number.format(sale?.quantity)}
                    </td>
                    {
                        can("view_buying_price")
                            ?
                            < td className="right-align" data-label={translate("buying price")}>
                                {number.format(sale?.total_amount - sale?.profit)}
                            </td>
                            : null
                    }
                    <td className="right-align text-primary" data-label={translate("selling price")}>
                        {number.format(sale?.total_amount)}
                    </td>
                    {
                        can("view_profit")
                            ?
                            < td className="right-align text-success" data-label={translate("profit")}>
                                {sale?.profit > 0 ? number.format(sale?.profit) : 0}
                            </td>
                            : null
                    }
                    {
                        can("view_discount")
                            ?
                            < td className="right-align text-warning" data-label={translate("discount")}>
                                {sale?.discount > 0 ? number.format(sale?.discount) : 0}
                            </td>
                            : null
                    }
                    {
                        can("view_loss")
                            ?
                            < td className="right-align text-error" data-label={translate("loss")}>
                                {sale?.profit < 0 ? number.format(sale?.profit * -1) : 0}
                            </td>
                            : null
                    }
                    <td className="center" data-label={translate("status")}>
                        <span className={`badge ${sale?.status === "cash" ? "success" : "error"}`} data-tooltip={sale?.customer ? text.reFormat(sale?.customer.name) : ""}>
                            {translate(sale?.status)}
                        </span>
                    </td>
                    <td className="center" data-label={translate("date")}>
                        {getDate(sale?.createdAt)}
                    </td>
                    {
                        can("view_sale")
                            ?
                            <td className="sticky-right">
                                <div className="action-button">
                                    <ActionButton
                                        to={{
                                            pathname: "/sale/view",
                                            state: { sale: sale?._id }
                                        }}
                                        type="info"
                                        icon="visibility"
                                        position="left"
                                        tooltip="view"
                                    />
                                </div>
                            </td>
                            : null
                    }
                </tr>
            ))
        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
        // eslint-disable-next-line
    }, [application.state.ids, application.state.sales])

    async function deleteSales() {
        try {

            const options: createOrUpdate = {
                loading: true,
                method: "PUT",
                body: application.state.ids,
                route: apiV1 + "sale/delete"
            }

            const response = await application.createOrUpdate(options)

            if (response.success) {

                const filteredSales = application.state.sales.filter(sale => !application.state.ids.includes(sale?._id))

                application.dispatch({ sales: filteredSales, ids: [], notification: response.message })

            } else {
                application.dispatch({ notification: response.message })
            }

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
    }

    return (
        <>
            <ListComponentFilter />
            <div className="card list">
                <Search
                    refresh={onMount}
                    select={application.selectList}
                    onClick={application.searchData}
                    value={application.state.searchKeyword}
                    onChange={application.handleInputChange}
                >
                    {
                        application.state.ids.length > 0 && (can("delete_sale") && (application.state.condition !== "deleted"))
                            ?
                            <>
                                {
                                    can("delete_sale") && (application.state.condition !== "deleted")
                                        ?
                                        <ActionButton
                                            to="#"
                                            type="error"
                                            icon="delete"
                                            tooltip="delete"
                                            position="left"
                                            onClick={deleteSales}
                                        />
                                        : null
                                }
                            </>
                            : null
                    }
                </Search>
                <div className="card-content">
                    <table>
                        <thead>
                            <tr onClick={() => application.selectList()}>
                                {
                                    can("delete_sale") && (application.state.condition !== "deleted")
                                        ?
                                        <th>
                                            <Checkbox
                                                onChange={() => application.selectList()}
                                                checked={(application.state.ids.length > 0) && (application.state[application.state.collection]?.length === application.state.ids.length)}
                                                onTable
                                            />
                                        </th>
                                        : null

                                }
                                <th>#</th>
                                <th className="sticky">{translate("product")}</th>
                                <th className="right-align">{translate("quantity")}</th>
                                {
                                    can("view_buying_price")
                                        ? <th className="right-align">{translate("buying price")}</th>
                                        : null
                                }
                                <th className="right-align">{translate("selling price")}</th>
                                {
                                    can("view_profit")
                                        ? <th className="right-align">{translate("profit")}</th>
                                        : null
                                }
                                {
                                    can("view_discount")
                                        ? <th className="right-align">{translate("discount")}</th>
                                        : null
                                }
                                {
                                    can("view_loss")
                                        ? <th className="right-align">{translate("loss")}</th>
                                        : null
                                }
                                <th className="center">{translate("status")}</th>
                                <th className="center">{translate("date")}</th>
                                {
                                    can("view_sale")
                                        ? <th className="center sticky-right">{translate("options")}</th>
                                        : null

                                }
                            </tr>
                        </thead>
                        <tbody>
                            {renderList()}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={4}>
                                    <span className="uppercase bold text-primary">
                                        {translate("total")}
                                    </span>
                                </td>
                                {
                                    can("view_buying_price")
                                        ?
                                        <td className="right-align bold" data-label={translate("buying price")}>
                                            {
                                                number.format(
                                                    application.state.sales
                                                        .map((sale: any) => sale?.total_amount - sale?.profit)
                                                        .reduce((a: number, b: number) => a + b, 0)
                                                )
                                            }
                                        </td>
                                        : null
                                }
                                <td className="right-align bold text-primary" data-label={translate("selling price")}>
                                    {
                                        number.format(
                                            application.state.sales
                                                .map((sale: any) => sale?.total_amount)
                                                .reduce((a: number, b: number) => a + b, 0)
                                        )
                                    }
                                </td>
                                {
                                    can("view_profit")
                                        ?
                                        <td className="right-align bold text-success" data-label={translate("profit")}>
                                            {
                                                number.format(
                                                    application.state.sales
                                                        // .filter((sale: any) => sale?.profit > 0)
                                                        .map((sale: any) => sale?.profit)
                                                        .reduce((a: number, b: number) => a + b, 0)
                                                )
                                            }
                                        </td>
                                        : null
                                }
                                {
                                    can("view_discount")
                                        ?
                                        <td className="right-align bold text-warning" data-label={translate("discount")}>
                                            {
                                                number.format(
                                                    application.state.sales
                                                        .filter((sale: any) => sale?.discount > 0)
                                                        .map((sale: any) => sale?.discount)
                                                        .reduce((a: number, b: number) => a + b, 0)
                                                )
                                            }
                                        </td>
                                        : null
                                }
                                {
                                    can("view_loss")
                                        ?
                                        <td className="right-align bold text-error" data-label={translate("loss")}>
                                            {
                                                number.format(
                                                    application.state.sales
                                                        .filter((sale: any) => sale?.profit < 0)
                                                        .map((sale: any) => sale?.profit * -1)
                                                        .reduce((a: number, b: number) => a + b, 0)
                                                )
                                            }
                                        </td>
                                        : null
                                }
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
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
            {/* {
                can("create_sale")
                    ? <FloatingButton to="/sale/form" tooltip="new sale" />
                    : null
            } */}
        </>
    )

})

// export component
export default SaleList