// import React from "react";
// import { BrowserRouter , Route, Routes  } from "react-router-dom";
// import Removebg from "./Components/remove-bg/rembg";
// import EditBackground from "./Components/filteredImage.jsx/Editbackground";
// import './App.css'


// function App() {
//   return (
    
//     <BrowserRouter  >
//     <Routes>
//       <Route path="/" element={<Removebg />}/> 
//       <Route path="/edit-background" element={<EditBackground/>}/> 
//     </Routes>
//   </BrowserRouter>
//   );
// }

// export default App;


import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Removebg from "./Components/remove-bg/rembg";
import EditBackground from "./Components/filteredImage.jsx/Editbackground";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import './App.css';
function App() {
  return (
    <BrowserRouter>
      {/* AppBar component */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Image Editor
          </Typography>
          <Button color="inherit" href="/">Home</Button>
        </Toolbar>
      </AppBar>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Removebg />} />
        <Route path="/edit-background" element={<EditBackground />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
