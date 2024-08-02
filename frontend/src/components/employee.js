import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Record = (props) => (
  <tr>
      <td>{props.record.firstName}</td>
      <td>{props.record.lastName}</td>

  </tr>
);


export default function EmployeeDashboard(){
    const [records, setRecords] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
      // Fetch employee data or any required data here if needed
    }, []);

  


    
  
    return (
    <div>
      <h3>EmployeeDashboard</h3>
      <table style={{marginTop: 20}}>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                    </tr>
                </thead>
                <tbody>{recordList()}</tbody>
            </table>

      <div>
         <a href="/register">Register New User</a>
       </div>
    </div>
    );

}