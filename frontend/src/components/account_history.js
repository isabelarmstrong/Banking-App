import React, { useState, useEffect } from "react";
import './styles.css'; 
import { useNavigate } from "react-router-dom";

// One react component for the entire table (Records)
const Record = ({ record }) => (
    <tr>
        <td>{record.date}</td>
        <td>{record.time}</td>
        <td>{record.amount}</td>
        <td>{record.action}</td>
        <td>{record.fromAccount}</td>
        <td>{record.action === "transfer" ? record.toAccount : "-"}</td>
    </tr>
);


export default function AccountHistory() {
    const [records, setRecords] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchHistory() {
            try {
                const sessionResponse = await fetch(`http://localhost:4000/session_get/`, {
                    method: "GET",
                    credentials: 'include'
                });

                if (!sessionResponse.ok) {
                    throw new Error("Failed to get session");
                }

                const email = await sessionResponse.json();
                const response = await fetch(`http://localhost:4000/transactionHistory/${email}`);
                
                if (!response.ok) {
                    throw new Error("Failed to fetch transaction history");
                }

                const historyData = await response.json();
                setRecords(historyData.transactions);
            } catch (error) {
                window.alert(error);
            }
        }

        fetchHistory();
    }, []);

    function recordList() {
        return records.map((record, index) => (
            <Record 
                record={record}
                key={index}
            />
        ));
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
                <button className="make-transaction-button-th" onClick={() => navigate("/accountBalance")}>
                    View account balances
                </button>
            </div>
            <h3 className="transaction-history-title">Transfer History</h3>

            <div>
                
            </div>

            <table className="transaction-history-table" style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th style={{ width: "10%" }}>Date</th>
                        <th style={{ width: "10%" }}>Time</th>
                        <th style={{ width: "10%" }}>Amount</th>
                        <th style={{ width: "10%" }}>Action</th>
                        <th style={{ width: "10%" }}>From</th>
                        <th style={{ width: "10%" }}>To</th>
                    </tr>
                </thead>
                <tbody>{recordList()}</tbody>
            </table>
        </div>
    );
}
