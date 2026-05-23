import React from "react";
import styled from "styled-components";
import { IoLogInOutline, IoLogOutOutline } from "react-icons/io5";
import { MdAccessTimeFilled } from "react-icons/md";

function HistoryComponent(props) {
  const isCheckin = props?.checkin;

  return (
    <>
      <Container>
        <Subcontainer>
          <LeftContainer>
            <IconContainer checkin={isCheckin}>
              {isCheckin ? <CheckInIcon /> : <CheckOutIcon />}
            </IconContainer>

            <NameContainer>
              <Title>{props?.description}</Title>

              <BottomRow>
                <TimeIcon />
                <Time>{props?.time}</Time>
              </BottomRow>
            </NameContainer>
          </LeftContainer>

          <StatusBadge checkin={isCheckin}>
            {isCheckin ? "CHECK IN" : "CHECK OUT"}
          </StatusBadge>
        </Subcontainer>
      </Container>
    </>
  );
}

// styling

const Container = styled.div`
  width: 95%;
  padding: 14px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f1f1;
`;

const Subcontainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeftContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const IconContainer = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;

  background: ${(props) =>
    props.checkin ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"};
`;

const CheckInIcon = styled(IoLogInOutline)`
  font-size: 24px;
  color: #16a34a;
`;

const CheckOutIcon = styled(IoLogOutOutline)`
  font-size: 24px;
  color: #dc2626;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const Title = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  text-transform: capitalize;
  line-height: 1.4;
  max-width: 220px;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TimeIcon = styled(MdAccessTimeFilled)`
  font-size: 12px;
  color: #9ca3af;
`;

const Time = styled.p`
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
`;

const StatusBadge = styled.div`
  min-width: 90px;
  height: 32px;
  padding: 0 12px;
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 11px;
  font-weight: 700;

  background: ${(props) =>
    props.checkin ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"};

  color: ${(props) => (props.checkin ? "#16a34a" : "#dc2626")};
`;

export default HistoryComponent;
