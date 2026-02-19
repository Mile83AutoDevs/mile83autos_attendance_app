import React from "react";
import styled from "styled-components";

function CheckinComponent(props) {
  return (
    <>
      <Container>
        <Subcontainer>
          <ProfilePicsContainer>
            <ProfilePics></ProfilePics>
            <NameContainer>
              <Title>John Obeni</Title>
              <Description>Checkin @ the office early </Description>
            </NameContainer>
          </ProfilePicsContainer>
          <Time>3:45</Time>
        </Subcontainer>
      </Container>
    </>
  );
}

const Container = styled.div``;
const ProfilePicsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;
const Subcontainer = styled.div`
  display: flex;
  justify-content: space-between;
`;
const ProfilePics = styled.div`
  padding: 10px;
  background: whitesmoke;
  border-radius: 100px;
  width: 30px;
  height: 30px;
`;
const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;
const Title = styled.h3`
  font-size: 15px;
`;
const Description = styled.p`
  font-size: 12px;
`;
const Time = styled.p`
  font-size: 11px;
`;

export default CheckinComponent;
