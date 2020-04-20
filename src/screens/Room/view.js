import React from "react";

import { Container, ButtonsContainer, LoadingContainer } from "./Styles";

const View = ({ containerRef, videoRef, remoteVideoRef, isLoading, audioLoading, hasAudio, handleAudio, videoLoading, hasVideo, handleVideo, handleFullScreen, hasFullScreen, onExit })=>{
    const [mainVideoProfile, setMainVideoProfile] = React.useState(true);
    return(
        <Container ref={containerRef}>
            {(isLoading) && (
                <LoadingContainer>
                    <i className="bx bx-loader-circle spin"/>
                </LoadingContainer>
            )}
            <div className="video-container">
                <video onClick={() => { setMainVideoProfile(true)}} className={mainVideoProfile ? "main-video" : "second-video"} ref={videoRef} muted autoPlay playsInline></video>
                <video onClick={() => { setMainVideoProfile(false)}} className={!mainVideoProfile ? "main-video" : "second-video"} ref={remoteVideoRef} autoPlay playsInline></video>
            </div>
            <ButtonsContainer>
                <button onClick={handleAudio} className={(hasAudio ? "" : " selected")}>
                    <i className={"rotate-hor-top bx " + (audioLoading ? "bx-loader-alt spin": (hasAudio ? "bx-microphone" : "bx-microphone-off"))} />
                </button>
                <button onClick={handleVideo} className={(hasVideo ? "" : " selected")}>
                    <i className={"rotate-hor-top bx " + (videoLoading ? "bx-loader-alt spin" : (hasVideo ? "bx-video" : "bx-video-off"))} />
                </button>
                <button onClick={handleFullScreen}><i className={"rotate-hor-top bx bx-" + (hasFullScreen ? "exit-fullscreen" : "fullscreen")} /></button>
                <button onClick={onExit}><i className={"rotate-hor-top bx bx-exit"} /></button>
            </ButtonsContainer>
        </Container>
    )
}

export default View;