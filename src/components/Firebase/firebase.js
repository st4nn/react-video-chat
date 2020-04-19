import app from 'firebase/app'
import "firebase/firebase-firestore";

import config from "./config.json";

class Firebase {
    constructor() {
        app.initializeApp(config);
        
        this.firestore = app.firestore;
    }


}

export default Firebase