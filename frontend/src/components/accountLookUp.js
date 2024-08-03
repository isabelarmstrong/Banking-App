import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";



export default function AccountLookUp(){
    const[records, setRecords] = useState([]);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
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

async function handleClick() {

    //grab the curr session's email
    const sessionResponse = await fetch(`http://localhost:4000/session_get/`, {
        method: "GET",
        credentials: 'include'
    }).catch(error => {
        window.alert(error);
        return;
    });

    const email = await sessionResponse.json();

    //find their role
    const response = await fetch(`http://localhost:4000/userAccounts/${email}`);
    if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
    }

    const responseRecords = await response.json();


    if (responseRecords[0].role === "admin"){
        navigate("/adminHome");
    } else{
        navigate("/employee");
    }
}

  
    return (
        <div className="transfer-container">
            <h3>Look Up a Customer</h3>

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

                <div className="transfer-button-group">
                    <button type="button" onClick={handleClick}>Back to Dashboard</button>
                </div>

                {message && <p className="message">{message}</p>}
        </div>
    );

}