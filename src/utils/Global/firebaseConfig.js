import firebase from "firebase";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD6WhtHmwGX7_Tpv_Lwx5tOY4YX4Uf7KtM",
    authDomain: "epatientindex-6d8f8.firebaseapp.com",
    databaseURL: "https://epatientindex-6d8f8.firebaseio.com",
    projectId: "epatientindex-6d8f8",
    storageBucket: "epatientindex-6d8f8.appspot.com",
    messagingSenderId: "3739269378",
    appId: "1:3739269378:web:7f5d912d1de9960a"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp;
