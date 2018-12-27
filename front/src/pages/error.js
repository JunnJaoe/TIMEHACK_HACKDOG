import React from "react";
import { Jumbotron, Container, Alert } from 'reactstrap';

const Error = () => {
    return(
        <div className="content-wrapper">
                <section className="content">
                    <div className="error-page">
                        <Jumbotron fluid>
                            <Container fluid>
                                <h1 className="display-3">404</h1>
                                <div className="error-content">
                                    <Alert color="warning">Oops! Page not found.</Alert>
                                    <p className="lead">
                                        We could not find the page you were looking for.<br/>
                                        Meanwhile, you may <a href="/">return to home.</a><br/><br/>
                                        {/* If you think this is wrong, please contact the administrator at <a href="mailto:qbosadmin@questronix.com.ph">qbosadmin@questronix.com.ph</a>. */}
                                    </p>
                                </div>
                            </Container>
                        </Jumbotron>
                        
                    </div>
                </section>
            </div>
    )
}

export default Error;