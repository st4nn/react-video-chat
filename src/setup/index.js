import React from "react";
import { withFirebase } from "components/Firebase";

import Router from "./Router";

import "assets/css/app.css";
import "assets/css/boxicons.css";

class Setup extends React.Component{
    constructor(props){
        super(props);

        this.state = {  };
        this.handleState = this.handleState.bind(this);
    }
    handleState(data){
        const self = this;
        
        return new Promise((resolve) => {
            self.setState(data, ()=>{
                resolve(self.state);
            })
        });
    }
    render(){
        return (
            <Router 
                firebase={this.props.firebase} 
                handleMainState={this.handleState}
                />
        )
    }
}

export default withFirebase(Setup);