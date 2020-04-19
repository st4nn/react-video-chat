import React from "react";

import { Container } from "./Styles";

const View = ({ roomId = "", handleState, onRandom, onSubmit})=>{
    return (
        <Container>
            <h2>Jh Video Chat</h2>
            <form onSubmit={onSubmit}>
                <span>Please enter a room name</span>
                <input 
                    className="form-control" 
                    value={roomId} 
                    onChange={(e)=> handleState({ roomId : e.target.value}) }/>
                <div className="form-actions">
                    <button type="submit" disabled={(roomId === "")} className="btn btn-primary">Join</button>
                    <button type="button" onClick={onRandom} className="btn btn-primary">Random</button>
                </div>
            </form>
        </Container>
    )
}

export default View;