import React, { useState } from "react";
import "../styles/Login.scss"
import { setLogin } from "../redux/state";
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch()

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch ("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      console.log("Logg in status", response.status)
      if(response.status === 200) {
        const loggedIn = await response.json()
        dispatch (
          setLogin({
            user: loggedIn.user,
            token: loggedIn.token
          })
        )
        toast.success("l")
        navigate("/")
      }
      if(response.status === 401 || response.status === 404) {
        toast.error("Username or password is incorrect")
        return
      }
    } catch (err) {
      toast.error("Login failed")
      console.log("Login failed", err.message)
    }
  }


  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('/api/auth/google-login', {
        token: credentialResponse.credential
      });
      
      // Save the JWT token to localStorage or your state management solution
      localStorage.setItem('token', res.data.token);
      
      // Update your app state with the user info
      // For example: setUser(res.data.user);
      
      console.log('Logged in successfully', res.data);
    } catch (error) {
      console.error('Login failed', error.response.data);
    }
  };

  return (
    <div className="login">
      <div className="login_content">
        <form className="login_content_form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">LOG IN</button>
        </form>
        <a href="/register">Don't have an account? Sign In Here</a>
      </div>
      <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => {
        console.log('Login Failed');
      }}
    />
    </div>
  );
};

export default LoginPage;
