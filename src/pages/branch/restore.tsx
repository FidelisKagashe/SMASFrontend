import React, { useContext } from "react"
import { routerProps } from "../../types"
import { Input } from "../../components/form";
import { Button } from "../../components/button";
import { ApplicationContext } from "../../context";
import { apiV1, serverURL, setPageTitle } from "../../helpers";

const Restore: React.FunctionComponent<routerProps> = React.memo(() => {

    React.useEffect(() => {
        setPageTitle("restore backup")
        // eslint-disable-next-line
    }, [])

    const [file, setFile] = React.useState<any>(null);
    const { application } = useContext(ApplicationContext)

    const handleFileChange = (e: any) => {
        setFile(e.target.files[0]);
    };

    const validateForm = async () => {
        try {
            application.dispatch({ loading: true })

            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                const response = await fetch(`${serverURL}/${apiV1}custom/restore`, {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (result.success) {
                    setFile(null)
                    application.dispatch({ notification: result.mwssage })
                } else {
                    application.dispatch({ notification: result.mwssage })

                }

            } else {
                application.dispatch({ notification: "no file" })
            }
        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        } finally {
            application.dispatch({ loading: false })
        }
    };

    return (
        <div className="row">
            <div className="col s12 m8 l6 offset-m2 offset-l3">
                <div className="card">
                    <div className="card-title center">
                        upload backup
                    </div>
                    <div className="card-content">
                        <form action="#">
                            <div className="row">
                                <div className="col s12">
                                    <Input
                                        label="choose file"
                                        name=""
                                        error=""
                                        value=""
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col s12 center">
                                    <Button
                                        title="upload"
                                        onClick={validateForm}
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
    )
})

export default Restore