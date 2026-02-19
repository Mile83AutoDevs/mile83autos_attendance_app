import React from "react";
import styled from "styled-components";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function RegisterScreen() {
  const navigationObj = useNavigate();

  return (
    <Container>
      <SubContainer>
        <HeaderContainer>
          <Title>Create Account</Title>
          <CloseIcon onClick={() => navigationObj(-1)} />
        </HeaderContainer>

        <ContentContainer>
          <FormContainer>
            <FormTitle>Full Name</FormTitle>
            <FormInput placeholder="Enter your full name" />
          </FormContainer>

          <FormContainer>
            <FormTitle>Phone No</FormTitle>
            <FormInput placeholder="Enter your phone no" />
          </FormContainer>
          <ButtonContainer>
            <Info>A virtual serial id will be created for your device</Info>
            <Button>Register Device</Button>
          </ButtonContainer>
        </ContentContainer>
      </SubContainer>
    </Container>
  );
}

export default RegisterScreen;

/* ---------------- Layout ---------------- */

const ButtonContainer = styled.div`
  margin-top: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  gap: 10px;
`;
const Info = styled.p`
  font-size: 13px;
`;

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #fff;
  display: flex;
`;

const SubContainer = styled.div`
  width: 100%;
  background: #fff;
  padding: 20px;
  display: flex;
  margin-top: 40px;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
`;

const CloseIcon = styled(IoClose)`
  font-size: 30px;
  cursor: pointer;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const FormContainer = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-radius: 15px;
  background: whitesmoke;
`;

const FormTitle = styled.h3`
  font-size: 15px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const FormInput = styled.input`
  padding: 20px 16px;
  border-radius: 12px;
  height: 30px;
  border: 1px solid transparent;
  font-size: 15px;
  margin-bottom: 20px;
  outline: none;
  transition: all 0.2s ease;
  background: transparent;
`;

const Button = styled.button`
  margin-top: 10px;
  padding: 15px;
  border-radius: 100px;
  border: none;
  width: 100%;
  background: var(--primary-bg-theme);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 20px;
  &:active {
    transform: scale(0.97);
  }
`;
