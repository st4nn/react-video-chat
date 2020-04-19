import React from "react";
import View from "./view";

import getRandomNumber from "utils/getRandomNumber";

class Home extends React.Component{
    constructor(props){
        super(props);

        const roomId = getRandomNumber(10000, 99999)
        this.state = {
            roomId
        };

        this.handleState = this.handleState.bind(this);
        this.onRandom = this.onRandom.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    handleState(data){
        this.setState(data);
    }
    onRandom(){
        this.setState({ roomId: getRandomNumber(10000, 99999)});
    }
    onSubmit(e){
        e.preventDefault();
        const 
            { roomId } = this.state,
            { history } = this.props;

        if (roomId !== ""){
            history.push(`/r/${roomId}`);
        }
    }
    render(){
        return (
            <View {...this.state} onRandom={this.onRandom} onSubmit={this.onSubmit} handleState={this.handleState}/>
        )
    }
}

export default Home;