import { useEffect, useState, useContext } from "react";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import { StudentContext } from '../context/StudentState';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Bar } from "react-chartjs-2";
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import DemoData from "../Components/DemoData";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Horizontalchart = () => {

  const location = useLocation();
  const {demoList, demoStudentData} = location.state
  const [demoStudent, setDemoStudent] = useState(demoStudentData)
  const [demoListData, setDemoListData] = useState(demoList)
  const [filterDemoStudent, setFilterDemoStudent] = useState(demoStudentData)
  const [filterDemoList, setFilterDemoList] = useState(demoList)
  const [counselorStatus, setCounselorStatus] = useState()
  const [trainerStatus, setTrainerStatus] = useState()
 

  const navigate = useNavigate();

  let ContextValue = useContext(StudentContext);

  let monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


  const [counselor, setCounselor]  = useState()
  const [registerStudent, setRegisterStudent] = useState()
  const [showRegisterStudent, setShowRegisterStudent] = useState()
  const [filterRegisterStudent, setFilterRegisterStudent] = useState()
  const [showDemoStudent, setShowDemoStudent] = useState()
  const [trainer, setTrainer] = useState()
  const [timeValue,setTimeValue] = useState()
  const [rangeDate, setRangeDate]=  useState({
    startDate:"",
    endDate:""
  })

  const [detail, setDetail] = useState({

    month: null,
    trainer: null,
    trainerName:null,
    counselor: null,
    counselorName: null
  })

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Registration",
        data: [],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Demo",
        data: [],
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  });

  useEffect(() => {
    fetchRegistrationData();
    // fetchDemoData();   
    getCounselor()
    getAllTrainer()
  }, []);

  const filterStudent = () => {
    console.log('register student')
 
    let filterRegister = filterRegisterStudent.filter((data, index) => {
  
      return (detail.trainer!= null ? data.TrainerId === detail.trainer : true) && (detail.counselor != null ? data.CounselorId === detail.counselor : true)
  
    })
    console.log('filter register student =',filterRegister)
    let tempStudentData =[]

    console.log('demo student data =',filterDemoList)

    let filterDemo = filterDemoList.filter((data, index) => {
      if((detail.trainer!= null ? data.TrainerId == detail.trainer : true) && (detail.counselor != null ? data.CounselorId == detail.counselor : true)){
        tempStudentData.push(filterDemoStudent[index])
        console.log('index',index)
      }
  console.log('counselor id= ',data.CounselorId,detail.counselor, detail.trainer)
      return (detail.trainer!= null ? data.TrainerId == detail.trainer : true) && (detail.counselor != null ? data.CounselorId == detail.counselor : true)
  
    })
    console.log('filter demo student =',filterDemo,tempStudentData)
    setDemoListData(filterDemo)
    setDemoStudent(tempStudentData)
    setCounselorStatus(detail.counselorName)
    setTrainerStatus(detail.trainer)
    
  }



  const getAllTrainer = async () => {
   let allTrainer = await ContextValue.getAllTrainer() 

    setTrainer(allTrainer)
  }
  

  let counselorData =[]

  const setCounselorData = (e)=>{
    console.log('select index =',e.target.selectedIndex,counselorData[e.target.selectedIndex])
    setDetail({...detail,["counselor"]:counselorData[e.target.selectedIndex],["counselorName"]:e.target.value})
  }
  let trainerData =[]

  const setTrainerData = (e)=>{
    console.log('select index =',e.target.selectedIndex,counselorData[e.target.selectedIndex])
    setDetail({...detail,["trainer"]:trainerData[e.target.selectedIndex],["trainerName"]:e.target.value})
  }

  const getCounselor = async()=>{
    const counsellor = await ContextValue.getAllCounselor()
    setCounselor(counsellor.counselorData)
    console.log('counselor all =',counsellor.counselorData)
  }

  const fetchRegistrationData = async () => {
    try {
      const registrationUrl = "http://localhost:8000/getregisterStudent";
      const labelSet = [];
      const registrationDataSet = [];

      const res = await fetch(registrationUrl);
      const data = await res.json();
      setRegisterStudent(data)
      setFilterRegisterStudent(data)
      console.log("data",data)

      for (const val of data) {
        const registrationDate = new Date(val.RegistrationDate);
        const monthYear = `${registrationDate.getFullYear()}-${(
          registrationDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}`;

        if (!labelSet.includes(monthYear)) {
          labelSet.push(monthYear);
        }

        console.log("label set =",labelSet,monthYear)

        const index = labelSet.indexOf(monthYear);
        registrationDataSet[index] = (registrationDataSet[index] || 0) + 1;
      }

      setChartData((prevState) => ({
        ...prevState,
        labels: labelSet,
        datasets: [
          {
            ...prevState.datasets[0],
            data: registrationDataSet,
          },
          prevState.datasets[1],
        ],
      }));
      console.log("setChartData", chartData)
    } catch (error) {
      console.error("Error fetching registration data", error);
    }
  };


    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    const setStartEndate = (timeValue) => {
      let today = new Date();
      let startDate, endDate;
    
      if (timeValue === "Today") {
        startDate = today;
        endDate = today;
      } else if (timeValue === "Yesterday") {
        today.setDate(today.getDate() - 1); // Subtract 1 day to get yesterday
        startDate = today;
        endDate = today;
      } else if (timeValue === "Last Week") {
        endDate = new Date(); // Current date
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 7); // Subtract 7 days to get a week ago
      } else {
        // Handle the case when time is not recognized
        console.error("Invalid time option");
        return;
      }
    
      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);
      setRangeDate({...rangeDate, ["startDate"]:startDateStr, ["endDate"]:endDateStr})
      console.log("start date and end date =",startDateStr, endDateStr)
    
      return { startDate: startDateStr, endDate: endDateStr };
    };
    
 const setFromTime =(fromTime)=>{
  const startDateStr =  formatDate(new Date(fromTime))
  setRangeDate({...rangeDate, ["startDate"]:startDateStr})
  console.log("from time ",startDateStr)
  
 }
 const setToTime =(toTime)=>{
  const endDateStr = formatDate(new Date(toTime))
  setRangeDate({...rangeDate, ["endDate"]:endDateStr})
  console.log("to time ",endDateStr)
 }

 const SearchDemo = async()=>{


  console.log('start and date from state =',rangeDate)

  let selectDemo = await fetch("http://localhost:8000/getRangeDemoes",{
    method:"GET",
    headers:{
      "startDate":rangeDate.startDate,
      "endDate":rangeDate.endDate
    }
  })

  selectDemo = await selectDemo.json()
  console.log('select demo =',selectDemo)
  setDemoStudent(selectDemo.totalDemoStudent)
  setDemoListData(selectDemo.Demo)
 setFilterDemoList(selectDemo.Demo)
 setFilterDemoStudent(selectDemo.totalDemoStudent)

  let selectRegister = await fetch("http://localhost:8000/getRangeRegisteredStudent",{
    method:"GET",
    headers:{
      "startDate":rangeDate.startDate,
      "endDate":rangeDate.endDate
    }
  })

  selectRegister = await selectRegister.json()
  console.log('select register =',selectRegister)
  setFilterRegisterStudent(selectRegister)
  
 }
    

  return (
    <>
      <Header />
      <div className="sidebar-main-container">
        <Sidebar />   
        <div className="right-side-container">

        <div className='d-none d-lg-flex flex-d-cloumn'>
          <div className="container-fluid mt-3 mb-3">
      

                  <div className="d-flex j-c-initial c-gap-40">
                  <select
                        id="exampleInputPassword1"
                        type="select"
                        name="Course"
                        class="custom-select mr-sm-2"
                        onChange={e =>{ setTimeValue(e.target.value);setStartEndate(e.target.value)}}
                    >
                        <option disabled selected>--select Time--</option>
                    
                                <option value="Today">Today</option>
                                <option value="Yesterday">Yesterday</option>
                                <option value="Last Week">Last Week</option>
                                <option value="Select Range">Select Range</option>
                        
                        
                    </select>

                     {timeValue==="Select Range" && 
                     <>
                     <label>From</label>
                      <input type="date" class="custom-select mr-sm-2" onChange={e=>setFromTime(e.target.value)}></input>
                      <label>To</label>
                      <input type="date" class="custom-select mr-sm-2" onChange={e=>setToTime(e.target.value)}></input>
                      </>}

          <button className='filter-btn' onClick={SearchDemo}>Search</button>
          </div>


                    <div className='message-form'>
          
            
          <div className="preference-thumb thumb">
            <label className="form-label">Counselor :</label>
            {counselor && <select className="custom-select mr-sm-2" required name='counselor' onChange={(e) => setCounselorData(e)}>
              <option selected>Choose Counselor...</option>
              {counselor.map((data,index) => {
                counselorData[index+1] = data._id
                return (
                  <option value={data.Name}>{data.Name}</option>
                )
              })}
            </select>
            }
          </div>
          <div className="preference-thumb thumb">
            <label className="form-label">Trainer :</label>
            {trainer && <select className="custom-select mr-sm-2" required name='trainer' onChange={(e) => setTrainerData(e)}>
              <option selected>Choose Trainer...</option>
              {trainer.map((data,index) => {
                trainerData[index+1] = data._id
                return (
                  <option value={data.Name}>{data.Name}</option>
                )
              })}
            </select>
            }
          </div>
          <button className='filter-btn' onClick={filterStudent}>Filter</button>
        </div>

                    </div>

                    
                <div className="d-flex flex-d-cloumn">

<div className='f-bold f-25'>Total Demo : {demoListData.length}</div>
{rangeDate && <div className='f-bold f-25'>Date :{rangeDate.startDate} - {rangeDate.endDate} </div>}
{counselorStatus && <div className='f-bold f-25'>Counselor : {detail.counselorName}</div>}
{trainerStatus && <div className='f-bold f-25'>Trainer :  {detail.trainerName}</div>}

</div>


                  { demoListData && <DemoData demolist={demoListData} demoStudent={demoStudent} />}
            
          </div>

        <div >
         
        </div>
          </div>
          </div>
     
    </>
  );
};

export default Horizontalchart;
