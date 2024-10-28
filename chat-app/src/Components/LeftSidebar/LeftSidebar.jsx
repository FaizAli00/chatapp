import React, { useContext, useEffect, useRef, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets/assets";
import { useNavigate } from "react-router-dom";
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, } from "firebase/firestore";
import { db } from "../../Config/Firebase";
import { AppContext } from "../../Context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId, chatVisible, setChatVisible } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
  
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;
          if (chatData) { // Add a null check here
            chatData.forEach((user) => {
              if (user.rId === querySnap.docs[0].data().id) {
                userExist = true;
              }
            });
          }
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      console.error("Error searching for user:", error);
    }
  };

  const addChat = async () => {
    if (!user || !user.id) {
      toast.error("User not found or invalid.");
      return;
    }

    if (!userData || !userData.id) {
      toast.error("User  data not found or invalid.");
      return;
    }


    try {

      const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");

      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updateAt: Date.now(),
          messageSeen: true,
        })
      });

      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updateAt: Date.now(),
          messageSeen: true,
        })
      })

      const uSnap =  await getDocs(doc,(db,"users",user.id));
      const uData = uSnap.data();
      setChat({
        messagesId:newMessageRef.id,
        lastMessage:"",
        rId:user.id,
        updatedAt:Date.now(),
        messageSeen:true,
        userData:uData
      })
      setShowSearch(false);
      setChatVisible(true);

    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  }

  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId);
      setChatUser(item);
      const userChatsRef = doc(db,'chats',userData.id);
      const userChatsSnapshot = await getDocs(userChatsRef);
      const userchatsData = userChatsSnapshot.data();
      const chatIndex = userchatsData.chatsData.findIndex((c)=> c.messageId === item.messageId);
      userchatsData.chatsData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef, {
        chatsData: userchatsData.chatsData
      })
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message)
    }
   
  }

  useEffect(()=>{

    const updateChatUserData = async () => {

      if (chatUser) {
        const userRef = doc(db,"users",chatUser.userData.id)
      }
      
    }
    updateChatUserData()

  },[chatData])

  return (
    <div className={`ls ${chatVisible? "hidden": ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profileupdate")}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search Here"
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="" />
            <p>{user.name}</p>
          </div>
        ) : (
          chatData &&
          chatData.map((item, index) => (
            <div onClick={()=>setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`}>
              <img src={item.userData.avatar} alt="" />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;