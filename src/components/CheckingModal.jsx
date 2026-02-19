import styled, { keyframes } from "styled-components";
import { IoClose } from "react-icons/io5";

function CheckingModal({ onExit }) {
  return (
    <>
      <Container>
        <SubContainer>
          <Header>
            <Title>Checkins</Title>
            <Closeicon onClick={onExit} />
          </Header>
          {/* Body container */}
          <BodyContainer>{/* Your history content here */}</BodyContainer>
        </SubContainer>
      </Container>
    </>
  );
}

// styling;
/* ---------------- Animations ---------------- */

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0%);
  }`;

/* ---------------- Styles ---------------- */

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: flex-end; /* push bottom sheet to bottom */
  z-index: 9999;
`;

const SubContainer = styled.div`
  width: 100%;
  height: 75vh;
  background: #fff;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  padding: 20px;
  animation: ${slideUp} 0.2s ease-out;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
`;

export default CheckingModal;
