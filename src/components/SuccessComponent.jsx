import styled, { keyframes } from "styled-components";
import { IoIosCheckmarkCircle } from "react-icons/io";

function SuccessComponent() {
  return (
    <Container>
      <IconContainer>
        <RippleCircle className="ripple1" />
        <RippleCircle className="ripple2" />
        <RippleCircle className="ripple3" />
        <CheckmarkIcon />
        <Message>Success!</Message>
      </IconContainer>
    </Container>
  );
}

export default SuccessComponent;

/* ---------------- Animations ---------------- */

const ripple = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`;

const popIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

/* ---------------- Styles ---------------- */

const Container = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--primary-bg-theme);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IconContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

/* Ripple circles */
const RippleCircle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%) scale(0.8);
  animation: ${ripple} 1.5s infinite;

  &.ripple2 {
    animation-delay: 0.2s;
  }
  &.ripple3 {
    animation-delay: 0.4s;
  }
`;

const CheckmarkIcon = styled(IoIosCheckmarkCircle)`
  font-size: 80px;
  color: ivory;
  opacity: 0;
  animation: ${popIn} 0.6s ease forwards;
  position: relative;
  z-index: 2;
`;

const Message = styled.p`
  font-size: 15px;
  color: ivory;
  text-align: center;
  opacity: 0;
  animation: ${fadeUp} 0.5s ease forwards;
  animation-delay: 0.6s;
`;
