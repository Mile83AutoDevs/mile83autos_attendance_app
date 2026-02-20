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

function MainScreen() {
  const location = useLocation();
  const startCameraOnLoad = location.state?.startCamera || false;
  const [openBottomSheet, setBottomSheetVisibility] = useState(false);
  const [openCheckinSheet, setCheckinSheetVisibility] = useState(false);
  const [success, setSuccess] = useState(false);
  const videoRef = useRef(null);
  const [qrCode, setQrCode] = useState("");
  const [notification, setNotification] = useState(false);
  const [userCoods, setUserCoods] = useState({});
  const [isOutsideOffice, setOfficeLocation] = useState(false);

  // define params ;
  const static_office_coord = {
    longitude: "6.47705",
    latitude: "3.29046",
    allowed_radius: 50,
  };

  useEffect(() => {
    if (!startCameraOnLoad) return;
    let animationFrameId;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

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
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCameraOnLoad]);

  //  function to calculate distance
  const distanceInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // radius of Earth in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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

  //  function to scan qrcode ;
  function scanQRCode() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    if (code) {
      if (userCoods) {
        const distance = distanceInMeters(
          static_office_coord.latitude,
          static_office_coord.longitude,
          userCoods.latitude,
          userCoods.longitude,
        );
        if (distance <= static_office_coord.allowed_radius) {
          setQrCode(code.data);
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
          }, 3000);
          setOfficeLocation(false); // if user is inside the office , set office location as false
        } else {
          setQrCode(code.data);
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
          }, 3000);
          setOfficeLocation(true); // if user is outside the office , set office location as true
        }
      }
    } else {
      setNotification(true);
    }
  }

  //  function to remove notification badge ;
  function closeNotificationBadge() {
    setNotification(false);
  }

  return (
    <>
      {notification && (
        <Notification
          title="Notification"
          description="No Code Detected, try again !"
          onClose={() => {
            closeNotificationBadge();
          }}
        />
      )}
      {success && (
        <SuccessComponent
          msg={
            isOutsideOffice === true
              ? `Looks like you are outside the office, Welcome ! ${qrCode}`
              : "Hey, Welcome to office !"
          }
        />
      )}
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

        {qrCode && <QrResult>Scanned: {qrCode}</QrResult>}
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
