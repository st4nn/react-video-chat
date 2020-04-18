import app from 'firebase/app'
import "firebase/firebase-firestore";

import config from "./config.json";

class Firebase {
    constructor() {
        app.initializeApp(config);
        this.auth = app.auth();
        
        this.db = app.firestore();

        app.auth().useDeviceLanguage();
    }


}

export default Firebase