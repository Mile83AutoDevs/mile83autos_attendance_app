import styled from "styled-components";
import theme from "../assets/theme.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import NoInternet from "../components/NoInternet";

function OnboardScreen() {
  const navigateObj = useNavigate();
  const videoRef = useRef(null);

  const handleGetStarted = async () => {
    try {
      // Start camera on tap
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // iOS requirement
        videoRef.current.muted = true; // iOS autoplay
        await videoRef.current.play();
      }
      navigateObj("/app", { state: { startCamera: true } });
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access is required to continue.");
    }
  };

  return (
    <>
      <NoInternet />
      <Container>
        <SubContainer>
          <HeaderContainer>
            <HeaderTitle>Making Checking-in Very Easy</HeaderTitle>
            <HeaderDescription>
              An official app by Mile83autos for seamless check-ins
            </HeaderDescription>
          </HeaderContainer>

          {/* The Get Started button must be tapped by user */}
          <ButtonContainer>
            <Button onClick={handleGetStarted}>Get Started</Button>
            <RegisterDevice>Register your device</RegisterDevice>
          </ButtonContainer>
          <BrandText>Powered by Mile83autos</BrandText>

          {/* Video element must exist and visible in DOM, hidden visually but not display:none */}
          <VideoCamera ref={videoRef} />
        </SubContainer>
      </Container>
    </>
  );
}

// Styled components
const Container = styled.div`
  height: 100vh;
  width: 100%;
  background-image: url(${theme});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SubContainer = styled.div`
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  display: flex;
  margin-top: 450px;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const HeaderContainer = styled.div``;

const HeaderTitle = styled.h3`
  font-size: 19px;
  font-weight: 800;
  margin-bottom: 10px;
`;

const HeaderDescription = styled.p`
  font-size: 12px;
  line-height: 1;
`;

const Button = styled.button`
  padding: 17px 30px;
  background-color: var(--primary-bg-theme);
  color: black;
  border: none;
  width: 100%;
  border-radius: 100px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.1s ease-in-out;
  &:hover {
    transform: scale(1.05);
  }
`;

const BrandText = styled.p`
  font-size: 12px;
  opacity: 0.9;
  font-weight: 400;
  margin-top: 5px;
`;

// iOS requires it to be in DOM, hidden via height/opacity, NOT display:none
const VideoCamera = styled.video`
  width: 1px;
  height: 1px;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
`;
const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 5px;
  width: 100%;
  padding: 10px;
`;

const RegisterDevice = styled.button`
  padding: 17px 30px;
  background-color: #f7e6bd;
  color: black;
  border: none;
  width: 100%;
  border-radius: 100px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.1s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
`;

export default OnboardScreen;
