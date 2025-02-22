"use client"
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

export default function Home() {

  const [peopleCount, setPeopleCount] = useState(0);
  const [modelName, setModelName] = useState("1");
  const [viewName, setViewName] = useState("1");

  useEffect(() => {
    const interval = setInterval(()=> {
      fetchCount()
    }, 1000);

    return () => clearInterval(interval)
  }, []);

  const fetchCount = async () => {
    fetch("http://localhost:5000/crowd_count")
      .then((response) => response.json())
      .then((data) => setPeopleCount(data.averageCrowdCount))
      .catch((error) => console.error("Error fetching data:", error));
  }

  const modelClick = (model) => {
    setModelName(model)
    changeModel(model) 
  }

  const viewClick = (view) => {
    setViewName(view)
    changeView(view) 
  }

  const changeModel = async (model) => {
    fetch("http://localhost:5000/change_model",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: model })
    })
    .then((response) => response.json())
    .then((data) => console.log("Model changed: ", data))
    .catch((error) => console.error("Error changing model:", error));
  }

  const changeView = async (view) => {
    fetch("http://localhost:5000/change_view",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ view: view })
    })
    .then((response) => response.json())
    .then((data) => console.log("View changed: ", data))
    .catch((error) => console.error("Error changing view:", error));
  }
  return (
    <div style = {{display: "flex", flexDirection: "column", height: "100vh", width: "100vw"}}>
      <div style = {{display: 'flex', height: "8%", backgroundColor: "#010b11"}}></div>
      <div style = {{display: 'flex', height: "92%", backgroundColor: "#919191"}}>
        <div style= {{display: 'flex', width: "13%", backgroundColor: '#010b11'}}></div>
        <div style= {{display: 'flex', width: "87%", backgroundColor: '#010b11'}}>
          <div style= {{display: 'flex', flexGrow: "1", backgroundColor: "#919191", borderRadius: "100px", margin: "15px", justifyContent: 'center', alignItems: 'center'}}>
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
              <div style= {{display: 'flex', width: '100%', height: '20%', backgroundColor: "#c53232", margin: '10px 0 10px 0' }}>
                <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: modelName === "1" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> modelClick("1")}>Head + Person CrowdHuman</button>
                <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: modelName === "2" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> modelClick("2")}>Head Only CrowdHuman</button>
                <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: modelName === "3" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> modelClick("3")}>Head Only CrowdHuman + FDST</button>
              </div>
              <div style= {{display: 'flex', width: '100%', height: '20%', backgroundColor: "#c53232", margin: '10px 0 10px 0' }}>
                <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: viewName === "1" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> viewClick("1")}>No Boxes</button>
                <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: viewName === "2" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> viewClick("2")}>YOLO Bounding Boxes</button>
                <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: viewName === "3" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> viewClick("3")}>Custom Bounding Boxes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
