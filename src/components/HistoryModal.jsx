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

  // tabs
  const [tab, setTab] = useState("today");

  // define endpoint
  const endpoint = {
    development: false,
    getAttendanceBasedOnMonth: {
      local: "http://localhost:5000/api/getAllAttendanceByMonthBasedOnId",
      production:
        "https://mile83autos-api-backend-1.onrender.com/api/getAllAttendanceByMonthBasedOnId",
    },
    getAttendanceBasedOnCurrentDate: {
      local: "http://localhost:5000/api/getAllAttendanceByCurrentDateBasedOnId",
      production:
        "https://mile83autos-api-backend-1.onrender.com/api/getAllAttendanceByCurrentDateBasedOnId",
    },
  };

  const getUserSerialId = localStorage.getItem("object_data_storage");

  const _checkDeviceActivation = localStorage.getItem("IS_DEVICE_ACTIVE_YET");

  //  function to calculate current month
  function getCurrentMonthKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  // define payload
  const payload = {
    virtual_serial_id: JSON.parse(_checkDeviceActivation || "{}")["userId"],
    month: getCurrentMonthKey(),
    date: new Date().toLocaleDateString(),
  };

  // ON LOAD MODAL GET USER HISTORY
  useEffect(() => {
    getUserData();
  }, [tab]);

  // function to get user attendance history
  const getUserData = async () => {
    if (_checkDeviceActivation === null) {
      setConnection(false);
      return;
    }

    try {
      setSpinner(true);

      const selectedEndpoint =
        tab === "today"
          ? endpoint["development"] === true
            ? endpoint["getAttendanceBasedOnCurrentDate"]["local"]
            : endpoint["getAttendanceBasedOnCurrentDate"]["production"]
          : endpoint["development"] === true
            ? endpoint["getAttendanceBasedOnMonth"]["local"]
            : endpoint["getAttendanceBasedOnMonth"]["production"];

      const response = await axios.post(selectedEndpoint, payload);
      console.log(response.data.data);
      if (response?.data?.data) {
        setData(response.data.data);
      } else {
        setData([]);
      }

      setConnection(true);
    } catch (err) {
      setConnection(false);
      setData([]);
    } finally {
      setSpinner(false);
    }
  };

  // refresh
  const handleDataRefresh = async () => {
    try {
      setSpinner(true);
      await getUserData();
    } catch (err) {
      setConnection(false);
    } finally {
      setSpinner(false);
    }
  };

  return (
    <Container>
      <SubContainer>
        <Header>
          <Title>Recent Activity</Title>
          <Closeicon onClick={onClose} />
        </Header>

        {/* TAB SECTION */}
        <TabContainer>
          <TabButton active={tab === "today"} onClick={() => setTab("today")}>
            Today
          </TabButton>

          <TabButton active={tab === "month"} onClick={() => setTab("month")}>
            This Month
          </TabButton>
        </TabContainer>

        {/* Body container */}
        <BodyContainer>
          <ContentContainer>
            <>
              {connection === true ? (
                <>
                  {spinner === true ? (
                    <>
                      <SpinnerContainer>
                        <SpinnerIcon />
                      </SpinnerContainer>
                    </>
                  ) : (
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
                          {data.map((value) => (
                            <ActivityCard key={value._id}>
                              {/* DATE */}
                              <ActivityDate>{value.date}</ActivityDate>
                              {/* CHECK IN */}
                              {value.checkinStatus === true && (
                                <HistoryComponent
                                  checkin={true}
                                  description={`You ${value.checkInDescription}`}
                                  time={value.checkInTime}
                                  position={
                                    value?.positionLogging?.checkinPosition
                                  }
                                />
                              )}
                              {/* LINE */}
                              {value.checkinStatus && value.checkoutStatus && (
                                <Divider />
                              )}
                              {/* CHECK OUT */}
                              {value.checkoutStatus === true && (
                                <HistoryComponent
                                  checkin={false}
                                  description={`You ${value.checkOutDescription}`}
                                  time={value.checkOutTime}
                                  position={
                                    value?.positionLogging?.checkoutPosition
                                  }
                                />
                              )}
                            </ActivityCard>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <NoInternetParentContainer>
                    <NoInternetTextContainer>
                      <RefreshIcon />

                      <NoInternetText>
                        {_checkDeviceActivation === null
                          ? "you have not started using your device to checkin"
                          : "Could not fetch data"}
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
          </ContentContainer>
        </BodyContainer>
      </SubContainer>
    </Container>
  );
}

export default HistoryModal;

/* ---------------- Animations ---------------- */

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0%);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
  align-items: flex-end;
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

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const TabButton = styled.button`
  flex: 1;
  height: 45px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
  background: ${(props) =>
    props.active ? "var(--primary-bg-theme)" : "#f1f1f1"};
  color: "#111";
  &:hover {
    transform: scale(0.97);
  }
`;

const BodyContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ContentContainer = styled.div`
  display: flex;
  padding-top: 10px;
  flex-direction: column;
  gap: 25px;
  align-items: center;
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

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 100px;
`;

const SpinnerIcon = styled(ImSpinner3)`
  font-size: 22px;
  animation: ${rotate} 1s linear infinite;
`;

const ActivityCard = styled.div`
  background: #fafafa;
  border: 1px solid #f1f1f1;
  border-radius: 18px;
  padding: 18px;
  display: flex;
  width: 90%;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.03);
`;

const ActivityDate = styled.h4`
  font-size: 13px;
  color: #666;
  font-weight: 600;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #ececec;
`;
