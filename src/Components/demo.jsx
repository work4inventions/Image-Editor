// import React, { useState, useRef, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { ChromePicker } from "react-color";
// import {
//   Box,
//   Button,
//   Slider,
//   Tooltip,
//   Container,
//   Grid,
//   Paper,
//   Typography,
// } from "@mui/material";
// import {
//   Undo,
//   Redo,
//   ZoomIn,
//   ZoomOut,
//   RotateRight,
//   RotateLeft,
//   ResetTvRounded,
// } from "@mui/icons-material";
// import { GrAddCircle } from "react-icons/gr";
// import axios from "axios";
// // Import background images
// import bg from "../../assets/bg.jpg";
// import bg1 from "../../assets/bg1.png";
// import bg3 from "../../assets/bg3.jpg";
// import bg4 from "../../assets/bg4.jpg";
// import bg5 from "../../assets/bg5.jpg";
// import bg6 from "../../assets/bg6.jpg";
// import {
//   ReactCompareSlider,
//   ReactCompareSliderImage,
// } from "react-compare-slider";
// function EditBackground() {
//   const location = useLocation();
//   const { image, selectedImage } = location.state || {};

//   // State variables
//   const [backgroundColor, setBackgroundColor] = useState("#f9f9f9");
//   const [backgroundImage, setBackgroundImage] = useState(null);
//   const [blur, setBlur] = useState(0);
//   const [zoom, setZoom] = useState(1);
//   const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
//   const [activeTab, setActiveTab] = useState("colors");
//   const [showColorPicker, setShowColorPicker] = useState(false);
//   const [rotation, setRotation] = useState(0);
//   const [images, setImages] = useState([bg, bg1, bg3, bg4, bg5, bg6]);
//   const [uploadImage, setUploadImage] = useState(null);
//   const [processedImage, setProcessedImage] = useState(null);

//   // Refs
//   const colorPickerRef = useRef(null);
//   const canvasRef = useRef(null);

//   // Undo/Redo stacks
//   const [undoStack, setUndoStack] = useState([]);
//   const [redoStack, setRedoStack] = useState([]);

//   // Color options
//   const colorOptions = [
//     "#CAC693",
//     "#f8b400",
//     "#ff5733",
//     "#33c9ff",
//     "#75ff33",
//     "#ff6f61",
//   ];

//   // Load settings from localStorage on mount
//   useEffect(() => {
//     const savedSettings = JSON.parse(
//       localStorage.getItem("backgroundSettings")
//     );
//     if (savedSettings) {
//       setBackgroundColor(savedSettings.backgroundColor || "#ffffff");
//       setBackgroundImage(savedSettings.backgroundImage || null);
//       setBlur(savedSettings.blur || 0);
//       setZoom(savedSettings.zoom || 1);
//       setImagePosition(savedSettings.imagePosition || { x: 0, y: 0 });
//       setRotation(savedSettings.rotation || 0);
//     }
//   }, []);

//   // Save settings to localStorage whenever they change
//   useEffect(() => {
//     const settings = {
//       backgroundColor,
//       backgroundImage,
//       blur,
//       zoom,
//       imagePosition,
//       rotation,
//     };
//     localStorage.setItem("backgroundSettings", JSON.stringify(settings));
//   }, [backgroundColor, backgroundImage, blur, zoom, imagePosition, rotation]);

//   // Draw the canvas whenever relevant state changes
//   useEffect(() => {
//     drawCanvas();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     backgroundColor,
//     backgroundImage,
//     blur,
//     image,
//     zoom,
//     imagePosition,
//     rotation,
//   ]);

//   const drawCanvas = async () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     if (!image) return;

//     try {
//       const originalImg = await loadImage(image);
//       canvas.width = originalImg.width;
//       canvas.height = originalImg.height;

//       // Clear the canvas
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       // Draw the background with blur or solid color
//       if (backgroundImage) {
//         const bgImg = await loadImage(backgroundImage);
//         ctx.filter = `blur(${blur}px)`;
//         ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
//       } else {
//         ctx.filter = `blur(${blur}px)`;
//         ctx.fillStyle = backgroundColor;
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
//       }
//       ctx.filter = "none"; // Reset filter for the main image

//       // Apply transformations: translate, rotate, scale
//       ctx.save();
//       ctx.translate(
//         imagePosition.x + (originalImg.width * zoom) / 2,
//         imagePosition.y + (originalImg.height * zoom) / 2
//       );
//       ctx.rotate((rotation * Math.PI) / 180); // Rotate in radians
//       ctx.scale(zoom, zoom);
//       ctx.drawImage(
//         originalImg,
//         -originalImg.width / 2,
//         -originalImg.height / 2,
//         originalImg.width,
//         originalImg.height
//       ); // Center the image
//       ctx.restore();
//     } catch (error) {
//       console.error("Error loading images:", error);
//     }
//   };

//   const loadImage = (src) => {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.src = src;
//       img.onload = () => resolve(img);
//       img.onerror = reject;
//     });
//   };

//   // Undo/Redo functionality
//   const saveToUndoStack = () => {
//     setUndoStack((prev) => [
//       {
//         backgroundColor,
//         backgroundImage,
//         blur,
//         zoom,
//         imagePosition,
//         rotation,
//       },
//       ...prev,
//     ]);
//     setRedoStack([]); // Clear redo stack on new action
//   };

//   const handleUndo = () => {
//     if (undoStack.length === 0) return;
//     const lastState = undoStack[0];
//     setRedoStack((prev) => [
//       {
//         backgroundColor,
//         backgroundImage,
//         blur,
//         zoom,
//         imagePosition,
//         rotation,
//       },
//       ...prev,
//     ]);
//     setUndoStack((prev) => prev.slice(1));
//     setBackgroundColor(lastState.backgroundColor);
//     setBackgroundImage(lastState.backgroundImage);
//     setBlur(lastState.blur);
//     setZoom(lastState.zoom);
//     setImagePosition(lastState.imagePosition);
//     setRotation(lastState.rotation);
//   };

//   const handleRedo = () => {
//     if (redoStack.length === 0) return;
//     const nextState = redoStack[0];
//     setUndoStack((prev) => [
//       {
//         backgroundColor,
//         backgroundImage,
//         blur,
//         zoom,
//         imagePosition,
//         rotation,
//       },
//       ...prev,
//     ]);
//     setRedoStack((prev) => prev.slice(1));
//     setBackgroundColor(nextState.backgroundColor);
//     setBackgroundImage(nextState.backgroundImage);
//     setBlur(nextState.blur);
//     setZoom(nextState.zoom);
//     setImagePosition(nextState.imagePosition);
//     setRotation(nextState.rotation);
//   };

//   // Handle background color changes
//   const handleBackgroundColorChange = (color) => {
//     saveToUndoStack();
//     setBackgroundColor(color);
//     setBackgroundImage(null);
//     setBlur(0);
//   };

//   // Handle background image selection
//   const handleBackgroundImageChange = (imageUrl) => {
//     saveToUndoStack();
//     setBackgroundImage(imageUrl);
//     setBackgroundColor("transparent");
//     setBlur(0);
//   };

//   // Handle blur changes
//   const handleBlurChange = (event, newValue) => {
//     saveToUndoStack();
//     setBlur(newValue);
//   };

//   const ZOOM_STEP = 0.1; // Adjustable zoom step
//   const MAX_ZOOM = 3.0; // Maximum zoom level
//   const MIN_ZOOM = 0.5; // Minimum zoom level

//   // Handle zoom in
//   const zoomIn = () => {
//     setZoom((prevZoom) => {
//       const newZoom = Math.min(prevZoom + ZOOM_STEP, MAX_ZOOM);
//       return Math.round(newZoom * 10) / 10; // Round to one decimal place
//     });
//   };

//   // Handle zoom out
//   const zoomOut = () => {
//     setZoom((prevZoom) => {
//       const newZoom = Math.max(prevZoom - ZOOM_STEP, MIN_ZOOM);
//       return Math.round(newZoom * 10) / 10; // Round to one decimal place
//     });
//   };

//   // Handle image dragging
//   const isDragging = useRef(false);
//   const dragStart = useRef({ x: 0, y: 0 });

//   const handleMouseDown = (e) => {
//     isDragging.current = true;
//     dragStart.current = { x: e.clientX, y: e.clientY };
//     saveToUndoStack();
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging.current) return;
//     const dx = e.clientX - dragStart.current.x;
//     const dy = e.clientY - dragStart.current.y;
//     setImagePosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
//     dragStart.current = { x: e.clientX, y: e.clientY };
//   };

//   const handleMouseUp = () => {
//     isDragging.current = false;
//   };

//   // Handle clicking outside the color picker to close it
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         colorPickerRef.current &&
//         !colorPickerRef.current.contains(event.target)
//       ) {
//         setShowColorPicker(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Save settings explicitly (optional, since settings are auto-saved on change)
//   const handleSaveSettings = () => {
//     const settings = {
//       backgroundColor,
//       backgroundImage,
//       blur,
//       zoom,
//       imagePosition,
//       rotation,
//     };
//     localStorage.setItem("backgroundSettings", JSON.stringify(settings));
//     alert("Settings saved!");
//   };

//   // Reset settings to default values
//   const handleResetSettings = () => {
//     setBackgroundColor("#ffffff");
//     setBackgroundImage(null);
//     setBlur(0);
//     setZoom(1);
//     setImagePosition({ x: 0, y: 0 });
//     setRotation(0);
//   };

//   // Download the edited image
//   const downloadImage = () => {
//     const canvas = canvasRef.current;
//     const link = document.createElement("a");
//     link.href = canvas.toDataURL("image/png");
//     link.download = "edited-image.png";
//     link.click();
//   };

//   // Handle adding new background images
//   const handleChange = (e) => {
//     const files = e.target.files;
//     const imageUrls = Array.from(files).map((file) =>
//       URL.createObjectURL(file)
//     );
//     setImages((prevImages) => [...prevImages, ...imageUrls]);
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return; // Check if file is selected

//     setUploadImage(file);
//     setProcessedImage(null);
//     console.log(setProcessedImage);

//     // Call handleRemoveBackground directly after setting the image
//     await handleRemoveBackground(file);
//   };

//   const handleRemoveBackground = async (file) => {
//     if (!file) {
//       console.log("Please upload an image first");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       const response = await axios.post(
//         "http://localhost:5000/remove-background",
//         formData,
//         { responseType: "blob" }
//       );

//       const imageUrl = URL.createObjectURL(response.data);
//       setProcessedImage(imageUrl);
//     } catch (err) {
//       console.log("Error removing background", err);
//     }
//   };

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       <Grid container spacing={4}>
//         {/* Canvas and Selected Image Section */}
//         <Grid item xs={12} md={8}>
//           <Paper elevation={3} sx={{ p: 2 }}>
//             <Tooltip title="Upload Image & Remove Background" arrow>
//               <Button
//                 variant="outlined"
//                 onClick={() =>
//                   document.getElementById("bg-remove-image").click()
//                 }
//               >
//                 <GrAddCircle className="text-2xl" />
//               </Button>
//             </Tooltip>
//             <input
//               type="file"
//               onChange={handleImageUpload} // Use onChange instead of onClick
//               accept="image/*"
//               id="bg-remove-image"
//               style={{ display: "none" }}
//             />

//             {image ? (
//               <>
//                 <canvas
//                   ref={canvasRef}
//                   style={{
//                     width: 400,
//                     height: 400,
//                     borderRadius: 15,
//                     cursor: "move", // Indicate draggable
//                     margin: "auto",
//                   }}
//                   onMouseDown={handleMouseDown}
//                   onMouseMove={handleMouseMove}
//                   onMouseUp={handleMouseUp}
//                   onMouseLeave={handleMouseUp}
//                 ></canvas>
//               </>
//             ) : (
//               <p style={{ color: "#000" }}>No image provided</p>
//             )}
//           </Paper>
//         </Grid>

//         {/* Settings Panel */}
//         <Grid item xs={12} md={4}>
//           <Paper
//             elevation={3}
//             sx={{
//               p: 3,
//               borderRadius: 2,
//               display: "flex",
//               flexDirection: "column",
//               gap: 3,
//             }}
//           >
//             {/* Tabs for different settings */}
//             <Box display="flex" justifyContent="space-between">
//               <Button
//                 variant={activeTab === "colors" ? "contained" : "outlined"}
//                 color="primary"
//                 onClick={() => setActiveTab("colors")}
//               >
//                 Colors
//               </Button>
//               <Button
//                 variant={activeTab === "images" ? "contained" : "outlined"}
//                 color="primary"
//                 onClick={() => setActiveTab("images")}
//               >
//                 Images
//               </Button>
//               <Button
//                 variant={activeTab === "blur" ? "contained" : "outlined"}
//                 color="primary"
//                 onClick={() => setActiveTab("blur")}
//               >
//                 Blur
//               </Button>
//             </Box>

//             {/* Settings Content */}
//             <Box>
//               {/* Colors Tab */}
//               {activeTab === "colors" && (
//                 <Box display="flex" flexDirection="column" gap={2}>
//                   <Tooltip title="Choose Color" arrow>
//                     <Button
//                       variant="contained"
//                       onClick={() => setShowColorPicker(!showColorPicker)}
//                       sx={{
//                         height: 40,
//                         backgroundColor: backgroundColor,
//                         color: "#000",
//                         "&:hover": {
//                           backgroundColor: backgroundColor,
//                         },
//                       }}
//                     >
//                       <img
//                         width="40"
//                         height="40"
//                         src="https://img.icons8.com/color/48/rgb-circle-1--v1.png"
//                         alt="Color Picker"
//                       />
//                     </Button>
//                   </Tooltip>
//                   {showColorPicker && (
//                     <Box
//                       ref={colorPickerRef}
//                       sx={{
//                         position: "absolute",
//                         zIndex: 10,
//                         mt: 2,
//                       }}
//                     >
//                       <ChromePicker
//                         color={backgroundColor}
//                         onChange={(color) =>
//                           handleBackgroundColorChange(color.hex)
//                         }
//                       />
//                       <Button
//                         onClick={() => setShowColorPicker(false)}
//                         sx={{ mt: 1 }}
//                         fullWidth
//                         variant="outlined"
//                       >
//                         Close
//                       </Button>
//                     </Box>
//                   )}

//                   <Typography variant="subtitle1" gutterBottom>
//                     Preset Colors:
//                   </Typography>
//                   <Grid container spacing={1}>
//                     {colorOptions.map((color, index) => (
//                       <Grid item xs={4} key={index}>
//                         <Button
//                           onClick={() => handleBackgroundColorChange(color)}
//                           sx={{
//                             height: 40,
//                             backgroundColor: color,
//                             border: "1px solid #ccc",
//                             "&:hover": {
//                               border: "1px solid #000",
//                             },
//                           }}
//                         />
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </Box>
//               )}

//               {/* Images Tab */}
//               {activeTab === "images" && (
//                 <Box display="flex" flexDirection="column" gap={2}>
//                   <Button
//                     variant="contained"
//                     startIcon={<GrAddCircle />}
//                     onClick={() =>
//                       document.getElementById("bg-image-upload").click()
//                     }
//                   >
//                     Add Image
//                   </Button>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     id="bg-image-upload"
//                     onChange={handleChange}
//                     style={{ display: "none" }}
//                   />
//                   <Typography variant="subtitle1" gutterBottom>
//                     Select Background Image:
//                   </Typography>
//                   <Grid container spacing={1}>
//                     {images.map((img, index) => (
//                       <Grid item xs={4} key={index}>
//                         <Paper
//                           elevation={2}
//                           sx={{
//                             p: 0.5,
//                             border:
//                               backgroundImage === img
//                                 ? "2px solid #1976d2"
//                                 : "1px solid #ccc",
//                             cursor: "pointer",
//                             "&:hover": {
//                               border: "2px solid #1976d2",
//                             },
//                           }}
//                           onClick={() => handleBackgroundImageChange(img)}
//                         >
//                           <img
//                             src={img}
//                             alt={`Background Option ${index + 1}`}
//                             style={{
//                               width: "100%",
//                               height: 60,
//                               objectFit: "cover",
//                               borderRadius: 4,
//                             }}
//                           />
//                         </Paper>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </Box>
//               )}

//               {/* Blur Tab */}
//               {activeTab === "blur" && (
//                 <Box display="flex" flexDirection="column" gap={2}>
//                   <Typography id="blur-slider" gutterBottom>
//                     Blur Background: {blur}px
//                   </Typography>
//                   <Slider
//                     value={blur}
//                     onChange={handleBlurChange}
//                     min={0}
//                     max={20}
//                     aria-labelledby="blur-slider"
//                   />
//                   <Box display="flex" gap={2}>
//                     <Button
//                       variant="outlined"
//                       color="primary"
//                       onClick={handleSaveSettings}
//                       fullWidth
//                     >
//                       Save Settings
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       color="secondary"
//                       onClick={handleResetSettings}
//                       fullWidth
//                     >
//                       Reset
//                     </Button>
//                   </Box>
//                 </Box>
//               )}
//             </Box>

//             {/* Action Buttons */}
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button
//                 onClick={downloadImage}
//                 variant="contained"
//                 color="success"
//                 fullWidth
//               >
//                 Download Image
//               </Button>
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>

//       {/* Toolbar for Actions */}
//       <Box mt={4}>
//         <Paper
//           elevation={3}
//           sx={{
//             p: 2,
//             borderRadius: 2,
//             display: "flex",
//             justifyContent: "space-around",
//             alignItems: "center",
//             flexWrap: "wrap",
//             gap: 1,
//           }}
//         >
//           <Tooltip title="Undo" arrow>
//             <span>
//               {/* Using span to wrap disabled buttons to prevent tooltip warnings */}
//               <Button
//                 onClick={handleUndo}
//                 disabled={undoStack.length === 0}
//                 variant="outlined"
//               >
//                 <Undo />
//               </Button>
//             </span>
//           </Tooltip>
//           <Tooltip title="Redo" arrow>
//             <span>
//               <Button
//                 onClick={handleRedo}
//                 disabled={redoStack.length === 0}
//                 variant="outlined"
//               >
//                 <Redo />
//               </Button>
//             </span>
//           </Tooltip>
//           <Tooltip title="Zoom In" arrow>
//             <Button onClick={zoomIn} variant="outlined">
//               <ZoomIn />
//             </Button>
//           </Tooltip>
//           <Tooltip title="Zoom Out" arrow>
//             <Button onClick={zoomOut} variant="outlined">
//               <ZoomOut />
//             </Button>
//           </Tooltip>

//           <Tooltip title="Rotate Left" arrow>
//             <Button
//               onClick={() => {
//                 saveToUndoStack();
//                 setRotation((prev) => prev - 30);
//               }}
//               variant="outlined"
//             >
//               <RotateLeft />
//             </Button>
//           </Tooltip>
//           <Tooltip title="Rotate Right" arrow>
//             <Button
//               onClick={() => {
//                 saveToUndoStack();
//                 setRotation((prev) => prev + 30);
//               }}
//               variant="outlined"
//             >
//               <RotateRight />
//             </Button>
//           </Tooltip>
//           <Tooltip title="Reset All Settings" arrow>
//             <Button onClick={handleResetSettings} variant="outlined">
//               <ResetTvRounded />
//             </Button>
//           </Tooltip>
//         </Paper>
//       </Box>
//       <Box mt={4}>
//         <Grid item xs={12} md={8}>
//           <Paper elevation={3} sx={{ p: 2 }}>
//             <Typography textAlign="center" variant="h6" gutterBottom>
//               Compared Image
//             </Typography>
//             {image && selectedImage ? (
//               <Box
//                 display="flex"
//                 justifyContent="center"
//                 alignItems="center"
//                 sx={{
//                   overflow: "hidden",
//                   maxHeight: "400px",
//                 }}
//               >
//                 <ReactCompareSlider
//                   itemOne={
//                     <ReactCompareSliderImage
//                       src={image}
//                       alt="Original"
//                       style={{
//                         maxWidth: "100%",
//                         maxHeight: "400px",
//                         objectFit: "contain",
//                       }}
//                     />
//                   }
//                   itemTwo={
//                     <ReactCompareSliderImage
//                       src={selectedImage}
//                       alt="Comparison"
//                       style={{
//                         maxWidth: "100%",
//                         maxHeight: "400px",
//                         objectFit: "contain",
//                       }}
//                     />
//                   }
//                   // style={{ width: "100%", height: "auto", borderRadius: 15 }}
//                 />
//               </Box>
//             ) : (
//               <Box
//                 sx={{
//                   height: 400,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   backgroundColor: "#f0f0f0",
//                   borderRadius: 2,
//                 }}
//               >
//                 <Typography variant="h6" color="textSecondary">
//                   No image provided
//                 </Typography>
//               </Box>
//             )}
//           </Paper>
//         </Grid>
//       </Box>
//     </Container>
//   );
// }

// export default EditBackground;