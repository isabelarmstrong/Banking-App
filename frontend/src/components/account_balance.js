import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './styles.css'; // Adjust the path as needed

const Record = (props) => (
    <tr>
        <td>{props.record.checking}</td>
        <td>{props.record.savings}</td>
        <td>{props.record.investment}</td>
    </tr>
);

export default function AccountSummary() {
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState({
        account: "",
        dollar: "",
        cents: "00",
        action: "",
        fromAccount: "",
        toAccount: "", // Add this field for the transfer destination
    });

    const navigate = useNavigate();

    // Mocked data for testing
    const mockRecords = [
        { checking: "1500.00", savings: "3000.00", investment: "12000.00" }
    ];

    function recordList() {
        return mockRecords.map((record, index) => {
            return <Record key={index} record={record} />;
        });
    }

    async function onLogOut(e) {
        e.preventDefault();

        // Commented out API call
        /*
        const sessionResponse = await fetch(`http://localhost:4000/session_delete`, {
            method: "GET",
            credentials: 'include'
        }).catch(error => {
            window.alert(error);
            return;
        });

        if (!sessionResponse.ok) {
            const message = `An error occurred: ${sessionResponse.statusText}`;
            window.alert(message);
            return;
        }
        */

        // Navigate to home page for testing
        navigate("/");
    }

    async function onSubmit(e) {
        e.preventDefault();

        if (form.account === "" || form.action === "" || form.dollar === "" || form.cents === "") {
            window.alert("An error occurred. Please check to make sure all fields are filled.");
            return;
        }

        // Commented out API call
        /*
        const sessionResponse = await fetch(`http://localhost:4000/session_get/`, {
            method: "GET",
            credentials: 'include'
        }).catch(error => {
            window.alert(error);
            return;
        });

        const email = await sessionResponse.json();

        const amountInCents = parseInt(form.dollar) * 100 + parseInt(form.cents);
        const newPerson = { 
            ...form, 
            transferAmount: amountInCents 
        };

        let url = `http://localhost:4000/${form.account}/${form.action}/${email}`;
        if (form.action === "transfer") {
            url = `http://localhost:4000/transfer/${email}`;
        }

        await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newPerson),
        }).catch(error => {
            window.alert(error);
            return;
        });

        setForm({ account: "", action: "", dollar: "", cents: "00", toAccount: "" });

        const response = await fetch(`http://localhost:4000/userAccounts/${email}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        const responseRecords = await response.json();
        setRecords(responseRecords);
        */

        // For frontend testing, reset form
        setForm({ account: "", action: "", dollar: "", cents: "00", toAccount: "" });
    }

    function updateForm(jsonObj) {
        return setForm((prevJsonObj) => {
            return { ...prevJsonObj, ...jsonObj };
        });
    }

    return (
        <div>
            <div>
                <input className="logout-button" type="submit" value="Log Out" onClick={(e) => onLogOut(e)} />
            </div>
            <h3>Transaction</h3>
            <table className="account-balance-table" style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th>Checking</th>
                        <th>Savings</th>
                        <th>Investment</th>
                    </tr>
                </thead>
                <tbody>{recordList()}</tbody>
            </table>

            <form onSubmit={onSubmit}>
                <h4>Select which account:</h4>
                <div>
                    <input
                        id="accountChecking"
                        type="radio"
                        value="checking"
                        checked={form.account === "checking"}
                        onChange={(e) => updateForm({ account: e.target.value })}
                    />
                    <label htmlFor="accountChecking">Checking</label>

                    <input
                        id="accountSavings"
                        type="radio"
                        value="savings"
                        checked={form.account === "savings"}
                        onChange={(e) => updateForm({ account: e.target.value })}
                    />
                    <label htmlFor="accountSavings">Savings</label>

                    <input
                        id="accountInvestment"
                        type="radio"
                        value="investment"
                        checked={form.account === "investment"}
                        onChange={(e) => updateForm({ account: e.target.value })}
                    />
                    <label htmlFor="accountInvestment">Investment</label>
                </div>

                <h4>Select an action:</h4>
                <div>
                    <input
                        id="actionDeposit"
                        type="radio"
                        value="deposit"
                        checked={form.action === "deposit"}
                        onChange={(e) => updateForm({ action: e.target.value })}
                    />
                    <label htmlFor="actionDeposit">Deposit</label>

                    <input
                        id="actionWithdraw"
                        type="radio"
                        value="withdraw"
                        checked={form.action === "withdraw"}
                        onChange={(e) => updateForm({ action: e.target.value })}
                    />
                    <label htmlFor="actionWithdraw">Withdraw</label>

                    <input
                        id="actionTransfer"
                        type="radio"
                        value="transfer"
                        checked={form.action === "transfer"}
                        onChange={(e) => updateForm({ action: e.target.value })}
                    />
                    <label htmlFor="actionTransfer">Transfer</label>
                </div>

                {form.action === "transfer" && (
                    <div>
                        <h4>From Account:</h4>
                        <div>
                            <input
                                id="fromAccountChecking"
                                type="radio"
                                value="checking"
                                checked={form.fromAccount === "checking"}
                                onChange={(e) => updateForm({ fromAccount: e.target.value })}
                            />
                            <label htmlFor="fromAccountChecking">Checking</label>

                            <input
                                id="fromAccountSavings"
                                type="radio"
                                value="savings"
                                checked={form.fromAccount === "savings"}
                                onChange={(e) => updateForm({ fromAccount: e.target.value })}
                            />
                            <label htmlFor="fromAccountSavings">Savings</label>

                            <input
                                id="fromAccountInvestment"
                                type="radio"
                                value="investment"
                                checked={form.fromAccount === "investment"}
                                onChange={(e) => updateForm({ fromAccount: e.target.value })}
                            />
                            <label htmlFor="fromAccountInvestment">Investment</label>
                        </div>
                        
                        <h4>To Account:</h4>
                        <div>
                            <input
                                id="toAccountChecking"
                                type="radio"
                                value="checking"
                                checked={form.toAccount === "checking"}
                                disabled={form.fromAccount === "checking"}
                                onChange={(e) => updateForm({ toAccount: e.target.value })}
                            />
                            <label htmlFor="toAccountChecking">Checking</label>

                            <input
                                id="toAccountSavings"
                                type="radio"
                                value="savings"
                                checked={form.toAccount === "savings"}
                                disabled={form.fromAccount === "savings"}
                                onChange={(e) => updateForm({ toAccount: e.target.value })}
                            />
                            <label htmlFor="toAccountSavings">Savings</label>

                            <input
                                id="toAccountInvestment"
                                type="radio"
                                value="investment"
                                checked={form.toAccount === "investment"}
                                disabled={form.fromAccount === "investment"}
                                onChange={(e) => updateForm({ toAccount: e.target.value })}
                            />
                            <label htmlFor="toAccountInvestment">Investment</label>
                        </div>
                    </div>
                )}

                <div>
                    <label>Amount: </label>
                    <input
                        type="text"
                        id="dollars"
                        value={form.dollar}
                        onChange={(e) => updateForm({ dollar: e.target.value })}
                    />
                    .
                    <input
                        type="text"
                        id="cents"
                        value={form.cents}
                        onChange={(e) => updateForm({ cents: e.target.value })}
                    />
                </div>

                <div>
                    <input className="commit-transfer-button" type="submit" value="Commit" />
                </div>
            </form>
        </div>
    );
}
