import React, { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import small from "../../public/small.png";

function Notification({ title, description, duration = 3000, onClose }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleAnimationEnd = () => {
    if (closing && onClose) {
      onClose();
    }
  };

  return (
    <Container>
      <GlassCard $closing={closing} onAnimationEnd={handleAnimationEnd}>
        <Icon src={small} alt="icon" />
        <TextContainer>
          <TextTitle>{title}</TextTitle>
          <TextDescription>{description}</TextDescription>
        </TextContainer>

        <Reflection />
        <BottomGlow />
      </GlassCard>
    </Container>
  );
}

export default Notification;

/* ---------------- Animations ---------------- */

const floatIn = keyframes`
  from {
    transform: translateY(-25px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`;

const shrinkOut = keyframes`
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateY(-8px) scale(0.88);
    opacity: 0;
  }
`;

/* ---------------- Styles ---------------- */

const Container = styled.div`
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  perspective: 1000px;
`;

const GlassCard = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  min-width: 260px;
  max-width: 90vw;
  border-radius: 20px;

  /* Compact Apple Liquid Glass */

  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.32) 0%,
    rgba(255, 255, 255, 0.14) 40%,
    rgba(255, 255, 255, 0.06) 100%
  );

  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);

  border: 1px solid rgba(255, 255, 255, 0.35);

  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.35),
    inset 0 1px 2px rgba(255, 255, 255, 0.6),
    inset 0 -1px 3px rgba(255, 255, 255, 0.2);

  color: white;
  overflow: hidden;

  animation: ${({ $closing }) =>
    $closing
      ? css`
          ${shrinkOut} 0.35s cubic-bezier(.4,0,.2,1) forwards
        `
      : css`
          ${floatIn} 0.4s cubic-bezier(.22,1,.36,1) forwards
        `};
`;

/* Top reflective shine */
const Reflection = styled.div`
  position: absolute;
  top: -70%;
  left: -50%;
  width: 200%;
  height: 200%;

  background: radial-gradient(
    circle at 50% 0%,
    rgba(255, 255, 255, 0.55),
    rgba(255, 255, 255, 0.12) 40%,
    transparent 70%
  );

  pointer-events: none;
`;

/* Bottom glow */
const BottomGlow = styled.div`
  position: absolute;
  bottom: -50%;
  left: 0;
  width: 100%;
  height: 80%;

  background: radial-gradient(
    circle at 50% 100%,
    rgba(255, 255, 255, 0.2),
    transparent 70%
  );

  pointer-events: none;
`;

const Icon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 10px;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: black;
`;

const TextTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.1px;
`;

const TextDescription = styled.p`
  margin: 0;
  font-size: 12px;
  opacity: 0.85;
`;
