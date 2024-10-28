import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useState, useEffect } from "react";
import { auth, db } from "../Config/Firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser , setChatUser ] = useState(null);
  const [chatVisible,setChatVisible] = useState(false);

  const loadUserData = async (uid) => {
  //  console.log(uid)
    try {
      if (!uid) return; // add a check to ensure uid is not null or undefined
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      if (!userData) return; // add a check to ensure userData is not null or undefined
      setUserData(userData);
      if (userData.avatar && userData.name) {
        navigate("/chat");
      } else {
        navigate("/profileupdate");
      }
      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });
      setInterval(async () => {
        if (auth.currentUser) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000);
    } catch (error) {
      console.error(error);
    }
  };



  useEffect(() => {

    if (userData && userData.id && db) {
      // console.log("object")
      const chatRef = doc(db, "chats", userData.id);
      const unSub = onSnapshot(chatRef, async (res) => {
        if (!res.data()) return; // add a check to ensure res.data() is not null or undefined
        const chatItems = res.data().chatsData || [] ;
        const tempData = [];
        for (const item of chatItems) {
        
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          if (!userData) continue; // add a check to ensure userData is not null or undefined
          tempData.push({ ...item, userData });
        }
        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      });
      return () => {
        unSub();
      };
    }
  }, [userData, db]);
  

  const value = {
    userData,setUserData,
    chatData,setChatData,
    loadUserData,
    messages,setMessages,
    messagesId,setMessagesId,
    chatUser,setChatUser,
    chatVisible,setChatVisible
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;