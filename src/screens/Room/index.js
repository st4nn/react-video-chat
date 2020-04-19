import React from "react";
import WebRTC from "components/WebRTC";

import View from "./view";

class Room extends React.Component{
    constructor(props){
        super(props);

        const 
            { match = {} } = props,
            { params = {}} = match,
            { rid = false} = params;

        this.state = {
            rid,
            isLoading: true,
            hasAudio: true,
            audioLoading: true,
            hasVideo: true,
            videoLoading: true,
            hasFullScreen: false
        };

        
        this.containerRef = React.createRef();
        this.remoteVideoRef = React.createRef();
        this.videoRef = React.createRef();
        this.webRTC = null;

        this.handleAudio = this.handleAudio.bind(this);
        this.handleFullScreen = this.handleFullScreen.bind(this);
        this.handleVideo = this.handleVideo.bind(this);

        this.onExit = this.onExit.bind(this);
        this.onFullScreenChange = this.onFullScreenChange.bind(this);
    }
    componentDidMount(){
        
        const { rid } = this.state;
        if (rid){
            this.onFullScreenChange();
            this.getLocalStream();
        } else{
            this.props.history.push("/");
        }
    }
    componentWillUnmount(){
        this.webRTC.destroy();
    }
    getLocalStream(){
        const 
            { getLocalStream } = this,
            { history } = this.props,
            self = this;
        if (this.videoRef.current !== null){
            this.webRTC = new WebRTC({ 
                localVideo: this.videoRef.current, 
                remoteVideo: this.remoteVideoRef.current
            });

            this.webRTC.openUserMedia({})
            .then(()=>{
                self.setState({isLoading: false, videoLoading: false, audioLoading: false});
            })
            .catch(()=>{
                history.push("/");
            });

        } else{
            setTimeout(() => {
                getLocalStream();
            }, 600);
        }
    }
    handleAudio(){
        const 
            { hasAudio } = this.state,
            self = this;

        const onSuccess = () => {
            self.setState({ hasAudio: !hasAudio, audioLoading: false });
        }

        this.setState({audioLoading: true}, ()=>{
            if (hasAudio){
                self.webRTC.stopAudio()
                .then(onSuccess);
            } else{
                self.webRTC.startAudio()
                    .then(onSuccess);
            }
        });
    }
    handleFullScreen(){
        if (this.containerRef.current !== null){
            const elem = this.containerRef.current;
            const { hasFullScreen } = this.state;
            if (hasFullScreen){
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) { /* Firefox */
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE/Edge */
                    document.msExitFullscreen();
                }
            } else{
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.mozRequestFullScreen) { /* Firefox */
                    elem.mozRequestFullScreen();
                } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) { /* IE/Edge */
                    elem.msRequestFullscreen();
                }
            }
        }
    }
    handleVideo(){
        const
            { hasVideo } = this.state,
            self = this;

        const onSuccess = ()=>{
            self.setState({ hasVideo: !hasVideo, videoLoading: false });
        }

        this.setState({videoLoading: true}, ()=>{
            if (hasVideo) {
                self.webRTC.stopVideo()
                .then(onSuccess);
            } else {
                self.webRTC.startVideo()
                .then(onSuccess);
            }
        });
    }
    onExit(){
        const { history } = this.props;
        this.setState({isLoading: true}, ()=>{
            history.push("/");
        });
    }
    onFullScreenChange() {
        const onChange = (e) => {
            const { hasFullScreen } = this.state;
            this.setState({ hasFullScreen: !hasFullScreen });
        }

        /* Standard syntax */
        document.addEventListener("fullscreenchange", onChange);

        /* Firefox */
        document.addEventListener("mozfullscreenchange", onChange);

        /* Chrome, Safari and Opera */
        document.addEventListener("webkitfullscreenchange", onChange);

        /* IE / Edge */
        document.addEventListener("msfullscreenchange", onChange);
    }
    render(){
        return (
            <View {...this.state} 
                containerRef={this.containerRef}
                remoteVideoRef={this.remoteVideoRef}
                videoRef={this.videoRef}
                handleAudio={this.handleAudio}
                handleFullScreen={this.handleFullScreen}
                handleVideo={this.handleVideo}
                onExit={this.onExit}
                />
        )
    }
}

export default Room;