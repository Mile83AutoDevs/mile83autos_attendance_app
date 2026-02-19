import styled, { keyframes } from "styled-components";
import { IoClose } from "react-icons/io5";
import { useState, useRef } from "react";
import CheckinComponent from "./checkinComponent";

function CheckingModal({ onExit }) {
  const [position, setPosition] = useState("checkin");
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const startX = useRef(0);
  const sheetRef = useRef(null);

  /* ---------------- Drag Down To Close ---------------- */

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diffY = currentY - startY.current;

    if (diffY > 0) {
      setDragY(diffY);
    }
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX.current;

    // Swipe Left / Right
    if (Math.abs(diffX) > 50) {
      if (diffX < 0) {
        setPosition("checkout");
      } else {
        setPosition("checkin");
      }
    }

    // Drag Down To Close
    if (dragY > 150) {
      onExit();
    } else {
      setDragY(0);
    }
  };

  return (
    <Container onClick={onExit}>
      <SubContainer
        ref={sheetRef}
        style={{ transform: `translateY(${dragY}px)` }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <DragIndicator />

        <Header>
          <Title>Checkins</Title>
          <Closeicon onClick={onExit} />
        </Header>

        <BodyContainer>
          <HeaderNavigatorContainer>
            <Slider active={position} />

            <NavButton
              active={position === "checkin"}
              onClick={() => setPosition("checkin")}
            >
              Checkin
            </NavButton>

            <NavButton
              active={position === "checkout"}
              onClick={() => setPosition("checkout")}
            >
              Checkout
            </NavButton>
          </HeaderNavigatorContainer>
          {position == "checkin" ? (
            <ContentContainer>
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
            </ContentContainer>
          ) : (
            <ContentContainer>
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
              <CheckinComponent />
            </ContentContainer>
          )}
        </BodyContainer>
      </SubContainer>
    </Container>
  );
}

export default CheckingModal;

/* ---------------- Animations ---------------- */

const ContentContainer = styled.div`
  display: flex;
  padding-top: 25px;
  flex-direction: column;
  gap: 25px;
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0%); }
`;

/* ---------------- Styles ---------------- */

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 9999;
`;

const SubContainer = styled.div`
  width: 100%;
  height: 75vh;
  background: #fff;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  padding: 20px;
  animation: ${slideUp} 0.25s ease-out;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
`;

const DragIndicator = styled.div`
  width: 50px;
  height: 5px;
  background: #ccc;
  border-radius: 10px;
  margin: 0 auto 15px auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const Closeicon = styled(IoClose)`
  font-size: 30px;
  cursor: pointer;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
`;

const BodyContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-top: -12px;
`;

/* ---------------- Toggle ---------------- */

const HeaderNavigatorContainer = styled.div`
  position: relative;
  height: 55px;
  width: 99%;
  background: #f2f2f2;
  border-radius: 100px;
  display: flex;
  align-items: center;
  padding: 2px;
`;

const Slider = styled.div`
  position: absolute;
  top: 7px;
  left: ${(props) => (props.active === "checkin" ? "10px" : "calc(50% + 5px)")};
  width: calc(50% - 20px);
  height: 45px;
  background: var(--primary-bg-theme);
  border-radius: 100px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const NavButton = styled.button`
  flex: 1;
  height: 45px;
  background: transparent;
  border: none;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  z-index: 2;
  color: ${(props) => (props.active ? "black" : "#555")};
  transition: color 0.3s ease;
  text-align: center;
`;

const RevealContainer = styled.div``;
