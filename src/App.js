import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx';
import axios from 'axios';
import $ from 'jquery';
import {FaUpload,FaTrashAlt} from 'react-icons/fa'
import './App.css';
import './css/index.css';

const MURL = "https://excelshow.herokuapp.com/";
function App() {
  const iniPStat = {
    loading: false,
    fetching: false,
    fetched: false
  }
  const [pageState, setPageState] = useState(iniPStat);
  const [searchContent,setSearchContent] = useState("");
  const [showSend,setShowSend] = useState(false);
  const [mdata,setDData] = useState([]);
  // fetch database
  const [data, setData] = useState([]);
  const fetchData = () => {
    setPageState({ ...pageState, loading: true, fetching: true });
    axios.get('https://excelshow.herokuapp.com/api/show').then((res) => {
      console.log(res);
      setData(res.data);
      setPageState({ ...pageState, fetching: false });
    }).catch((err) => {
      console.log("unable to fetch data ", err);
    });

    setPageState({ ...pageState, fetching: false, fetched: true });
  }
  //serarch
  const searchHandler = (e)=>{

    axios.get(`https://excelshow.herokuapp.com/api/search/${e.target.value}`).then((res)=>{
      setData(res.data);
      setPageState({ ...pageState, fetching: false });
      
    }).catch((err) => {
      console.log(err);
    })
  }
  // updating the database

  const updateDatabase = (data) => {
    console.log("my dataArray is", data);
    axios.post('https://excelshow.herokuapp.com/api/add', { data }).then((res) => {
      console.log(res);
      fetchData();
      
    }).catch((err) => {
      console.log(err);
    })
  }
  const uploadHandler = () =>{
    updateDatabase(mdata);
    setShowSend(false);
    document.querySelector('.custom-file-input').value = null;
    document.querySelector(".actual-file-upload-wrapper .file-name").innerText = "No file choosen yet.";
  }
  //convert file to json object 
  const fileLoader = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: "buffer" });

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);

        resolve(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      setDData(d);
      setShowSend(true);
    }).catch((err) => {
      console.log("unable to fetch details : ", err);
    });
  }

  //delete handler
  const deleteHandler = ()=>{
    axios.get("https://excelshow.herokuapp.com/api/delete").then((res) => {
      console.log(res);
      fetchData();
      
    }).catch((err) => {
      console.log(err);
    })
  }

  useEffect(() => {
    fetchData();

  }, []);

  return (
    <div className="main-container">

      <input className="custom-file-input" type="file" onChange={(e) => {
        const file = e.target.files[0];
        document.querySelector(".actual-file-upload-wrapper .file-name").innerText = file.name;
        fileLoader(file)
      }} />
      <div className = "file-upload-w">
        <div className="actual-file-upload-wrapper">
          <button className="file-button" onClick={() => {
            document.querySelector('.custom-file-input').click();
          }}>Choose a File</button>
          <span className="file-name">No file choosen yet.</span>
        </div>
        {
          showSend &&
          <div className = "send-button-wrapper">
            <button className = "send-button" onClick = {(e)=>uploadHandler(e)}><FaUpload/></button>         
          </div>
        }
        <div className = "search-wrapper">
          <input className = "seachbar" type = "text" placeholder = "Search" onChange = {(e) => searchHandler(e)}/>
          <button className = "trash-btn" onClick = {() => {
            deleteHandler()
          }}><FaTrashAlt/></button>
        </div>
      </div>



      <div className="table-main-wrapper">
        {
          (data.length !== 0 && !pageState.loading) && <table cellSpacing="0" cellPadding="0" className="table-wrapper">
            <thead className="table-head">
              <tr className="table-head-col">
                <th><span>NAME</span></th>
                <th><span>ROLL_NO</span></th>
                <th><span>CLASS</span></th>
              </tr>
            </thead>
            <tbody className="table-body">
              {
                data.map((item) => {
                  return (
                    <tr key={item.id} className="table-row">
                      <td><span>{item.Name}</span></td>
                      <td><span>{item.Roll_no}</span></td>
                      <td><span>{item.Class}</span></td>
                    </tr>
                  )
                })
              }
            </tbody>

          </table>

        }
        {
          !data.length && <div style = {{
            color : "white",
            margin:"20px"
          }}>
            <span>OOPS! NO DATA !</span>
          </div>
        }
      </div>
    </div>
  );
}

export default App;
