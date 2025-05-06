"use client"
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import Link from 'next/link'
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

export default function Home() {

  const [peopleCount, setPeopleCount] = useState(0);
  const [modelName, setModelName] = useState("1");
  const [viewName, setViewName] = useState("1");
  const [sliceName, setSliceName] = useState("0");
  const [rightDrawer, setRightDrawer] = useState(false);

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

  const sliceClick = (slice) => {
    setSliceName(slice)
    changeSlice(slice) 
  }

  const rightDrawerClick = () => {
    setRightDrawer(rightDrawer => !rightDrawer)
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

  const changeSlice = async (slice) => {
    fetch("http://localhost:5000/change_slice",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ slice: slice })
    })
    .then((response) => response.json())
    .then((data) => console.log("View changed: ", data))
    .catch((error) => console.error("Error changing view:", error));
  }

  const drawerList = (
      <List sx={{ width: 700 }}>
        {/* Model selection */}
        <div style ={{display:'flex', alignItems: 'center',  height: "10%", width: '100%', backgroundColor: "#ffffff"}}>
        <button style = {{borderRadius: '80px', marginLeft:'5%', border:'none', width: "80px", height: "80px", whiteSpace: "normal", backgroundColor: rightDrawer ? '#6ebae6': '#0c3181', textAlign: "center", fontSize: "50px", color:'#000000'}} onClick = {()=> rightDrawerClick()}>X</button>
        </div>
        <div style ={{display: 'flex', flexDirection:'column', height: "20%", width: '100%',justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffffff"}}>
          <p style = {{display: 'flex', color: "#000000", fontSize: "80px"}}>
            Crowd Count:
          </p>
          <p style = {{display: 'flex', color: "#000000", fontSize: "80px"}}>
            {peopleCount}
          </p>
        </div>
        <div style ={{textAlign: 'center', fontSize: '50px', fontWeight: 'bold', margin: "20px 0"}}>
          Models
        </div>
        <ListItem>
          <ListItemButton
            selected={modelName === "1"}
            onClick={() => modelClick("1")}
            style={{ borderRadius: '10px', backgroundColor: modelName === "1" ? '#0c3181' : '#6ebae6', color: 'white' }}
          >
            <ListItemText style = {{textAlign: 'center'}} primary="Head + Person CrowdHuman" slotProps={{primary: {sx: {fontSize: '30px'}}}}/>
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton
            selected={modelName === "2"}
            onClick={() => modelClick("2")}
            style={{ borderRadius: '10px', backgroundColor: modelName === "2" ? '#0c3181' : '#6ebae6', color: 'white' }}
          >
            <ListItemText style = {{textAlign: 'center'}} primary="Head Only CrowdHuman" slotProps={{primary: {sx: {fontSize: '30px'}}}}/>
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton
            selected={modelName === "3"}
            onClick={() => modelClick("3")}
            style={{ borderRadius: '10px', backgroundColor: modelName === "3" ? '#0c3181' : '#6ebae6', color: 'white' }}
          >
            <ListItemText style = {{textAlign: 'center'}} primary="Head Only CrowdHuman + FDST" slotProps={{primary: {sx: {fontSize: '30px'}}}}/>
          </ListItemButton>
        </ListItem>

        {/* View selection */}
        <div style ={{textAlign: 'center', fontSize: '50px', fontWeight: 'bold', margin: "20px 0"}}>
          Views
        </div>
        <ListItem>
          <ListItemButton
            selected={viewName === "1"}
            onClick={() => viewClick("1")}
            style={{ borderRadius: '10px', backgroundColor: viewName === "1" ? '#0c3181' : '#6ebae6', color: 'white' }}
          >
            <ListItemText style = {{textAlign: 'center'}} primary="No Boxes" slotProps={{primary: {sx: {fontSize: '30px'}}}}/>
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton
            selected={viewName === "2"}
            onClick={() => viewClick("2")}
            style={{ borderRadius: '10px', backgroundColor: viewName === "2" ? '#0c3181' : '#6ebae6', color: 'white' }}
          >
            <ListItemText style = {{textAlign: 'center'}} primary="YOLO Bounding Boxes" slotProps={{primary: {sx: {fontSize: '30px'}}}}/>
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton
            selected={viewName === "3"}
            onClick={() => viewClick("3")}
            style={{ borderRadius: '10px', backgroundColor: viewName === "3" ? '#0c3181' : '#6ebae6', color: 'white' }}
          >
            <ListItemText style = {{textAlign: 'center'}} primary="Custom Bounding Boxes" slotProps={{primary: {sx: {fontSize: '30px'}}}}/>
          </ListItemButton>
        </ListItem>

        {/* Slice toggle */}
        <div style ={{textAlign: 'center', fontSize: '50px', fontWeight: 'bold', margin: "20px 0"}}>
          Slicing
        </div>
        <ListItem>
          <ListItemButton
            selected={sliceName === "0"}
            onClick={() => sliceClick("0")}
            style={{ borderRadius: '10px', backgroundColor: sliceName === "0" ? '#0c3181' : '#6ebae6', color: 'white' }}
          >
            <ListItemText style = {{textAlign: 'center'}} primary="Slice Off" slotProps={{primary: {sx: {fontSize: '30px'}}}}/>
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton
            selected={sliceName === "1"}
            onClick={() => sliceClick("1")}
            style={{ borderRadius: '10px', backgroundColor: sliceName === "1" ? '#0c3181' : '#6ebae6', color: 'white' }}
          >
            <ListItemText style = {{textAlign: 'center'}} primary="Slice On" slotProps={{primary: {sx: {fontSize: '30px'}}}} />
          </ListItemButton>
        </ListItem>
      </List>

  )

    // <div style= {{display: 'flex', width: '100%', height: '20%', backgroundColor: "#c53232", margin: '10px 0 10px 0' }}>
    //   <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: modelName === "1" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> modelClick("1")}>Head + Person CrowdHuman</button>
    //   <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: modelName === "2" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> modelClick("2")}>Head Only CrowdHuman</button>
    //   <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: modelName === "3" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> modelClick("3")}>Head Only CrowdHuman + FDST</button>
    // </div>
    // <div style= {{display: 'flex', width: '100%', height: '20%', backgroundColor: "#c53232", margin: '10px 0 10px 0' }}>
    //   <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: viewName === "1" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> viewClick("1")}>No Boxes</button>
    //   <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: viewName === "2" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> viewClick("2")}>YOLO Bounding Boxes</button>
    //   <button style = {{borderRadius: '25px', width: "27%", margin: "20px 10px 20px 10px", backgroundColor: viewName === "3" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> viewClick("3")}>Custom Bounding Boxes</button>
    // </div>
    // <div style= {{display: 'flex', width: '100%', height: '20%', backgroundColor: "#c53232", margin: '10px 0 10px 0', justifyContent: 'center' }}>
    //   <button style = {{borderRadius: '25px', width: "35%", margin: "20px 15px 20px 10px", backgroundColor: sliceName === "0" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> sliceClick("0")}>Slice Off</button>
    //   <button style = {{borderRadius: '25px', width: "35%", margin: "20px 10px 20px 15px", backgroundColor: sliceName === "1" ? '#6ebae6': '#0c3181', whiteSpace: "normal", textAlign: "center"}} onClick = {()=> sliceClick("1")}>Slice On</button>
    // </div>

  return (
    <div style = {{display: "flex", flexDirection: "column", height: "100vh", width: "100vw"}}>
      <div style = {{display: 'flex', height: "10%", justifyContent:"center", alignItems: "center", backgroundColor: "#105885"}}>
        <h1 style = {{fontSize: '80px', color: "#ffffff"}}>
            Crowd Web
        </h1>
      </div>
      <div style = {{display: 'flex', height: "90%", backgroundColor: "#919191"}}>
        <div style= {{display: 'flex', flexDirection: "column", width: "13%", justifyContent:"center", alignItems: "center", backgroundColor: '#010b11'}}>
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
        <div style= {{display: 'flex', width: "87%", backgroundColor: '#84a706'}}>
          <Drawer open={rightDrawer} onClose={rightDrawerClick} anchor = 'right'>
            {drawerList}
          </Drawer>
          <div style= {{display: 'flex', flexGrow: "1", backgroundColor: "#919191", borderRadius: "100px", margin: "15px", justifyContent: 'center', alignItems: 'center'}}>
            <div style={{ display: 'flex', height: '80%', width: "60%" }}>
              <img
                src="http://localhost:5000/video_feed"
                onError={(e) => {
                  console.warn("Video feed failed. Retrying...");
                  setTimeout(() => {
                    e.target.src = '/video_feed';
                  }, 1000);
                }}
                style={{ width: '100%', border: '2px solid black' }}
              >
              </img>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', height: '80%', width: "20%", marginLeft: "120px", justifyContent: 'center', alignItems: 'center'}}>
              <div style= {{display: 'flex', width: '50%', height: '8%', margin: '10px 0 10px 0', justifyContent: 'center', alignItems: 'center', margin: "120px 20px"}}>
              </div>
              <p style = {{display: 'flex', color: "#000000", fontSize: "80px", marginBottom: "25px"}}>
                Crowd Count:
              </p>
              <p style = {{display: 'flex', color: "#000000", fontSize: "80px"}}>
                {peopleCount}
              </p>
              <div style= {{display: 'flex', width: '50%', height: '8%', margin: '10px 0 10px 0', justifyContent: 'center', alignItems: 'center', margin: "120px 20px"}}>
                <button style = {{cursor: 'pointer', borderRadius: '50px', border:'none', width: "100%", height: "100%", whiteSpace: "normal", backgroundColor: rightDrawer ? '#6ebae6': '#0c3181', textAlign: "center", fontSize: "25px"}} onClick = {()=> rightDrawerClick()}>Options</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
