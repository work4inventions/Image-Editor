import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Slider,
  Tooltip,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateRight,
  RotateLeft,
  ResetTvRounded,
} from "@mui/icons-material";
import { GrAddCircle } from "react-icons/gr";
import axios from "axios";
import bg from "../../assets/bg.jpg";
import bg1 from "../../assets/bg1.png";
import bg3 from "../../assets/bg3.jpg";
import bg4 from "../../assets/bg4.jpg";
import bg5 from "../../assets/bg5.jpg";
import bg6 from "../../assets/bg6.jpg";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import Sketch from "@uiw/react-color-sketch";

function EditBackground() {
  const location = useLocation();
  console.log(location);
  const { image, selectedImage } = location.state || {};

  const [backgroundColor, setBackgroundColor] = useState("#f4f4f4");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [blur, setBlur] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("colors");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [images, setImages] = useState([bg, bg1, bg3, bg4, bg5, bg6]);
  const [uploadImage, setUploadImage] = useState("");
  const [processedImage, setProcessedImage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const colorPickerRef = useRef(null);
  const canvasRef = useRef(null);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const colorOptions = [
    "#CAC693",
    "#f8b400",
    "#ff5733",
    "#33c9ff",
    "#75ff33",
    "#ff6f61",
  ];


  useEffect(() => {
    drawCanvas();
  }, [
    backgroundColor,
    backgroundImage,
    blur,
    processedImage,
    zoom,
    imagePosition,
    rotation,
  ]);

  const drawCanvas = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imgSrc = processedImage || image;
    if (!imgSrc) return;

    try {
      const originalImg = await loadImage(imgSrc);
      canvas.width = originalImg.width;
      canvas.height = originalImg.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (backgroundImage) {
        const bgImg = await loadImage(backgroundImage);
        ctx.filter = `blur(${blur}px)`;
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.filter = `blur(${blur}px)`;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.filter = "none";

      ctx.save();
      ctx.translate(
        imagePosition.x + (originalImg.width * zoom) / 2,
        imagePosition.y + (originalImg.height * zoom) / 2
      );
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.drawImage(
        originalImg,
        -originalImg.width / 2,
        -originalImg.height / 2,
        originalImg.width,
        originalImg.height
      );
      ctx.restore();
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  const saveToUndoStack = () => {
    setUndoStack((prev) => [
      {
        backgroundColor,
        backgroundImage,
        blur,
        zoom,
        imagePosition,
        rotation,
      },
      ...prev,
    ]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[0];
    setRedoStack((prev) => [
      {
        backgroundColor,
        backgroundImage,
        blur,
        zoom,
        imagePosition,
        rotation,
      },
      ...prev,
    ]);
    setUndoStack((prev) => prev.slice(1));
    setBackgroundColor(lastState.backgroundColor);
    setBackgroundImage(lastState.backgroundImage);
    setBlur(lastState.blur);
    setZoom(lastState.zoom);
    setImagePosition(lastState.imagePosition);
    setRotation(lastState.rotation);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[0];
    setUndoStack((prev) => [
      {
        backgroundColor,
        backgroundImage,
        blur,
        zoom,
        imagePosition,
        rotation,
      },
      ...prev,
    ]);
    setRedoStack((prev) => prev.slice(1));
    setBackgroundColor(nextState.backgroundColor);
    setBackgroundImage(nextState.backgroundImage);
    setBlur(nextState.blur);
    setZoom(nextState.zoom);
    setImagePosition(nextState.imagePosition);
    setRotation(nextState.rotation);
  };

  const handleBackgroundColorChange = (color) => {
    saveToUndoStack();
    setBackgroundColor(color);
    setBackgroundImage(null);
    setBlur(0);
  };

  const handleBackgroundImageChange = (imageUrl) => {
    saveToUndoStack();
    setBackgroundImage(imageUrl);
    setBackgroundColor("transparent");
    setBlur(0);
  };

  const handleBlurChange = (event, newValue) => {
    saveToUndoStack();
    setBlur(newValue);
  };

  const ZOOM_STEP = 0.1;
  const MAX_ZOOM = 3.0;
  const MIN_ZOOM = 0.5;

  const zoomIn = () => {
    setZoom((prevZoom) => {
      const newZoom = Math.min(prevZoom + ZOOM_STEP, MAX_ZOOM);
      return Math.round(newZoom * 10) / 10;
    });
  };

  const zoomOut = () => {
    setZoom((prevZoom) => {
      const newZoom = Math.max(prevZoom - ZOOM_STEP, MIN_ZOOM);
      return Math.round(newZoom * 10) / 10;
    });
  };

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    saveToUndoStack();
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setImagePosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResetSettings = () => {
    setBackgroundColor("#ffffff");
    setBackgroundImage(null);
    setBlur(0);
    setZoom(1);
    setImagePosition({ x: 0, y: 0 });
    setRotation(0);
    setSnackbar({
      open: true,
      message: "Settings reset to default!",
      severity: "info",
    });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "edited-image.png";
    link.click();
  };

  const handleChange = (e) => {
    const files = e.target.files;
    const imageUrls = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  };

  const handleRemoveBackground = async (file) => {
    if (!file) {
      console.log("Please upload an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "https://4zlyr2-5000.csb.app/remove-background",
        formData,
        { responseType: "blob" }
      );

      const imageUrl = URL.createObjectURL(response.data);
      setProcessedImage(imageUrl);
    } catch (err) {
      console.log("Error removing background", err);
      throw err;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadImage(URL.createObjectURL(file));
    setProcessedImage(null);
    setIsProcessing(true);
    setBackgroundImage(null);
    setBackgroundColor("#f4f4f4");
    setBlur(null);
    setSnackbar({
      open: true,
      message: "Processing image. Please wait...",
      severity: "info",
    });

    try {
      await handleRemoveBackground(file);
      setSnackbar({
        open: true,
        message: "Background removed successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to remove background. Please try again.",
        severity: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, position: "relative" }}>
            <Tooltip title="Upload & Remove BG" arrow>
              <Button
                variant="outlined"
                onClick={() =>
                  document.getElementById("bg-remove-image").click()
                }
              >
                {isProcessing ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <GrAddCircle className="text-2xl" />
                  </>
                )}
              </Button>
            </Tooltip>
            <input
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              id="bg-remove-image"
              style={{ display: "none" }}
            />

            {processedImage || image ? (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    width: 400,
                    maxWidth: "600px",
                    borderRadius: 15,
                    cursor: "move",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                ></canvas>

                {isProcessing && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,255,255,0.7)",
                      borderRadius: 15,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  mt: 2,
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f0f0f0",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" color="textSecondary">
                  No image provided
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Box display="flex" justifyContent="space-between" gap={2}>
              <Button
                variant={activeTab === "colors" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setActiveTab("colors")}
                fullWidth
              >
                Colors
              </Button>
              <Button
                variant={activeTab === "images" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setActiveTab("images")}
                fullWidth
              >
                Images
              </Button>
              <Button
                variant={activeTab === "blur" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setActiveTab("blur")}
                fullWidth
              >
                Blur
              </Button>
            </Box>

            <Box>
              {activeTab === "colors" && (
                <Box display="flex" flexDirection="column" gap={2}>
                  <Tooltip title="Choose Color" arrow>
                    <Button
                      variant="contained"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      sx={{
                        height: 40,
                        backgroundColor: "#f9f9f9",
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        width="24"
                        height="24"
                        src="https://img.icons8.com/color/48/rgb-circle-1--v1.png"
                        alt="Color Picker"
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        Pick Color
                      </Typography>
                    </Button>
                  </Tooltip>
                  {showColorPicker && (
                    <Box
                      ref={colorPickerRef}
                      sx={{
                        position: "absolute",
                        zIndex: 10,
                        mt: 2,
                      }}
                    >
                      <Sketch
                        color={backgroundColor}
                        onChange={(color) =>
                          handleBackgroundColorChange(color.hex)
                        }
                      />
                      <Button
                        onClick={() => setShowColorPicker(false)}
                        sx={{ mt: 1 }}
                        fullWidth
                        variant="outlined"
                      >
                        Close
                      </Button>
                    </Box>
                  )}

                  <Typography variant="subtitle1" gutterBottom>
                    Preset Colors:
                  </Typography>
                  <Grid container spacing={1}>
                    {colorOptions.map((color, index) => (
                      <Grid item xs={2.9} key={index}>
                        <Button
                          onClick={() => handleBackgroundColorChange(color)}
                          sx={{
                            height: 35,
                            backgroundColor: color,
                            border: "1px solid #ccc",
                            "&:hover": {
                              border: "1px solid #000",
                            },
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {activeTab === "images" && (
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<GrAddCircle />}
                    onClick={() =>
                      document.getElementById("bg-image-upload").click()
                    }
                    fullWidth
                  >
                    Add Image
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    id="bg-image-upload"
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                  <Typography variant="subtitle1" gutterBottom>
                    Select Background Image:
                  </Typography>
                  <Grid container spacing={1}>
                    {images.map((img, index) => (
                      <Grid item xs={3} key={index}>
                        <img
                          onClick={() => handleBackgroundImageChange(img)}
                          src={img}
                          alt={`Background Option ${index + 1}`}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {activeTab === "blur" && (
                <Box display="flex" flexDirection="column" gap={2}>
                  <Typography id="blur-slider" gutterBottom>
                    Blur Background: {blur}px
                  </Typography>
                  <Slider
                    value={blur}
                    onChange={handleBlurChange}
                    min={0}
                    max={20}
                    aria-labelledby="blur-slider"
                  />
                  <Box display="flex" gap={2}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleResetSettings}
                      fullWidth
                    >
                      Reset
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                onClick={downloadImage}
                variant="contained"
                color="success"
                fullWidth
                disabled={!processedImage && !image}
              >
                Download Image
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 2,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Tooltip title="Undo" arrow>
            <span>
              <Button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                variant="outlined"
              >
                <Undo />
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Redo" arrow>
            <span>
              <Button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                variant="outlined"
              >
                <Redo />
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Zoom In" arrow>
            <Button onClick={zoomIn} variant="outlined">
              <ZoomIn />
            </Button>
          </Tooltip>
          <Tooltip title="Zoom Out" arrow>
            <Button onClick={zoomOut} variant="outlined">
              <ZoomOut />
            </Button>
          </Tooltip>

          <Tooltip title="Rotate Left" arrow>
            <Button
              onClick={() => {
                saveToUndoStack();
                setRotation((prev) => prev - 30);
              }}
              variant="outlined"
            >
              <RotateLeft />
            </Button>
          </Tooltip>
          <Tooltip title="Rotate Right" arrow>
            <Button
              onClick={() => {
                saveToUndoStack();
                setRotation((prev) => prev + 30);
              }}
              variant="outlined"
            >
              <RotateRight />
            </Button>
          </Tooltip>
          <Tooltip title="Reset All Settings" arrow>
            <Button onClick={handleResetSettings} variant="outlined">
              <ResetTvRounded />
            </Button>
          </Tooltip>
        </Paper>
      </Box>

      <Box mt={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography textAlign="center" variant="h6" gutterBottom>
              Compared Image
            </Typography>
            {uploadImage || (selectedImage && processedImage) || image ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  overflow: "hidden",
                  maxHeight: "400px",
                }}
              >
                <ReactCompareSlider
                  itemOne={
                    <ReactCompareSliderImage
                      src={processedImage || image}
                      alt="Original"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src={uploadImage || selectedImage}
                      alt="Comparison"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                  }
                />
              </Box>
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f0f0f0",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" color="textSecondary">
                  No image provided
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default EditBackground;
