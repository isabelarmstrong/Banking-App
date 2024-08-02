import React, { useState } from "react";
import './styles.css'; 
import { useNavigate } from "react-router-dom";

// One react component for the entire table (Records)
const Record = (props) => (
    <tr>
        <td>{props.record.date}</td>
        <td>{props.record.time}</td>
        <td>{props.record.amount}</td>
        <td>{props.record.fromAccount}</td>
        <td>{props.record.toAccount}</td>
    </tr>
);

export default function AccountHistory() {
    const [records, setRecords] = useState([
        // Sample data for testing
        { date: "2024-07-30", time: "12:00 PM", amount: "$100.00", fromAccount: "checkings", toAccount: "savings" },
        { date: "2024-07-29", time: "1:00 PM", amount: "$50.00", fromAccount: "investments", toAccount: "checkings" },
        { date: "2024-07-28", time: "2:00 PM", amount: "$200.00", fromAccount: "savings", toAccount: "investments" }
    ]);

    const navigate = useNavigate();

    function recordList() {
        return records.map((record, index) => {
            return (
                <Record 
                    record={record}
                    key={index}
                />
            );
        });
    }

    return (
        <div>
            <div>
                <input className="logout-button"
                    type="submit"
                    value="Log Out"
                />
            </div>
            <h3 className="transaction-history-title">Transfer History</h3>
            <table className="transaction-history-table" style={{marginTop: 20}}>
                <thead>
                    <tr>
                        <th style={{width: "20%"}}>Date</th>
                        <th style={{width: "20%"}}>Time</th>
                        <th style={{width: "20%"}}>Amount</th>
                        <th style={{width: "20%"}}>From</th>
                        <th style={{width: "20%"}}>To</th>
                    </tr>
                </thead>
                <tbody>{recordList()}</tbody>
            </table>

            <div>
                <button className="view-account-balance-button" onClick={() => navigate("/accountBalance")}>
                    View account balances
                </button>
            </div>
        </div>
    );
}
