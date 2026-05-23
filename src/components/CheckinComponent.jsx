import React from "react";
import styled from "styled-components";
import { FiLogIn, FiLogOut } from "react-icons/fi";

function CheckinComponent(props) {
  const isCheckin = props.type === "checkin";

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <Container>
      <IconWrapper $type={props.type}>
        {isCheckin ? <FiLogIn /> : <FiLogOut />}
      </IconWrapper>

      <Subcontainer>
        <ProfilePicsContainer>
          <ProfilePics>{getInitials(props.Name)}</ProfilePics>

          <NameContainer>
            <Title>{props.Name}</Title>
            <Description>{props.Description}</Description>
          </NameContainer>
        </ProfilePicsContainer>

        <RightSection>
          <TypeBadge $type={props.type}>{isCheckin ? "IN" : "OUT"}</TypeBadge>
          <Time>{props.Time}</Time>
        </RightSection>
      </Subcontainer>
    </Container>
  );
}

export default CheckinComponent;

/* ---------------- Styles ---------------- */

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f9f9f9;
  transition: 0.2s ease;

  &:hover {
    transform: scale(1.01);
    background: #f3f3f3;
  }
`;

const IconWrapper = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  background: ${(props) => (props.$type === "checkin" ? "#e8fff1" : "#fff1f1")};

  color: ${(props) => (props.$type === "checkin" ? "#16a34a" : "#dc2626")};

  font-size: 18px;
`;

const Subcontainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProfilePicsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfilePics = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ddd, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #555;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #111;
`;

const Description = styled.p`
  font-size: 12px;
  color: #666;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const Time = styled.p`
  font-size: 11px;
  color: #888;
`;

const TypeBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;

  background: ${(props) => (props.$type === "checkin" ? "#dcfce7" : "#fee2e2")};

  color: ${(props) => (props.$type === "checkin" ? "#166534" : "#991b1b")};
`;
