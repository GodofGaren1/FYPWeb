"use client"
import { useState, useEffect } from "react";
import Link from 'next/link'
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

export default function Home() {

  const [URL, setURL] = useState('https://www.youtube.com/watch?v=DjdUEyjx8GM');

  const defaultURL = 'https://www.youtube.com/watch?v=DjdUEyjx8GM'

  const backendURL = "http://localhost:5000"
  // const backendURL = "13.210.21.192:5000"

  const changeURL = async (url) => {
    fetch(`${backendURL}/change_url`,{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: url })
    })
    .then((response) => response.json())
    .then((data) => console.log("URL changed: ", data))
    .catch((error) => console.error("Error changing URL:", error));
  }


  return (
    <div style = {{display: "flex", flexDirection: "column", height: "100vh", width: "100vw"}}>
      <div style = {{display: 'flex', height: "10%", justifyContent:"center", alignItems: "center", backgroundColor: "#000000"}}>
        <h1 style = {{fontSize: '80px', color: "#ffffff"}}>
            Crowd Web
        </h1>
      </div>
      <div style = {{display: 'flex', height: "90%", backgroundColor: "#919191"}}>
        <div style= {{display: 'flex', flexDirection: "column", width: "13%", justifyContent:"center", alignItems: "center", backgroundColor: '#000000'}}>
          <Link href="/" passHref legacyBehavior>
            <div style={{ textDecoration: 'none', width: '100%',display: 'flex',
                  justifyContent: "center",
                  alignItems: "center",
                  height: "10%",
                  width: "100%",
                  backgroundColor: '#ca5410',
                  fontSize: '24px',
                  color: 'white',
                  cursor: 'pointer' }}>

                Home
            </div>
          </Link>
          <div style= {{display: 'flex',  height: "10%", width: "100%", backgroundColor: '#000000'}}></div>
          <Link href="/info" passHref legacyBehavior>
            <div style={{ textDecoration: 'none', width: '100%',display: 'flex',
                  justifyContent: "center",
                  alignItems: "center",
                  height: "10%",
                  width: "100%",
                  backgroundColor: '#ca5410',
                  fontSize: '24px',
                  color: 'white',
                  cursor: 'pointer' }}>

                Info
            </div>
          </Link>
          <div style= {{display: 'flex',  height: "20%", width: "100%", backgroundColor: '#000000'}}></div>

        </div>
        <div style= {{display: 'flex', justifyContent:'center', alignItems:'center', flexDirection: 'column', width: "87%", backgroundColor: '##919191'}}>
          <p style = {{display: 'flex', color: "#000000", fontSize: "80px", marginBottom: "25px"}}>
            Youtube URL:
          </p>
          <input
            type="text"
            value = {URL}
            onChange = {(e) => setURL(e.target.value)}
            style={{
              fontSize: '32px',
              padding: '10px 15px',
              borderRadius: '8px',
              border: '2px solid #333',
              width: '50%',
              outline: 'none',
              marginBottom: '40px'
            }}
          />
          <button style= {{ whiteSpace: "normal", cursor: 'pointer', border:'none', marginBottom: '40px',height: '60px', width:'350px', borderRadius:"50px", fontSize: "50px", backgroundColor: "#ca5410"}} onClick = {()=> changeURL(URL)}>Submit</button>
          <div></div>
          <button style= {{ whiteSpace: "normal", cursor: 'pointer', border:'none', height: '50px', width:'200px', borderRadius:"50px", fontSize: "30px", backgroundColor: "#ca5410"}} onClick = {()=> changeURL(defaultURL)}>Default</button>
        </div>
      </div>
    </div>
  );
}
