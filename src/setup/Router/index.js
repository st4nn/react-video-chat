import React from "react";

import { BrowserRouter, Switch, Route } from "react-router-dom";

import Home from "screens/Home";
import Room from "screens/Room";

const Router = ({props})=>{
    return (
        <BrowserRouter>
            <Switch>
                <Route
                    path="/r/:rid"
                    render={rprops => {
                        return <Room {...rprops} {...props} />
                    }} />
                <Route
                    render={rprops => {
                        return <Home {...rprops} {...props} />
                    }}/>
            </Switch>
        </BrowserRouter>
    )
}

export default Router;