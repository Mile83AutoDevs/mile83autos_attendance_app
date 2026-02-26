import React from "react";
import styled, { keyframes } from "styled-components";

function HistoryComponent(props) {
  return (
    <>
      <Container key={props.key}>
        <Subcontainer>
          <ProfilePicsContainer>
            <ProfilePics></ProfilePics>
            <NameContainer>
              <Title>{props?.description}</Title>
              <Points>{props?.point}</Points>
            </NameContainer>
          </ProfilePicsContainer>
          <Time>{props?.time}</Time>
        </Subcontainer>
      </Container>
    </>
  );
}

//  styling

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
  font-size: 11px;
`;
const Points = styled.p`
  font-size: 10px;
`;
const Time = styled.p`
  font-size: 11px;
`;

export default HistoryComponent;
