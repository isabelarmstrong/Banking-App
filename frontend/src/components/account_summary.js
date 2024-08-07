import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

//One react component for the entire table (Records)
//Another react component for each row of the result set (Record)

const Record = (props) => (
    <tr>
        <td>{props.record.firstName}</td>
        <td>{props.record.lastName}</td>
        <td>{props.record.phone}</td>
        <td>{props.record.email}</td>
    </tr>
);

export default function AccountSummary() {
    const [records, setRecords] = useState([]);

    const navigate = useNavigate();

    useEffect(() => { //Retrieve results from backend
        async function getRecords() {

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

        getRecords();
        return;
    },[records.length]);

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
        <div>
            <div>
                    <input
                        className="logout-button"
                        type="submit"
                        value="Log Out"
                        onClick={(e) => onSubmit(e)}
                    />
            </div>
            <h3>Record List</h3>
            <table style={{marginTop: 20}}>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>{recordList()}</tbody>
            </table>

            <button className="view-account-balance-button" onClick={() => navigate("/accountBalance")}>
                    Make a Transaction
            </button>
            <button className="make-transaction-button" onClick={() => navigate("/account_history")}>
                    View Transfer History
            </button>
        </div>
    );
}