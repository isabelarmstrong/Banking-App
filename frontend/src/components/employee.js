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
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [employeeName, setEmployeeName] = useState({ firstName: "", lastName: "" });
    const navigate = useNavigate();

    useEffect(() => {
        async function getEmployeeInfo() {
            const sessionResponse = await fetch(`http://localhost:4000/session_get/`,
                {
                    method: "GET",
                    credentials: 'include'
                }
            ).catch(error => {
                window.alert(error);
                return;
            });

            const email = await sessionResponse.json();
            if (email === ""){
                navigate("/");
            }

            //get user if logged in
            const response = await fetch(`http://localhost:4000/userAccounts/${email}`);
            if(!response.ok){
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const responseRecords = await response.json();
            setRecords(responseRecords);
            return;
        }

        getEmployeeInfo();
        return;
    },[records.length]);



 const handleViewBalance = async () => {
    if (email) {
        try {
            const response = await fetch(`http://localhost:4000/userAccounts/${email}`);
            if (response.ok) {
                const userData = await response.json();
                if (userData.length > 0) {
                    // Pass the data to the AccountBalance page or use a context
                    navigate("/accountBalance", { state: { records: userData } });
                } else {
                    setMessage("No account found for the provided email.");
                }
            } else {
                setMessage("Failed to retrieve account information.");
            }
        } catch (error) {
            setMessage("An error occurred while fetching account information.");
        }
    } else {
        setMessage("Please enter a valid email.");
    }
 };


    function recordList(){
      return records.map((record) => {
          return (
              <Record 
                  record={record}
                  key={record.email}
              />
          );
      });
  }

  async function onSubmit(e) {
    e.preventDefault(); //Don't do the default reaction of reloading the page

    const sessionResponse = await fetch(`http://localhost:4000/session_delete`,
        {
            method: "GET",
            credentials: 'include'
        }
    ).catch(error => {
        window.alert(error);
        return;
    });

    console.log("Checking response!");

    if (!sessionResponse.ok){
        const message = `An error occurred: ${sessionResponse.statusText}`;
        window.alert(message);
        return;
    }
     
    navigate("/");
    
}

  
    return (
        <div className="container">
            <h3>Employee Dashboard</h3>
            <p>Welcome Back, {employeeName.firstName} {employeeName.lastName}</p>

            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                    </tr>
                </thead>
                <tbody>{recordList()}</tbody>
            </table>

            <form>
                <label>Customer Email:</label>
                <input 
                    type="text" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <button type="button" onClick={handleViewBalance}>View Account Balance</button>
            </form>

            {message && <p className="message">{message}</p>}

            <div>
                <a href="/register" className="link-button">Register New User</a>
            </div>
            <div>
                <button className="link-button" onClick={() => navigate("/transferFunds")}>Transfer Funds Between Customers</button>
            </div>
            <div>
                <button className="logout-button" onClick={(e) => onSubmit(e)}>Log Out</button>
            </div>
        </div>
    );

}