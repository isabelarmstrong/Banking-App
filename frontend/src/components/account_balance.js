import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './styles.css'; // Adjust the path as needed

const Record = (props) => (
    <tr>
        <td>{props.record.checking}</td>
        <td>{props.record.savings}</td>
        <td>{props.record.investments}</td>
    </tr>
);

export default function AccountSummary() {
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState({
        //account: "",
        dollar: "",
        cents: "",
        action: "",
        fromAccount: "",
        toAccount: "",
    });

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserData() {
            const sessionResponse = await fetch(`http://localhost:4000/session_get/`, {
                method: "GET",
                credentials: 'include'
            }).catch(error => {
                window.alert(error);
                return;
            });

            const email = await sessionResponse.json();
            const response = await fetch(`http://localhost:4000/userAccounts/${email}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const responseRecords = await response.json();
            setRecords(responseRecords);
        }

        fetchUserData();
    }, []);

    function recordList() {
        return records.map((record) => {
            return (
                <Record 
                    record={record}
                    key={record.email}
                />
            );
        });
    }

    async function onLogOut(e) {
        e.preventDefault();

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

        navigate("/");
    }

    async function onSubmit(e) {
        e.preventDefault();

        console.log("fromAccount: " + form.fromAccount);
        console.log("toAccount: " + form.toAccount);

        if (form.action === "transfer") {
            if (form.fromAccount === "" || form.toAccount === "" || form.dollar === "" || form.cents === "") {
                window.alert("An error occurred. Please check to make sure all fields are filled.");
                return;
            }
        } else {
            if (form.fromAccount === "" || form.action === "" || form.dollar === "" || form.cents === "") {
                window.alert("An error occurred. Please check to make sure all fields are filled.");
                return;
            }
        }

        const sessionResponse = await fetch(`http://localhost:4000/session_get/`, {
            method: "GET",
            credentials: 'include'
        }).catch(error => {
            window.alert(error);
            return;
        });

        const email = await sessionResponse.json();

        //const amountInCents = parseInt(form.dollar) * 100 + parseInt(form.cents);
        const newPerson = { 
            ...form 
            //transferAmount: amountInCents 
        };

        
        console.log("Selecting an action");
        let url = "";
        if (form.action === "transfer") {
            url = `http://localhost:4000/${form.fromAccount}/${form.toAccount}/${email}`;
        } else {
            url = `http://localhost:4000/${form.fromAccount}/${form.action}/${email}`;
        }
        console.log("URL is: " + url);

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

        // Create new transaction object
            const newTransaction = {
                emailAddress: email,
                action: form.action,
                amount: parseInt(form.dollar) * 100 + parseInt(form.cents), // Convert to cents
                fromAccount: form.fromAccount,
                toAccount: form.toAccount,
                date: new Date().toLocaleDateString(), 
                time: new Date().toLocaleTimeString()
            };

            // Make API call to add transaction
            await fetch(`http://localhost:4000/transactionHistory/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newTransaction),
            }).catch(error => {
                window.alert(error);
                return;
            });

        // Reset form fields based on action
        if (form.action === "transfer") {
            setForm({ 
                //account: "", 
                action: "", 
                dollar: "", 
                cents: "", 
                fromAccount: "", 
                toAccount: "" 
            });
        } else {
            setForm({ 
                //account: "", 
                action: "", 
                dollar: "", 
                cents: "", 
                fromAccount: "", 
            });
        }

        const response = await fetch(`http://localhost:4000/userAccounts/${email}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        const responseRecords = await response.json();
        setRecords(responseRecords);
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

                {(form.action === "withdraw" || form.action === "deposit") && (
                    <>
                        <h4>Select which account:</h4>
                        <div>
                            <input
                                id="accountChecking"
                                type="radio"
                                value="checking"
                                checked={form.fromAccount === "checking"}
                                onChange={(e) => updateForm({ fromAccount: e.target.value })}
                            />
                            <label htmlFor="accountChecking">Checking</label>
    
                            <input
                                id="accountSavings"
                                type="radio"
                                value="savings"
                                checked={form.fromAccount === "savings"}
                                onChange={(e) => updateForm({ fromAccount: e.target.value })}
                            />
                            <label htmlFor="accountSavings">Savings</label>
    
                            <input
                                id="accountInvestments"
                                type="radio"
                                value="investments"
                                checked={form.fromAccount === "investments"}
                                onChange={(e) => updateForm({ fromAccount: e.target.value })}
                            />
                            <label htmlFor="accountInvestments">Investment</label>
                        </div>
                    </>
                )}
                

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
                                id="fromAccountInvestments"
                                type="radio"
                                value="investments"
                                checked={form.fromAccount === "investments"}
                                onChange={(e) => updateForm({ fromAccount: e.target.value })}
                            />
                            <label htmlFor="fromAccountInvestments">Investment</label>
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
                                id="toAccountInvestments"
                                type="radio"
                                value="investments"
                                checked={form.toAccount === "investments"}
                                disabled={form.fromAccount === "investments"}
                                onChange={(e) => updateForm({ toAccount: e.target.value })}
                            />
                            <label htmlFor="toAccountInvestments">Investment</label>
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
                    <button className="make-transaction-button" onClick={() => navigate("/account_history")}>
                        Transaction History</button>
                </div>
            </form>
        </div>
    );
}
