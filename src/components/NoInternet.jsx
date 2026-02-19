import React, { useEffect, useState } from "react";
import { MdOutlineSignalWifiConnectedNoInternet4 } from "react-icons/md";
import styled, { keyframes } from "styled-components";

function NoInternet() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <Overlay>
      <Content>
        <WifiIcon />
        <Title>No Internet Connection</Title>
        <Message>Please check your network and try again.</Message>
      </Content>
    </Overlay>
  );
}

/* ---------- STYLES ---------- */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6); /* slightly lighter for blur effect */
  backdrop-filter: blur(6px); /* this adds the blur */
  -webkit-backdrop-filter: blur(6px); /* Safari support */
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: ${fadeIn} 0.1s ease-in-out;
`;

const Content = styled.div`
  text-align: center;
  color: white;
`;

//
const WifiIcon = styled(MdOutlineSignalWifiConnectedNoInternet4)`
  font-size: 80px;
  margin-bottom: 20px;
  color: var(--primary-bg-theme);
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const Message = styled.p`
  font-size: 12px;
  opacity: 0.8;
`;

export default NoInternet;
