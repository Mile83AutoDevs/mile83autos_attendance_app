import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { PiSpinner } from "react-icons/pi";
import styled, { keyframes } from "styled-components";
import SuccessComponent from "../components/SuccessComponent";
import Notification from "../components/Notification.jsx";
import axios from "axios";

function RegisterScreen() {
  const navigationObj = useNavigate();
  const [load, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);
  const [params, setParams] = useState({});
  const isValid = fullName.trim() !== "" && phone.trim() !== "";
  const [notificationReveal, setNotificationReveal] = useState(false);
  const [error, setError] = useState(false);
  //  define global data params ;
  const Global_data_template = {
    virtual_serial_no: "",
  };

  //  fucntion to handle data params activities
  const manageParams = (type, params = {}) => {
    if (type === "STORE_DATA") {
      const sanitizedData = JSON.stringify(params, null, 3);
      const _store = localStorage.setItem(
        "object_data_storage",
        btoa(sanitizedData),
      );
      if (_store) {
        return true;
      }
    } else if (type === "GET_DATA") {
      const _data = localStorage.getItem("object_data_storage");
      if (_data === null) {
        return false;
      } else {
        const _decryptData = atob(_data);
        return JSON.parse(_decryptData);
      }
    }
  };

  //  function to store temporal card data ;
  const storeTempCardData = (params = {}) => {
    const sanitize = JSON.stringify(params, null, 3);
    return localStorage.setItem("temp_card_object_store", sanitize);
  };

  // two localstorage 1. object data storahe (virtual serial no). 2. card data (temporar)
  // function to handle registration
  const handleRegister = async () => {
    try {
      if (!isValid) return;
      const dataParams = {
        name: fullName,
        office_number: phone,
      };
      const Endpoint = {
        local: "http://localhost:5000/api/v1/registerDevice",
        production:
          "https://mile83autos-api-backend-1.onrender.com/api/v1/registerDevice",
      };
      setLoading(true);
      const response = await axios.post(Endpoint.production, dataParams);
      if (response.data.msg == "successful") {
        dataParams["virtual_serial_id"] = response.data.virtual_serial_id;
        storeTempCardData(dataParams); // temporarly store card data ;
        manageParams("STORE_DATA", response.data.virtual_serial_id); // store virtual serial id permananetly ;
        setError(false);
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          navigationObj("/card-reveal");
        }, 2000);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      setNotificationReveal(true);
      setError(true);
    }
  };

  return (
    <>
      {success === true && <SuccessComponent msg="Successful!" />}
      {notificationReveal == true && (
        <Notification
          title={"Notification"}
          description={error ? "Something went wrong" : "Successful"}
          onClose={() => {
            setNotificationReveal(false);
          }}
        />
      )}
      <Container>
        <SubContainer>
          <HeaderContainer>
            <Title>Register Device</Title>
            <CloseIcon onClick={() => navigationObj(-1)} />
          </HeaderContainer>

          <ContentContainer>
            <FormContainer>
              <FormTitle>Full Name</FormTitle>
              <FormInput
                placeholder="Enter your name example: Mr. Jide"
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
              {load === true ? <SpinnerIcon /> : "Register Device"}
            </Button>
          </ButtonContainer>
        </SubContainer>
      </Container>
    </>
  );
}

export default RegisterScreen;

/* ---------------- Spinner Animation ---------------- */
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinnerIcon = styled(PiSpinner)`
  font-size: 18px;
  animation: ${spin} 0.8s linear infinite;
`;

/* ---------------- Layout ---------------- */
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

  &:hover:not(:disabled) {
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
