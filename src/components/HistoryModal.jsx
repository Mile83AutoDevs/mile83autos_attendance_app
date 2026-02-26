import styled, { keyframes } from "styled-components";
import { IoClose } from "react-icons/io5";
import HistoryComponent from "./HistoryComponent";
import { IoRefresh } from "react-icons/io5";
import { TbMoodEmpty } from "react-icons/tb";
import { ImSpinner3 } from "react-icons/im";
import { useEffect, useState } from "react";
import axios from "axios";

function HistoryModal({ onClose }) {
  const [data, setData] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [connection, setConnection] = useState(true);
  // define endpoint
  const endpoint = {
    development: true,
    local: "http://localhost:5000/api/getAllAttendanceByMonthBasedOnId",
    production:
      "https://mile83autos-api-backend-1.onrender.com/api/getAllAttendanceByMonthBasedOnId",
  };
  const getUserSerialId = localStorage.getItem("object_data_storage");
  const sanitizeData = atob(getUserSerialId);

  useEffect(() => {
    getUserData();
  }, []);

  //  function to calculate current month
  function getCurrentMonthKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  //  define payload;
  const payload = {
    virtual_serial_id: JSON.parse(sanitizeData),
    month: getCurrentMonthKey(),
  };

  // function to get user attendance history based on the particular month user is present;
  const getUserData = async () => {
    try {
      const response = await axios.post(
        endpoint.development ? endpoint.local : endpoint.production,
        payload,
      );
      if (response) {
        return response.data.data == null
          ? setData([])
          : setData(response.data.data);
      } else {
        setConnection(false);
      }
    } catch (err) {
      setSpinner(false);
      setConnection(false);
    }
  };

  //  function to handle data refresh
  const handleDataRefresh = async () => {
    try {
      setSpinner(true);
      const res = await getUserData();
      if (res) {
        setSpinner(false);
        setConnection(true);
      } else if (!res) {
        setTimeout(() => {
          setSpinner(false);
        }, 2000);
      }
    } catch (err) {
      setConnection(false);
      setTimeout(() => {
        setSpinner(false);
      }, 3000);
    }
  };

  return (
    <Container>
      <SubContainer>
        <Header>
          <Title>Recent Activity</Title>
          <Closeicon onClick={onClose} />
        </Header>
        {/* Body container */}
        <BodyContainer>
          <ContentContainer>
            <>
              {connection === true ? (
                <>
                  {data.length === 0 ? (
                    <>
                      <NoDataParentContainer>
                        <EmptyIcon />
                        <NoDataText>No data at the moment</NoDataText>
                      </NoDataParentContainer>
                    </>
                  ) : (
                    <>
                      {data.map((value, index) => (
                        <>
                          {value.checkinStatus === true && (
                            <>
                              <HistoryComponent
                                key={value._id}
                                description={`you ${value.checkInDescription}`}
                                point={value.point}
                                time={value.checkInTime}
                              />
                            </>
                          )}
                          {value.checkoutStatus === true && (
                            <>
                              <HistoryComponent
                                key={value._id}
                                description={`you ${value.checkOutDescription}`}
                                point={value.point}
                                time={value.checkOutTime}
                              />
                            </>
                          )}
                        </>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <>
                  {spinner === true ? (
                    <>
                      <SpinnerIcon />
                    </>
                  ) : (
                    <>
                      <NoInternetParentContainer>
                        <NoInternetTextContainer>
                          <RefreshIcon />
                          <NoInternetText>
                            No Internet,click the refresh button
                          </NoInternetText>
                        </NoInternetTextContainer>
                        <NoInternetButton
                          onClick={() => {
                            handleDataRefresh();
                          }}
                        >
                          Refresh
                        </NoInternetButton>
                      </NoInternetParentContainer>
                    </>
                  )}
                </>
              )}
            </>
          </ContentContainer>
        </BodyContainer>
      </SubContainer>
    </Container>
  );
}

export default HistoryModal;

/* ---------------- Animations ---------------- */
const ContentContainer = styled.div`
  display: flex;
  padding-top: 25px;
  flex-direction: column;
  gap: 25px;
`;

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0%);
  }
`;

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

const NoInternetParentContainer = styled.div`
  padding-top: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  flex-direction: column;
`;
const NoInternetText = styled.h3`
  font-size: 15px;
  width: 150px;
`;
const NoInternetButton = styled.button`
  padding: 10px;
  font-size: 14px;
  border: solid transparent;
  width: 300px;
  border-radius: 100px;
  transition: linear 100ms;
  cursor: pointer;
  background: var(--primary-bg-theme);
  &:hover {
    transform: scale(0.95);
  }
`;
const RefreshIcon = styled(IoRefresh)`
  font-size: 40px;
`;
const NoInternetTextContainer = styled.div`
  display: flex;
  text-align: center;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
`;

const NoDataParentContainer = styled.div`
  display: flex;
  text-align: center;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 100px;
  gap: 15px;
`;

const EmptyIcon = styled(TbMoodEmpty)`
  font-size: 40px;
`;
const NoDataText = styled.h3`
  font-size: 15px;
  width: 150px;
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerIcon = styled(ImSpinner3)`
  font-size: 20px;
  animation: ${rotate} 1s linear infinite;
`;
