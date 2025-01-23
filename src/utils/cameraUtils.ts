export const requestCameraPermission = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: "environment"
      } 
    });
    return true;
  } catch (error) {
    console.error("Camera permission error:", error);
    return false;
  }
};