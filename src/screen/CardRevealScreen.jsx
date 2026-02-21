import React from "react";
import styled from "styled-components";
import CardTemplate from "../assets/CardTemplate.png";
import { QRCodeCanvas } from "qrcode.react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { useRef } from "react";
import Notification from "../components/Notification";

function CardRevealScreen(props) {
  const [notificationReveal, setNotificationReveal] = useState(false);
  const cardRef = useRef(null);
  const navigateObj = useNavigate();
  const [qrCode, setQrCode] = useState("");
  const [data, setData] = useState({});
  useEffect(() => {
    const getTempStore = localStorage.getItem("temp_card_object_store");
    const sanitize = JSON.parse(getTempStore);
    setData(sanitize);
    setQrCode(sanitize.virtual_serial_id);
  }, []);

  //    function to handle screenshot
  const CaptureScreenshot = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
    });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "card.png";
    link.click();
    setNotificationReveal(true);
  };

  //    function to delete temp data ; after confirmation
  const deleteTempData = () => {
    localStorage.removeItem("temp_card_object_store");
  };

  return (
    <>
      {notificationReveal && (
        <Notification
          title={"Notification"}
          description={"ID screenshotted"}
          onClose={() => {
            setNotificationReveal(false);
          }}
        />
      )}
      <Container>
        <SubContainer>
          <CardImageContainer>
            <CardImageComponent ref={cardRef}>
              <CardComponentParentContainer>
                <CardComponentSubContainer>
                  <CardNumericContainer>
                    <CardSerialId>
                      {qrCode.slice(0, 18).concat("***")}
                    </CardSerialId>
                    <CardNameContainer>
                      <CardName>{data.name}</CardName>
                      <CardPhoneno>{data.office_number}</CardPhoneno>
                    </CardNameContainer>
                  </CardNumericContainer>
                  <QRCodeCanvas
                    value={qrCode}
                    bgColor="#FFFCE9"
                    size={100}
                    level="H"
                    style={{
                      marginTop: "30px",
                      borderRadius: "10px",
                    }}
                  />
                </CardComponentSubContainer>
              </CardComponentParentContainer>
            </CardImageComponent>

            <CardRevealText>
              Click the screenshot button and send to admin, to process your
              card
            </CardRevealText>
          </CardImageContainer>
          <ButtonContainer>
            <ConfirmButton
              onClick={() => {
                navigateObj("/");
                deleteTempData();
              }}
            >
              Ok,Thanks
            </ConfirmButton>
            <ScreenShotButton
              onClick={() => {
                CaptureScreenshot();
              }}
            >
              Screenshot & Share
            </ScreenShotButton>
          </ButtonContainer>
        </SubContainer>
      </Container>
    </>
  );
}

//  styling ;
const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
`;
const SubContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-top: 60px;
  height: 700px;
  justify-content: space-between;
  flex-direction: column;
`;
const CardImageComponent = styled.div`
  width: 100%;
  max-width: 320px;
  aspect-ratio: 3/ 2;
  background-image: url(${CardTemplate});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  transform: scale(110%);
  transition: all 100ms linear;

  &:hover {
    transform: rotate(13deg);
  }
`;
const CardComponentParentContainer = styled.div``;
const CardComponentSubContainer = styled.div`
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
`;
const CardNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
`;
const CardName = styled.h2`
  font-size: 25px;
  color: #030000;
  opacity: 0.6;
`;
const CardPhoneno = styled.p`
  font-size: 12px;
  opacity: 0.5;
  color: #030000;
`;
const CardNumericContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;
const CardSerialId = styled.p`
  font-size: 11px;
  color: #030000;
  opacity: 0.6;
`;

const CardImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 40px;
  padding: 50px;
`;
const CardRevealText = styled.p`
  width: 300px;
  font-size: 14px;
  text-align: center;
`;
const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const ButtonContainerText = styled.p``;
const ConfirmButton = styled.button`
  padding: 17px;
  width: 90vw;
  border-radius: 100px;
  border: solid transparent;
  background: var(--primary-bg-theme);
  transition: linear, 100ms;
  &:hover {
    transform: scale(0.9);
  }
`;
const ScreenShotButton = styled.button`
  padding: 17px;
  width: 90vw;
  border-radius: 100px;
  border: solid transparent;
  background: whitesmoke;
  transition: linear, 100ms;
  &:hover {
    transform: scale(0.9);
  }
`;

export default CardRevealScreen;
