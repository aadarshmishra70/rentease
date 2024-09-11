import React from 'react';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setLogin } from "../redux/state";
import { FcGoogle } from 'react-icons/fc';

const GoogleSignIn = ({ buttonText }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log("token", tokenResponse);
            try {
                
                const res = await fetch("http://localhost:3001/auth/google-signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token: tokenResponse.access_token })
                })

                if (res.status === 200 || res.status === 201) {
                    const loggedIn = await res.json()
                    dispatch(
                        setLogin({
                            user: loggedIn.user,
                            token: loggedIn.token
                        })
                    )
                    toast.success("Login Succssfull  !!")
                    navigate("/")
                }
                else {
                    toast.error("Registration failed")
                }
            } catch (err) {
                console.error('Error during Google sign-in:', err);
            }
        },
        onError: errorResponse => toast.error(errorResponse.error.message),
    });

    return (
        <button
            onClick={() => login()}
            className="google-sign-in-button"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#757575',
                backgroundColor: 'white',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                boxShadow: '0 2px 4px 0 rgba(0,0,0,.25)',
                cursor: 'pointer',
                transition: 'background-color .218s, border-color .218s, box-shadow .218s',
                marginTop: '30px'
            }}
            onMouseOver={(e) => {
                e.target.style.boxShadow = '0 0 3px 3px rgba(66,133,244,.3)';
                e.target.style.backgroundColor = '#f8f8f8';
            }}
            onMouseOut={(e) => {
                e.target.style.boxShadow = '0 2px 4px 0 rgba(0,0,0,.25)';
                e.target.style.backgroundColor = 'white';
            }}
        >
            <FcGoogle style={{ marginRight: '10px', fontSize: '20px' }} />
            {buttonText}
        </button>
    );
};

export default GoogleSignIn;