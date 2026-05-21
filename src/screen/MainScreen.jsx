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
// import dateManager from "../utils/dateManager.js";

function MainScreen() {
  const location = useLocation();
  const startCameraOnLoad = location.state?.startCamera || false;
  const [openBottomSheet, setBottomSheetVisibility] = useState(false);
  const [openCheckinSheet, setCheckinSheetVisibility] = useState(false);
  const [success, setSuccess] = useState({
    msg: "",
    state: false,
  });
  const videoRef = useRef(null);
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

  // load camera on start
  useEffect(() => {
    if (!startCameraOnLoad) return;
    let animationFrameId;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // FUNCTION TO HANDLE USER TRIALS
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
    // ==================================================

    //  FUNCTION TO HANDLE CAMERA
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true"); // important for iOS
          videoRef.current.muted = true; // prevent autoplay issues
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
              if (code) setQrCode(code.data);
            }
            animationFrameId = requestAnimationFrame(scanFrame);
          };
          scanFrame();
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Cannot access camera. Please check permissions.");
      }
    };
    startCamera();
    handleTrial(); // FUNCTION TO HANDLE AUTO CREATION OF TRIAL IF NOT EXIST CREATE NEW ONE
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCameraOnLoad]);

  // -------------------------------------------------
  //  function to get User coordinates ;
  const getUserCoordinates = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const params = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserCoods(params);
        },
        (error) => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      console.log("geolocation not supported");
    }
  };

  // --------------------------------------------------------
  //  function to calculate current month
  function getCurrentMonthKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  //  function to sanitise qr-code
  const sanitizeInjectedQrCode = (code = "") => {
    const sanitizedCode = code.replace(/\/\//g, "");
    return sanitizedCode;
  };

  //  function to detect early or late coming ;
  const DetectLateComing = (type = "CHECKIN") => {
    const STANDARD_RESUMPTION_TIME = 10;
    const STANDARD_CLOSING_TIME = 17;
    if (type === "CHECKIN") {
      const getCurrentTime = new Date().getHours();
      if (getCurrentTime > STANDARD_RESUMPTION_TIME) {
        return true; // user is late to work;
      } else {
        return false; // user came early to work
      }
    } else if (type === "CHECKOUT") {
      const getCurrentTime = new Date().getHours();
      if (getCurrentTime > STANDARD_CLOSING_TIME) {
        return true; // user left work late
      } else {
        return false; // user left work early
      }
    }
  };

  // DEFINE ENDPOINT URL
  const Endpoint = {
    isOnProd: false,
    checkin_local: "http://localhost:5000/api/checkinStaff",
    checkout_local: "http://localhost:5000/api/checkoutStaff",
    checkin_production:
      "https://mile83autos-api-backend-1.onrender.com/api/checkinStaff",
    checkout_production:
      "https://mile83autos-api-backend-1.onrender.com/api/checkoutStaff",
  };

  // FUNCTION TO AUTO DETECT WHICH ENDPOINT TO USER BASED ON TRIALS
  const autoChangeEndpointBasedOnTrials = (isOnProd = false) => {
    const _GLOBAL_AUTO_ENDPOINT = "";
    let _getTrials = localStorage.getItem(GLOBAL_LOCAL_STORAGE_TRIAL);
    const _sanitizedTrialData = JSON.parse(_getTrials);
    if (Number(_sanitizedTrialData["scanning_trial"]) === 2) {
      _GLOBAL_AUTO_ENDPOINT = isOnProd
        ? Endpoint["checkin_production"]
        : Endpoint["checkin_local"];
    } else if (Number(_sanitizedTrialData) === 1) {
      _GLOBAL_AUTO_ENDPOINT = isOnProd
        ? Endpoint["checkout_production"]
        : Endpoint["checkout_local"];
    }
    return _GLOBAL_AUTO_ENDPOINT;
  };
  // =====================================================================

  //  function to remove notification badge ;
  const closeNotificationBadge = () => {
    setNotification(false);
  };

  // FUNCTION TO HANDLE TRIAL NUMBER CALCULATION
  const CalculateTrialNo = (type) => {
    const _getTrialNo = localStorage.getItem(GLOBAL_LOCAL_STORAGE_TRIAL);
    const _sanitizedTrialData = JSON.parse(_getTrialNo);
    if (type === "CHECKIN") {
      let newTrialNo = Number(_sanitizedTrialData["scanning_trial"]) - 1;
      localStorage.setItem(
        GLOBAL_LOCAL_STORAGE_TRIAL,
        JSON.stringify({
          scanning_trial: newTrialNo,
        }),
      );
    } else {
      let _newTrialNo = 2;
      localStorage.setItem(
        GLOBAL_LOCAL_STORAGE_TRIAL,
        JSON.stringify({
          scanning_trial: _newTrialNo,
        }),
      );
    }
  };
  // ======================================

  // ================================================================
  //  FUNCTION TO HANDLE QRCODE SCANNING
  const scanQRCode = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    const _get_trial_object_store = localStorage.getItem(
      GLOBAL_LOCAL_STORAGE_TRIAL,
    );
    const sanitizedObjectTrial = JSON.parse(_get_trial_object_store);
    if (Number(sanitizedObjectTrial["scanning_trial"]) < 2) {
      //  CHECK IF THERE IS ANY CODE DETECTED IF NOT RETURN NULL
      if (code) {
        try {
          //  DEFINE CHECKIN PAYLOAD
          const payload = {
            virtual_serial_id: sanitizeInjectedQrCode(code),
            date: new Date().toLocaleDateString(),
            checkInTime: new Date().toLocaleTimeString(),
            checkInDescription: `came ${DetectLateComing() ? "late" : "early"} to work`,
            checkOutTime: new Date().toLocaleTimeString(),
            checkOutDescription: `checkedout ${DetectLateComing("CHECKOUT") ? "late" : "early"} today`,
            month: getCurrentMonthKey(),
            position_logging: userCoods,
          };
          const response = await axios.post(
            autoChangeEndpointBasedOnTrials(true),
            payload,
          );
          switch (response.status) {
            case 200:
              if (response.data.type === "checkin") {
                setSuccess({
                  state: true,
                  msg:
                    response.data.position === "outside"
                      ? "Looks like you checkin outside the office, welcome"
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
                      ? "Looks like you checkin outside the office, welcome"
                      : "Welcome to office",
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
                msg: "You are not verified yet, contact admin",
              });
              setTimeout(() => {
                setMsgNotification({
                  visibility: false,
                  msg: "",
                });
              }, 3000);
              break;
            case 404:
              setMsgNotification({
                visibility: true,
                msg: "User not found",
              });
              setTimeout(() => {
                setMsgNotification({
                  visibility: false,
                  msg: "",
                });
              }, 3000);
              break;
          }
        } catch (err) {
          set_network_outage_notification(true);
          setTimeout(() => {
            set_network_outage_notification(false);
          }, 3000);
          clearTimeout();
        }
      } else {
        setNotification(true);
        setError(false);
        setTimeout(() => {
          setNotification(false);
        }, 3000);
      }
    } else {
      setTrialNotification(true);
      setTimeout(() => {
        setTrialNotification(false);
      }, 4000);
      clearTimeout();
    }
  };
  return (
    <>
      {/* ================= THIS NOTIFICATION SECTION IS FOR TRIALS =============== */}
      {msgNotification["visibility"] && (
        <Notification
          title="Notification"
          description={msgNotification["msg"]}
          onClose={() => {
            setMsgNotification({
              visibility: false,
              msg: "",
            });
          }}
        />
      )}

      {/* ==================================================================================== */}

      {notification && (
        <Notification
          title="Notification"
          description={
            error == true ? "Invalid Code" : "No Code Detected, try again !"
          }
          onClose={() => {
            closeNotificationBadge();
          }}
        />
      )}

      {/*================= THIS NOTIFICATION SECTION IS FOR TRIALS=====  */}
      {trialNotification && (
        <Notification
          title="Notification"
          description={
            trialNotification === true &&
            "You have scan twice today, try tomorrow"
          }
          onClose={() => {
            setTrialNotification(false);
          }}
        />
      )}
      {/* ================== THIS NOTIFICATION SECTION IS FOR TRIALS ========= */}

      {/* ============================ NETWORK OUTAGE NOTIFICATION =============== */}
      {network_outage_notification && (
        <Notification
          title="Notification"
          description={
            network_outage_notification === true &&
            "Something went wrong or no internet"
          }
          onClose={() => {
            set_network_outage_notification(false);
          }}
        />
      )}
      {/* NETWORK OUTAGE NOTIFICATION ============================================ */}

      {/* ====================================================================== */}
      {/* Success component */}
      {success["state"] && <SuccessComponent msg={success["msg"]} />}
      {/*  Success component */}
      {/* ============================================================== */}

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
          <ScanButton
            onClick={() => {
              scanQRCode();
              getUserCoordinates();
            }}
          >
            <ScanIcon />
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

/* ---------- STYLES ---------- */
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
  top: 0;
  left: 0;
  z-index: 1;
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
  z-index: 2;
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
  transition: linear, 100ms;
  &:hover {
    transform: scale(0.9);
  }
`;

const HistoryIcon = styled(MdHistory)`
  font-size: 30px;
  transition: linear, 100ms;
  &:hover {
    transform: scale(0.9);
  }
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
  transition: linear, 100ms;
  &:hover {
    transform: scale(0.9);
  }
`;

const eyeBlink = keyframes`
  0%, 92%, 100% { transform: translate(-50%, -50%) scaleY(1); }
  95% { transform: translate(-50%, -50%) scaleY(0.1); }
  97% { transform: translate(-50%, -50%) scaleY(1); }
`;

const EyeIcon = styled(IoEyeSharp)`
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 45px;
  color: rgba(255, 255, 255, 0.4);
  z-index: 3;
  animation: ${eyeBlink} 3s infinite ease-in-out;
  transform-origin: center;
`;

const QrResult = styled.div`
  color: #fff;
  text-align: center;
  margin-top: 10px;
`;

export default MainScreen;
