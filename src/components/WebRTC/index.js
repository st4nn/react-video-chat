const configuration = {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
            ],
        },
    ],
    iceCandidatePoolSize: 10,
};

let firebase = null;
let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomDialog = null;

function WebRTC({ localVideo, remoteVideo, firebaseInstance = {}}){
    this.videoElement = localVideo;
    this.remoteVideoElement = remoteVideo;
    firebase = firebaseInstance;
}

const getUserMedia = async function({ audio = true, video = true }){
    return await navigator.mediaDevices.getUserMedia( { video, audio });
}

WebRTC.prototype.openUserMedia = function({ audio = true, video = true}){
    const { videoElement, remoteVideoElement } = this;
    return new Promise(async (resolve, reject)=>{
        try{
            const stream = await getUserMedia(audio, video);
            localStream = stream;
            videoElement.srcObject = localStream;
            remoteStream = new MediaStream();
            remoteVideoElement.srcObject = remoteStream;
            resolve(console.log('Stream:', videoElement.srcObject));
        } catch(error){
            reject(error);
        }
    })   
}

WebRTC.prototype.startAudio = function () {
    return new Promise(async (resolve, reject) => {
        try{
            const stream = await getUserMedia({video: false});
            stream.getAudioTracks().forEach(track => localStream.addTrack(track));
            resolve();
        } catch(error){
            reject(error);
        }
    });
}

WebRTC.prototype.stopAudio = function(){
    return new Promise((resolve, reject)=>{
        try {
            localStream.getAudioTracks().forEach(stream => stream.stop());
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

WebRTC.prototype.stopVideo = function(){
    return new Promise((resolve, reject)=>{
        try {
            localStream.getTracks().forEach(track => {
                if (track.kind === "video"){
                    track.stop();
                }
            });
            resolve();
        } catch (error) {
            reject(error);
        }

    })
}

WebRTC.prototype.startVideo = function () {
    const { videoElement } = this;
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await getUserMedia({ audio: false });
            stream.getTracks().forEach(track =>  localStream.addTrack(track) );
            videoElement.srcObject = stream;
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

WebRTC.prototype.destroy = function(){
    try {
        this.stopVideo();
    } catch (error) {
        
    }

    try {
        this.stopAudio();
    } catch (error) {

    }
}

WebRTC.prototype.createRoom = async function(roomId){
    const db = firebase.firestore();
    const roomRef = await db.collection('rooms').doc(roomId);

    console.log('Create PeerConnection with configuration: ', configuration);
    peerConnection = new RTCPeerConnection(configuration);

    registerPeerConnectionListeners();

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Code for collecting ICE candidates below
    const callerCandidatesCollection = roomRef.collection('callerCandidates');

    peerConnection.addEventListener('icecandidate', event => {
        if (!event.candidate) {
            console.log('Got final candidate!');
            return;
        }
        console.log('Got candidate: ', event.candidate);
        callerCandidatesCollection.add(event.candidate.toJSON());
    });
    // Code for collecting ICE candidates above

    // Code for creating a room below
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('Created offer:', offer);

    const roomWithOffer = {
        'offer': {
            type: offer.type,
            sdp: offer.sdp,
        },
    };
    
    await roomRef.set(roomWithOffer);
    roomId = roomRef.id;
    console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
    // Code for creating a room above

    peerConnection.addEventListener('track', event => {
        console.log('Got remote track:', event.streams[0]);
        event.streams[0].getTracks().forEach(track => {
            console.log('Add a track to the remoteStream:', track);
            remoteStream.addTrack(track);
        });
    });

    // Listening for remote session description below
    roomRef.onSnapshot(async snapshot => {
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data && data.answer) {
            console.log('Got remote description: ', data.answer);
            const rtcSessionDescription = new RTCSessionDescription(data.answer);
            await peerConnection.setRemoteDescription(rtcSessionDescription);
        }
    });
    // Listening for remote session description above

    // Listen for remote ICE candidates below
    roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async change => {
            if (change.type === 'added') {
                let data = change.doc.data();
                console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
        });
    });
    // Listen for remote ICE candidates above
}
export default WebRTC;



function registerPeerConnectionListeners() {
    peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
            `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener('iceconnectionstatechange ', () => {
        console.log(
            `ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
}