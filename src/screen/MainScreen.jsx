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

function MainScreen() {
  const location = useLocation();
  const startCameraOnLoad = location.state?.startCamera || false;
  const videoRef = useRef(null);
  const [openBottomSheet, setBottomSheetVisibility] = useState(false);
  const [openCheckinSheet, setCheckinSheetVisibility] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [success, setSuccess] = useState({
    msg: "",
    state: false,
  });
  const [qrCode, setQrCode] = useState("");
  const [notification, setNotification] = useState(false);
  const [userCoods, setUserCoods] = useState({});
  const [error, setError] = useState(false);
  const GLOBAL_LOCAL_STORAGE_TRIAL = "GLOBAL_TRIAL_OBJECT_STORE";
  const [trialNotification, setTrialNotification] = useState(false);
  const [network_outage_notification, set_network_outage_notification] =
    useState(false);
  const [msgNotification, setMsgNotification] = useState({
    visibility: false,
    msg: "",
  });

  // =========================================================
  // CAMERA INITIALIZATION
  // =========================================================

  useEffect(() => {
    if (!startCameraOnLoad) return;
    let animationFrameId;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    // HANDLE TRIAL INITIALIZATION
    const handleTrial = () => {
      const checkIfTrialExist = localStorage.getItem(
        GLOBAL_LOCAL_STORAGE_TRIAL,
      );
      if (checkIfTrialExist === null) {
        localStorage.setItem(
          GLOBAL_LOCAL_STORAGE_TRIAL,
          JSON.stringify({
            scanning_trial: 2,
          }),
        );
      }
    };
    // START CAMERA

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true);
          videoRef.current.muted = true;
          await videoRef.current.play();
          const scanFrame = () => {
            if (
              videoRef.current &&
              videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
            ) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              context.drawImage(
                videoRef.current,
                0,
                0,
                canvas.width,
                canvas.height,
              );
              const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
              );
              const code = jsQR(imageData.data, canvas.width, canvas.height);
              if (code) {
                setQrCode(code.data);
              }
            }
            animationFrameId = requestAnimationFrame(scanFrame);
          };
          scanFrame();
        }
      } catch (err) {
        console.log(err);
        alert("Cannot access camera. Please allow camera permission.");
      }
    };
    startCamera();
    handleTrial();
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCameraOnLoad]);

  // =========================================================
  // GET USER COORDINATES
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
          setUserCoods(coords);
          resolve(coords);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject("Location permission denied");
              break;
            case error.POSITION_UNAVAILABLE:
              reject("Position unavailable");
              break;
            case error.TIMEOUT:
              reject("Location request timed out");
              break;
            default:
              reject("Unknown location error");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        },
      );
    });
  };

  // =========================================================
  // GET CURRENT MONTH
  // =========================================================

  const getCurrentMonthKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  // =========================================================
  // SANITIZE QR CODE
  // =========================================================
  const sanitizeInjectedQrCode = (code = "") => {
    return code.replace(/\/\//g, "");
  };

  // =========================================================
  // DETECT LATE COMING
  // =========================================================
  const DetectLateComing = (type = "CHECKIN") => {
    const STANDARD_RESUMPTION_TIME = 10;
    const STANDARD_CLOSING_TIME = 17;
    const currentHour = new Date().getHours();
    if (type === "CHECKIN") {
      return currentHour > STANDARD_RESUMPTION_TIME ? true : false;
    }
    return currentHour > STANDARD_CLOSING_TIME ? true : false;
  };

  // =========================================================
  // ENDPOINTS
  // =========================================================
  const Endpoint = {
    checkin_local: "http://localhost:5000/api/checkinStaff",
    checkout_local: "http://localhost:5000/api/checkoutStaff",
    checkin_production:
      "https://mile83autos-api-backend-1.onrender.com/api/checkinStaff",
    checkout_production:
      "https://mile83autos-api-backend-1.onrender.com/api/checkoutStaff",
  };

  // =========================================================
  // AUTO CHANGE ENDPOINT
  // =========================================================
  const autoChangeEndpointBasedOnTrials = (isOnProd = false) => {
    let _GLOBAL_AUTO_ENDPOINT = "";
    const _getTrials = localStorage.getItem(GLOBAL_LOCAL_STORAGE_TRIAL);
    const _sanitizedTrialData = JSON.parse(_getTrials);
    if (Number(_sanitizedTrialData["scanning_trial"]) === 2) {
      _GLOBAL_AUTO_ENDPOINT = isOnProd
        ? Endpoint.checkin_production
        : Endpoint.checkin_local;
    } else if (Number(_sanitizedTrialData["scanning_trial"]) === 1) {
      _GLOBAL_AUTO_ENDPOINT = isOnProd
        ? Endpoint.checkout_production
        : Endpoint.checkout_local;
    }
    return _GLOBAL_AUTO_ENDPOINT;
  };

  // =========================================================
  // CLOSE NOTIFICATION
  // =========================================================
  const closeNotificationBadge = () => {
    setNotification(false);
  };

  // =========================================================
  // UPDATE TRIAL COUNT
  // =========================================================
  const CalculateTrialNo = (type) => {
    const _getTrialNo = localStorage.getItem(GLOBAL_LOCAL_STORAGE_TRIAL);
    const _sanitizedTrialData = JSON.parse(_getTrialNo);
    if (type === "CHECKIN") {
      const newTrialNo = Number(_sanitizedTrialData["scanning_trial"]) - 1;
      localStorage.setItem(
        GLOBAL_LOCAL_STORAGE_TRIAL,
        JSON.stringify({
          scanning_trial: newTrialNo,
        }),
      );
    } else {
      localStorage.setItem(
        GLOBAL_LOCAL_STORAGE_TRIAL,
        JSON.stringify({
          scanning_trial: 2,
        }),
      );
    }
  };

  // =========================================================
  // SCAN QR CODE
  // =========================================================
  const scanQRCode = async () => {
    if (!videoRef.current) return;
    try {
      setSpinner(true);
      // GET USER LOCATION
      const userLocation = await getUserCoordinates();
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      // NO QR DETECTED
      if (!code) {
        setSpinner(false);
        setNotification(true);
        setError(false);
        setTimeout(() => {
          setNotification(false);
        }, 3000);
        return;
      }
      // SANITIZE QR
      const sanitizedCode = sanitizeInjectedQrCode(code.data);
      setQrCode(sanitizedCode);
      // PAYLOAD
      const payload = {
        virtual_serial_id: sanitizedCode,
        date: new Date().toLocaleDateString(),
        checkInTime: new Date().toLocaleTimeString(),
        checkInDescription: `came ${
          DetectLateComing() ? "late" : "early"
        } to work`,
        checkOutTime: new Date().toLocaleTimeString(),
        checkOutDescription: `checkedout ${
          DetectLateComing("CHECKOUT") ? "late" : "early"
        } today`,
        month: getCurrentMonthKey(),
        position_logging: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
      };
      // SEND REQUEST
      const response = await axios.post(
        autoChangeEndpointBasedOnTrials(true),
        payload,
      );
      // HANDLE RESPONSE
      switch (response.status) {
        case 200:
          if (response.data.type === "checkin") {
            setSuccess({
              state: true,

              msg:
                response.data.position === "outside"
                  ? "Looks like you checked in outside office"
                  : "Welcome to office",
            });

            setTimeout(() => {
              setSuccess({
                state: false,
                msg: "",
              });

              CalculateTrialNo("CHECKIN");
            }, 3000);
          } else if (response.data.type === "checkout") {
            setSuccess({
              state: true,

              msg:
                response.data.position === "outside"
                  ? "Looks like you checked out outside office"
                  : "Goodbye from office",
            });

            setTimeout(() => {
              setSuccess({
                state: false,
                msg: "",
              });

              CalculateTrialNo("CHECKOUT");
            }, 3000);
          }

          break;

        case 403:
          setMsgNotification({
            visibility: true,
            msg: "You are not verified yet",
          });

          break;

        case 404:
          setMsgNotification({
            visibility: true,
            msg: "User not found",
          });

          break;

        default:
          setMsgNotification({
            visibility: true,
            msg: "Something went wrong",
          });
      }
    } catch (err) {
      console.log(err);

      set_network_outage_notification(true);

      setTimeout(() => {
        set_network_outage_notification(false);
      }, 3000);

      setMsgNotification({
        visibility: true,
        msg: err?.message || String(err),
      });

      setTimeout(() => {
        setMsgNotification({
          visibility: false,
          msg: "",
        });
      }, 3000);
    } finally {
      setSpinner(false);
    }
  };

  return (
    <>
      {msgNotification.visibility && (
        <Notification
          title="Notification"
          description={msgNotification.msg}
          onClose={() => {
            setMsgNotification({
              visibility: false,
              msg: "",
            });
          }}
        />
      )}

      {notification && (
        <Notification
          title="Notification"
          description={error ? "Invalid Code" : "No Code Detected"}
          onClose={() => {
            closeNotificationBadge();
          }}
        />
      )}

      {trialNotification && (
        <Notification
          title="Notification"
          description="You have scanned twice today"
          onClose={() => {
            setTrialNotification(false);
          }}
        />
      )}

      {network_outage_notification && (
        <Notification
          title="Notification"
          description="Something went wrong or no internet"
          onClose={() => {
            set_network_outage_notification(false);
          }}
        />
      )}

      {success.state && <SuccessComponent msg={success.msg} />}

      {openBottomSheet && (
        <HistoryModal
          onClose={() => {
            setBottomSheetVisibility(false);
          }}
        />
      )}

      {openCheckinSheet && (
        <CheckingModal
          onExit={() => {
            setCheckinSheetVisibility(false);
          }}
        />
      )}

      <Container>
        <CameraContainer>
          <VideoCamera ref={videoRef} />

          <EyeIcon />

          <ShimmerOverlay />
        </CameraContainer>

        <ControlPanelContainer>
          <HistoryIcon
            onClick={() => {
              setBottomSheetVisibility(true);
            }}
          />

          <ScanButton onClick={scanQRCode}>
            {spinner ? <SpinnerIcon /> : <ScanIcon />}
          </ScanButton>

          <PeopleIcon
            onClick={() => {
              setCheckinSheetVisibility(true);
            }}
          />
        </ControlPanelContainer>
      </Container>
    </>
  );
}

/* ================= STYLES ================= */

const Container = styled.div`
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const shimmer = keyframes`
  0% {
    background-position: -400px 0;
  }

  100% {
    background-position: 400px 0;
  }
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

const eyeBlink = keyframes`
  0%, 92%, 100% {
    transform: translate(-50%, -50%) scaleY(1);
  }

  95% {
    transform: translate(-50%, -50%) scaleY(0.1);
  }

  97% {
    transform: translate(-50%, -50%) scaleY(1);
  }
`;

const EyeIcon = styled(IoEyeSharp)`
  position: absolute;
  top: 50%;
  left: 50%;

  font-size: 45px;

  color: rgba(255, 255, 255, 0.4);

  z-index: 3;

  animation: ${eyeBlink} 3s infinite ease-in-out;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const SpinnerIcon = styled(PiSpinner)`
  font-size: 22px;
  color: ivory;

  animation: ${spin} 0.8s linear infinite;
`;

export default MainScreen;
