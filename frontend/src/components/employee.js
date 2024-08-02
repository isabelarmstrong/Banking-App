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
        <div className="employee-wrapper">
            <div className="employee-container">
                <h3>Employee Dashboard</h3>
                {/* Display the welcome message using the first record */}
                {records.length > 0 && (
                    <p className="employee-p">Welcome Back, {records[0].firstName} {records[0].lastName}!</p>
                )}
                
                <form className="employee-form-container">
                    <div className="employee-form-group">
                        <label>Customer Email:</label>
                        <input 
                        type="text" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>
                    <button type="button" className="employee-form-button" onClick={handleViewBalance}>View Account Balance</button>
                </form>

                {message && <p className="message">{message}</p>}

                <div className="employee-button-container">
                <button onClick={handleViewBalance}>View Account Balance</button>
                <button onClick={() => navigate("/transferFunds")}>Transfer Funds Between Customers</button>
                </div>
                <div>
                    <button className="logout-button" onClick={(e) => onSubmit(e)}>Log Out</button>
                </div>
            </div>
        </div>
    );

}