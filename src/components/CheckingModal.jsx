import styled, { keyframes } from "styled-components";
import { IoClose, IoRefresh } from "react-icons/io5";
import { useState, useRef, useEffect } from "react";
import CheckinComponent from "./CheckinComponent";
import axios from "axios";
import { TbMoodEmpty } from "react-icons/tb";
import { ImSpinner3 } from "react-icons/im";

function CheckingModal({ onExit }) {
  const [position, setPosition] = useState("checkin"); // checkin | checkout
  const [timeTab, setTimeTab] = useState("today"); // today | month

  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const startX = useRef(0);
  const sheetRef = useRef(null);

  const [connection, setConnection] = useState(true);
  const [data, setData] = useState([]);
  const [spinner, setSpinner] = useState(false);

  const endpoints = {
    development: false,
    getAllAttendanceByMonth: {
      local: "http://localhost:5000/api/getAllAttendanceByMonth",
      production:
        "https://mile83autos-api-backend-1.onrender.com/api/getAllAttendanceByMonth",
    },

    getAllAttendanceByCurrentDate: {
      local: "http://localhost:5000/api/getAllAttendanceByDate",
      production:
        "https://mile83autos-api-backend-1.onrender.com/api/getAllAttendanceByDate",
    },
  };

  //  function to calculate current month
  function getCurrentMonthKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  /* ---------------- FETCH DATA ---------------- */
  const getData = async () => {
    try {
      setSpinner(true);
      const todayDate = new Date().toLocaleDateString();
      const payload = {
        date: todayDate,
        month: getCurrentMonthKey(),
      };

      const endpoint =
        timeTab === "today"
          ? endpoints.development
            ? endpoints.getAllAttendanceByCurrentDate.local
            : endpoints.getAllAttendanceByCurrentDate.production
          : endpoints.development
            ? endpoints.getAllAttendanceByMonth.local
            : endpoints.getAllAttendanceByMonth.production;

      const response = await axios.post(endpoint, payload);

      setData(response?.data?.data || []);
      setConnection(true);
    } catch (err) {
      setConnection(false);
      setData([]);
    } finally {
      setSpinner(false);
    }
  };

  useEffect(() => {
    getData();
  }, [timeTab]);

  const handleRefresh = () => getData();

  /* ---------------- DRAG ---------------- */
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const diffY = e.touches[0].clientY - startY.current;
    if (diffY > 0) setDragY(diffY);
  };

  const handleTouchEnd = (e) => {
    const diffX = e.changedTouches[0].clientX - startX.current;

    if (Math.abs(diffX) > 50) {
      setPosition(diffX < 0 ? "checkout" : "checkin");
    }

    if (dragY > 150) onExit();
    else setDragY(0);
  };

  /* ---------------- FILTER ---------------- */
  const filteredData = data.filter((item) =>
    position === "checkin"
      ? item.checkinStatus === true
      : item.checkoutStatus === true,
  );

  return (
    <Container onClick={onExit}>
      <SubContainer
        ref={sheetRef}
        style={{ transform: `translateY(${dragY}px)` }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <DragIndicator />

        <Header>
          <Title>Attendance</Title>
          <Closeicon onClick={onExit} />
        </Header>

        {/* TOP TABS */}
        <HeaderNavigatorContainer>
          <Slider active={position} />

          <NavButton
            active={position === "checkin"}
            onClick={() => setPosition("checkin")}
          >
            Checkin
          </NavButton>

          <NavButton
            active={position === "checkout"}
            onClick={() => setPosition("checkout")}
          >
            Checkout
          </NavButton>
        </HeaderNavigatorContainer>

        {/* SECOND TABS */}
        <TabRow>
          <TabButton
            active={timeTab === "today"}
            onClick={() => setTimeTab("today")}
          >
            Today
          </TabButton>

          <TabButton
            active={timeTab === "month"}
            onClick={() => setTimeTab("month")}
          >
            This Month
          </TabButton>
        </TabRow>

        <BodyContainer>
          {spinner ? (
            <SpinnerContainer>
              <SpinnerIcon />
            </SpinnerContainer>
          ) : !connection ? (
            <NoInternetParentContainer>
              <NoInternetTextContainer>
                <RefreshIcon />
                <NoInternetText>No Internet Connection</NoInternetText>
              </NoInternetTextContainer>

              <NoInternetButton onClick={handleRefresh}>
                Refresh
              </NoInternetButton>
            </NoInternetParentContainer>
          ) : filteredData.length === 0 ? (
            <NoDataParentContainer>
              <EmptyIcon />
              <NoDataText>
                {position === "checkin"
                  ? "No checkins yet"
                  : "No checkouts yet"}
              </NoDataText>
            </NoDataParentContainer>
          ) : (
            <ContentContainer>
              {filteredData.map((value) => (
                <CheckinComponent
                  key={value._id}
                  type={position}
                  Name={value.staffName}
                  Description={
                    position === "checkin"
                      ? value.checkInDescription
                      : value.checkOutDescription
                  }
                  Time={
                    position === "checkin"
                      ? value.checkInTime
                      : value.checkOutTime
                  }
                />
              ))}
            </ContentContainer>
          )}
        </BodyContainer>
      </SubContainer>
    </Container>
  );
}

export default CheckingModal;

/* ---------------- Animations ---------------- */

const ContentContainer = styled.div`
  display: flex;
  padding-top: 25px;
  flex-direction: column;
  gap: 25px;
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0%); }
`;

/* ---------------- Styles ---------------- */

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
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
  animation: ${slideUp} 0.25s ease-out;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
`;

const DragIndicator = styled.div`
  width: 50px;
  height: 5px;
  background: #ccc;
  border-radius: 10px;
  margin: 0 auto 15px auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
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
  margin-top: -12px;
`;

/* ---------------- Toggle ---------------- */

const HeaderNavigatorContainer = styled.div`
  position: relative;
  height: 55px;
  width: 99%;
  background: #f2f2f2;
  border-radius: 100px;
  display: flex;
  align-items: center;
  padding: 2px;
`;

const Slider = styled.div`
  position: absolute;
  top: 7px;
  left: ${(props) => (props.active === "checkin" ? "10px" : "calc(50% + 5px)")};
  width: calc(50% - 20px);
  height: 45px;
  background: var(--primary-bg-theme);
  border-radius: 100px;
  transition: all 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const NavButton = styled.button`
  flex: 1;
  height: 45px;
  background: transparent;
  border: none;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  z-index: 2;
  color: ${(props) => (props.active ? "black" : "#555")};
  transition: color 0.1s ease;
  text-align: center;
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
  font-size: 50px;
  animation: ${rotate} 1s linear infinite;
`;

const TabRow = styled.div`
  display: flex;
  gap: 10px;
  margin: 10px 0;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: ${(p) => (p.active ? "#111" : "#f1f1f1")};
  color: ${(p) => (p.active ? "#fff" : "#444")};
`;
const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 80px;
`;
const RevealContainer = styled.div``;
