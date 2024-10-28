import React, { useState } from 'react';
import './Login.css';
import assets from '../../assets/assets/assets';
import { signup, login, resetPass } from '../../Config/Firebase';

const Login = () => {

  const [curtState, setCurtState] = useState("Sign Up");
  const [userName, setUserName] = useState("");
  const [email,setEmail] =useState("");
  const [password,setPassword] = useState("");

  const onSubmitHandler = (event) => {
      event.preventDefault();
      if (curtState === "Sign Up") {
        signup(userName,email,password)
      }
      else {
        login(email, password)
      }
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} alt="" className='logo' />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{curtState}</h2>
        {curtState === "Sign Up"? <input onChange={(e)=>setUserName(e.target.value)} value={userName} type="text" placeholder='User Name' className="form-input" required/>:null }
        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' className="form-input" required />
        <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' className="form-input" required />
        <button type="submit">{curtState === "Sign Up"?"Create Account":"Login Now"} </button>
        <div className="login-term">
          <input type="checkbox"/>
          <p>Agree to the term of use & Privacy Policy</p>
        </div>
        <div className="login-forgot">

          {
            curtState === "Sign Up"?<p className="login-toggle">
            Already Have an Account <span onClick={() => setCurtState("Login") }> Click Here </span>
          </p>:<p className="login-toggle">
            Create An Account <span onClick={() => setCurtState("Sign Up") }> Click Here </span>
          </p>
          }
          {curtState === "Login" ? <p className="login-toggle">
            Forgot Password ? <span onClick={() => resetPass(email) }> Reset Here </span></p> : null }
        </div>
      </form>
    </div>
  )
}

export default Login;
