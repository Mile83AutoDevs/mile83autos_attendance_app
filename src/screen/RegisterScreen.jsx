import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { PiSpinner } from "react-icons/pi";
import styled, { keyframes } from "styled-components";
import SuccessComponent from "../components/SuccessComponent";

function RegisterScreen() {
  const navigationObj = useNavigate();
  const [load, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);

  const isValid = fullName.trim() !== "" && phone.trim() !== "";

  const handleRegister = () => {
    if (!isValid) return;

    // You can generate virtual ID here
    console.log("Registering:", { fullName, phone });
    setSuccess(true);
    setLoading(true);
    const id = setTimeout(() => {
      setSuccess(false);
      setLoading(false);
    }, 3000);
    clearTimeout(id);
  };

  return (
    <>
      {success == true && <SuccessComponent />}
      <Container>
        <SubContainer>
          <HeaderContainer>
            <Title>Create Account</Title>
            <CloseIcon onClick={() => navigationObj(-1)} />
          </HeaderContainer>

          <ContentContainer>
            <FormContainer>
              <FormTitle>Full Name</FormTitle>
              <FormInput
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </FormContainer>

            <FormContainer>
              <FormTitle>Phone No</FormTitle>
              <FormInput
                placeholder="Enter your phone number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormContainer>
          </ContentContainer>

          <ButtonContainer>
            <Info>
              A virtual serial ID will be created and linked to this device.
            </Info>
            <Button disabled={!isValid} onClick={handleRegister}>
              {load == true ? <SpinnerIcon /> : "Register Device"}
            </Button>
          </ButtonContainer>
        </SubContainer>
      </Container>
    </>
  );
}

export default RegisterScreen;

/* ---------------- Layout ---------------- */
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerIcon = styled(PiSpinner)`
  font-size: 18px;
  animation: ${spin} 0.8s linear infinite;
`;

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #ffffff;
  display: flex;
`;

const SubContainer = styled.div`
  width: 100%;
  padding: 25px;
  display: flex;
  margin-top: 30px;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
`;

const CloseIcon = styled(IoClose)`
  font-size: 28px;
  cursor: pointer;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
  align-items: center;
  padding: 5px;
  margin-top: -20px;
`;

const FormContainer = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-radius: 18px;
  background: #f4f4f4;
`;

const FormTitle = styled.h3`
  font-size: 13px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const FormInput = styled.input`
  padding: 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 15px;
  outline: none;
  background: transparent;
`;

const ButtonContainer = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
`;

const Info = styled.p`
  font-size: 11px;
  color: #555;
`;

const Button = styled.button`
  padding: 18px;
  border-radius: 100px;
  border: none;
  width: 100%;
  background: var(--primary-bg-theme);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  color: black;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(0.9);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }
`;
