import React, { useRef, useEffect, useState } from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import { LuScanLine } from "react-icons/lu";
import { IoEyeSharp } from "react-icons/io5";
import styled, { keyframes } from "styled-components";
import { MdHistory } from "react-icons/md";
import jsQR from "jsqr";
import { useLocation } from "react-router-dom";
import HistoryModal from "../components/HistoryModal";
import CheckingModal from "../components/CheckingModal";
import SuccessComponent from "../components/SuccessComponent";
import Notification from "../components/Notification.jsx";
import axios from "axios";
import { PiSpinner } from "react-icons/pi";

//  const getCurrentMonthKey = () => {
//     const now = new Date();
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
//   };

function MainScreen() {
  const location = useLocation();
  const startCameraOnLoad = location.state?.startCamera || false;
  const videoRef = useRef(null);
  const [openBottomSheet, setBottomSheetVisibility] = useState(false);
  const [openCheckinSheet, setCheckinSheetVisibility] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const scannedRef = useRef(false);
  const animationFrameId = useRef(null);
  const getTodayKey = () => new Date().toISOString().split("T")[0];
  const [success, setSuccess] = useState({ msg: "", state: false });
  const [qrCode, setQrCode] = useState("");
  const [notification, setNotification] = useState(false);
  const [userCoods, setUserCoods] = useState({});
  const [error, setError] = useState(false);
  const [msgNotification, setMsgNotification] = useState({
    visibility: false,
    msg: "",
  });
  const isTesting = false;

  // =========================================================
  // INIT DAILY STORAGE
  // =========================================================
  useEffect(() => {
    if (!startCameraOnLoad) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let stream = null;

    //  FUNCTION TO START CAMERA
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        videoRef.current.muted = true;
        await videoRef.current.play();
        const scanFrame = () => {
          const video = videoRef.current;
          if (
            video &&
            video.readyState === video.HAVE_ENOUGH_DATA &&
            !scannedRef.current
          ) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            if (code && !scannedRef.current) {
              setQrCode(code.data);
            }
          }
          animationFrameId.current = requestAnimationFrame(scanFrame);
        };
        scanFrame();
      } catch (err) {
        console.log(err);
        alert("Cannot access camera. Please allow camera permission.");
      }
    };
    startCamera();
    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      scannedRef.current = false;
    };
  }, [startCameraOnLoad]);

  // =========================================================
  // COORDINATES
  // =========================================================
  const getUserCoordinates = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log("USER COORDS:", coords);
          setUserCoods(coords);
          resolve(coords);
        },
        (error) => {
          console.log("LOCATION ERROR:", error);
          reject(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    });
  };

  //  FUCNTION TO GET CURRENT MONTH
  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };
  const sanitizeInjectedQrCode = (code = "") => code.replace(/\/\//g, "");

  // FUNCTION TO DETECT LATE COMING
  const DetectLateComing = (type = "CHECKIN") => {
    const hour = new Date().getHours();
    if (type === "CHECKIN") return hour > 10;
    return hour > 17;
  };

  // =========================================================
  //  FUNCTION TO AUTOMATIC CHOOSE ENDPOINT BASED ON MODE
  const SINGLE_CHECKING_URL = isTesting
    ? "http://localhost:5000/api/handleChecking"
    : "https://mile83autos-api-backend-1.onrender.com/api/handleChecking";

  // FUNCTION TO TAG FIRST TIMER DEVICE
  const tagFirstTimerDevice = (_userId = "") => {
    const _checkFirstTimerDevice = localStorage.getItem("IS_DEVICE_ACTIVE_YET");
    if (_checkFirstTimerDevice === null) {
      localStorage.setItem(
        "IS_DEVICE_ACTIVE_YET",
        JSON.stringify({
          status: 1,
          userId: _userId,
        }),
      );
    } else if (_checkFirstTimerDevice != null) {
      return;
    }
  };
  // --------------------------------

  // =========================================================
  // SCAN QR CODE
  // =========================================================
  const scanQRCode = async () => {
    if (!videoRef.current || spinner) return;
    try {
      setSpinner(true);
      scannedRef.current = true;
      // try {
      //   userLocation = await Promise.race([
      //     getUserCoordinates(),
      //     new Promise((resolve) => setTimeout(() => resolve(null), 5000)),
      //   ]);
      // } catch (e) {
      //   console.log(e);
      // }
      let userLocation = await getUserCoordinates();
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (!code) {
        setNotification(true);
        setTimeout(() => {
          setNotification(false);
        }, 2500);
        scannedRef.current = false;
        return;
      }
      const sanitizedCode = sanitizeInjectedQrCode(code.data);
      const checkinLate = DetectLateComing("CHECKIN");
      const checkoutLate = DetectLateComing("CHECKOUT");
      const payload = {
        virtual_serial_id: sanitizedCode,
        date: new Date().toLocaleDateString(),
        month: getCurrentMonthKey(),
        position_logging: userLocation || null,
        checkInTime: new Date().toLocaleTimeString(),
        checkOutTime: new Date().toLocaleTimeString(),
        checkInDescription: checkinLate
          ? "came late to work"
          : "came early to work",
        checkOutDescription: checkoutLate
          ? "checked out late"
          : "checked out early",
      };
      console.log(payload);
      // const response = await axios.post(SINGLE_CHECKING_URL, payload);
      // if (response.status === 200) {
      //   tagFirstTimerDevice(sanitizedCode);
      //   const isCheckin = response.data.type === "checkin";
      //   setSuccess({
      //     state: true,
      //     msg:
      //       response.data.position === "outside"
      //         ? isCheckin
      //           ? "You checked in outside office"
      //           : "You checked out outside office"
      //         : isCheckin
      //           ? checkinLate
      //             ? "You checked in late"
      //             : "Welcome to office"
      //           : checkoutLate
      //             ? "You checked out late"
      //             : "Goodbye",
      //   });
      //   setTimeout(() => {
      //     setSuccess({
      //       state: false,
      //       msg: "",
      //     });
      //   }, 3000);
      // }
    } catch (err) {
      console.log(err);
      const status = err?.response?.status;
      if (status === 404) {
        setMsgNotification({
          visibility: true,
          msg: "User not found",
        });
      } else if (status === 403) {
        setMsgNotification({
          visibility: true,
          msg: "Not approved",
        });
      } else if (status === 402) {
        setMsgNotification({
          visibility: true,
          msg: "Attendance already completed today",
        });
      } else {
        setMsgNotification({
          visibility: true,
          msg: "Something went wrong",
        });
      }
    } finally {
      scannedRef.current = false;
      setTimeout(() => {
        setSpinner(false);
      }, 800);
    }
  };
  // ================= UI (UNCHANGED) =================
  return (
    <>
      {msgNotification.visibility && (
        <Notification
          title="Notification"
          description={msgNotification.msg}
          onClose={() => setMsgNotification({ visibility: false, msg: "" })}
        />
      )}

      {notification && (
        <Notification
          title="Notification"
          description={error ? "Invalid Code" : "No Code Detected"}
          onClose={() => setNotification(false)}
        />
      )}

      {success.state && <SuccessComponent msg={success.msg} />}

      {openBottomSheet && (
        <HistoryModal onClose={() => setBottomSheetVisibility(false)} />
      )}

      {openCheckinSheet && (
        <CheckingModal onExit={() => setCheckinSheetVisibility(false)} />
      )}

      <Container>
        <CameraContainer>
          <VideoCamera ref={videoRef} autoPlay playsInline muted />
          <EyeIcon />
          <ShimmerOverlay />
        </CameraContainer>

        <ControlPanelContainer>
          <HistoryIcon onClick={() => setBottomSheetVisibility(true)} />

          <ScanButton onClick={scanQRCode}>
            {spinner ? <SpinnerIcon /> : <ScanIcon />}
          </ScanButton>

          <PeopleIcon onClick={() => setCheckinSheetVisibility(true)} />
        </ControlPanelContainer>
      </Container>
    </>
  );
}

/* styles unchanged */
const Container = styled.div`
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const CameraContainer = styled.div`
  margin-top: 10%;
  height: 65%;
  width: 100%;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: #111;
`;

const VideoCamera = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
`;

const ShimmerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  animation: ${shimmer} 1.5s infinite linear;
`;

const ControlPanelContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 80px;
  align-items: center;
  min-height: 80px;
`;

const PeopleIcon = styled(BsFillPeopleFill)`
  font-size: 30px;
`;

const HistoryIcon = styled(MdHistory)`
  font-size: 30px;
`;

const ScanIcon = styled(LuScanLine)`
  font-size: 30px;
  color: ivory;
`;

const ScanButton = styled.button`
  background: black;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
`;

const EyeIcon = styled(IoEyeSharp)`
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 45px;
  color: rgba(255, 255, 255, 0.4);
  z-index: 3;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinnerIcon = styled(PiSpinner)`
  font-size: 22px;
  color: ivory;
  animation: ${spin} 0.8s linear infinite;
`;

export default MainScreen;
