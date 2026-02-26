import React from "react";
import styled from "styled-components";

function CheckinComponent(props) {
  return (
    <>
      <Container id={props.index}>
        <Subcontainer>
          <ProfilePicsContainer>
            <ProfilePics></ProfilePics>
            <NameContainer>
              <Title>{props.Name}</Title>
              <Description>{props.Description}</Description>
            </NameContainer>
          </ProfilePicsContainer>
          <Time>{props.Time}</Time>
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
