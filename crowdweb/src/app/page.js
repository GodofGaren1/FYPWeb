"use client"
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

export default function Home() {

  const [peopleCount, setPeopleCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(()=> {
      fetchCount()
    }, 1000)
  }, []);

  const fetchCount = async () => {
    fetch("http://localhost:5000/crowd_count")
      .then((response) => response.json())
      .then((data) => setPeopleCount(data.averageCrowdCount))
      .catch((error) => console.error("Error fetching data:", error));
  }
  return (
    <div style = {{display: "flex", flexDirection: "column", height: "100vh", width: "100vw"}}>
      <div style = {{display: 'flex', height: "8%", backgroundColor: "#1ca5e4"}}></div>
      <div style = {{display: 'flex', height: "92%", backgroundColor: "#ffffff"}}>
        <div style= {{display: 'flex', width: "13%", backgroundColor: '#1ca5e4'}}></div>
        <div style= {{display: 'flex', width: "87%", backgroundColor: '#1ca5e4'}}>
        <div style= {{display: 'flex', flexGrow: "1", backgroundColor: "#ffffff", borderRadius: "100px", margin: "15px", justifyContent: 'center', alignItems: 'center'}}>
          <div style={{ display: 'flex', height: '80%', width: "60%" }}>
            <img
              src="http://localhost:5000/video_feed"
              style={{ width: '100%', border: '2px solid black' }}
            >
            </img>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: '80%', width: "20%", marginLeft: "120px", justifyContent: 'center', alignItems: 'center'}}>
            <text style = {{display: 'flex', color: "#000000", fontSize: "50px", marginBottom: "25px"}}>
              Crowd Count:
            </text>
            <text style = {{display: 'flex', color: "#000000", fontSize: "50px"}}>
              {peopleCount}
            </text>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
