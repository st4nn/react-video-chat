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

let browserId = null;

function WebRTC({ localVideo, remoteVideo, firebaseInstance = {}, browser_id}){
    this.videoElement = localVideo;
    this.remoteVideoElement = remoteVideo;
    firebase = firebaseInstance;
    browserId = browser_id;
}

const getUserMedia = async function({ audio = true, video = true }){
    return await navigator.mediaDevices.getUserMedia( { video, audio });
}

WebRTC.prototype.openUserMedia = function({ audio = true, video = true}){
    const { videoElement, remoteVideoElement } = this;
    return new Promise(async (resolve, reject)=>{
        try{
            const stream = await getUserMedia({audio, video});
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
    return handleAudio(true);
}

WebRTC.prototype.stopAudio = function(){
    return handleAudio(false);
}

function handleAudio(newState){
    return new Promise((resolve, reject) => {
        try {
            localStream.getAudioTracks().forEach(track => track.enabled = newState);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

WebRTC.prototype.stopVideo = function(){
    return handleVideo(false);
}

WebRTC.prototype.startVideo = function () {
    return handleVideo(true);
}

function handleVideo(newState) {
    return new Promise((resolve, reject) => {
        try {
            localStream.getVideoTracks().forEach(track => track.enabled = newState);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
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
        [browserId] : {
            type: offer.type,
            sdp: offer.sdp,
        },
    };
    
    await roomRef.set(roomWithOffer);
    this.room = roomRef.id;
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
    roomRef.onSnapshot(snapshot => {
        const data = snapshot.data();
        const 
            clients = Object.keys(data);
            clients.splice(clients.indexOf(browserId), 1);


        if (!peerConnection.currentRemoteDescription && data) {
            clients.forEach(async (client)=>{
                console.log('Got remote description: ', data[client]);
                const rtcSessionDescription = new RTCSessionDescription(data[client]);
                await peerConnection.setRemoteDescription(rtcSessionDescription);
            });
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

WebRTC.prototype.join = async function (roomId) {
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(`${roomId}`);
    const roomSnapshot = await roomRef.get();
    console.log('Got room:', roomSnapshot.exists);

    if (roomSnapshot.exists) {
        console.log('Create PeerConnection with configuration: ', configuration);
        peerConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners();
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Code for collecting ICE candidates below
        const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
        peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            calleeCandidatesCollection.add(event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        peerConnection.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                remoteStream.addTrack(track);
            });
        });

        // Code for creating SDP answer below
        const hosts = Object.keys(roomSnapshot.data());

        hosts.forEach(async (host)=>{
            if (host !== browserId){
                const offer = roomSnapshot.data()[host];
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.createAnswer();
                console.log('Created answer:', answer);
                await peerConnection.setLocalDescription(answer);
                console.log('Got offer:', offer);

                const roomWithAnswer = {
                    [browserId]: {
                        type: answer.type,
                        sdp: answer.sdp,
                    },
                };
                await roomRef.update(roomWithAnswer);
                // Code for creating SDP answer above
            }
        });


        // Listening for remote ICE candidates below
        roomRef.collection('callerCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        // Listening for remote ICE candidates above
    }
}

WebRTC.prototype.hangUp = async function (e) {
    const tracks = this.videoElement.srcObject.getTracks();
    tracks.forEach(track => {
        track.stop();
    });

    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnection) {
        peerConnection.close();
    }

    // Delete room on hangup
    if (this.room) {
        const db = firebase.firestore();
        const roomRef = db.collection('rooms').doc(this.room);
        const calleeCandidates = await roomRef.collection('calleeCandidates').get();
        calleeCandidates.forEach(async candidate => {
            await candidate.ref.delete();
        });
        const callerCandidates = await roomRef.collection('callerCandidates').get();
        callerCandidates.forEach(async candidate => {
            await candidate.ref.delete();
        });
        await roomRef.delete();
    }

    return true;
}
export default WebRTC;



function registerPeerConnectionListeners() {
    peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener('iceconnectionstatechange ', () => {
        console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
}