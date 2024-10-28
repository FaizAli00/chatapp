import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where} from 'firebase/firestore';
import { toast } from "react-toastify";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWpFruBTI-hSSJkG54mmRrYOJbCNg2_Rw",
  authDomain: "mychatapp-26d13.firebaseapp.com",
  projectId: "mychatapp-26d13",
  storageBucket: "mychatapp-26d13.appspot.com",
  messagingSenderId: "381429600146",
  appId: "1:381429600146:web:e9134681f7c4dbde5c7b4b",
  measurementId: "G-QVJYTPB65Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth,email,password);
        const user = res.user;
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey There, I'm using chatapp",
            lastSeen:Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatsData:[]
        })
    } catch (error) {
        console.log(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const login = async (email,password) => {
    try {
        await signInWithEmailAndPassword(auth,email,password);
    } catch (error) {
        console.log(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const logout =  async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.log(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const resetPass = async (email) => {
    if (!email) {
        toast.error("Enter Your Email");
        return null;
    }
    try {
        const userRef = collection(db,'user');
        const q = query(userRef,where("email","==",email));
        const  querySnap = await getDocs(q);
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email Sent")
        }
        else {
            toast.error("Email Not Found");
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message)
    }
}

export {signup, login, logout, auth, db, resetPass}