import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TransferBetweenCustomers() {
    const [fromEmail, setFromEmail] = useState("");
    const [toEmail, setToEmail] = useState("");
    const [fromAccount, setFromAccount] = useState("checking");
    const [toAccount, setToAccount] = useState("checking");
    const [transferAmount, setTransferAmount] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleTransfer = async () => {
        if (!fromEmail || !toEmail || !transferAmount) {
            setMessage("Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch("http://localhost:4000/transfer-to-another-account", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fromEmail,
                    toEmail,
                    fromAccount,
                    toAccount,
                    transferAmount: parseFloat(transferAmount),
                }),
            });

            if (response.ok) {
                const resultMessage = await response.text();
                setMessage(resultMessage);
            } else {
                const errorMessage = await response.text();
                setMessage(errorMessage);
            }
        } catch (error) {
            setMessage("An error occurred while processing the transfer.");
        }
    };

    return (
        <div className="transfer-container">
            <h3>Transfer Money Between Customers</h3>

            <form>
                <div className="transfer-form-group">
                    <label>From Email:</label>
                    <input
                        type="email"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                    />
                </div>

                <div className="transfer-form-group">
                    <label>To Email:</label>
                    <input
                        type="email"
                        value={toEmail}
                        onChange={(e) => setToEmail(e.target.value)}
                    />
                </div>

                <div className="transfer-form-group">
                    <label>From Account Type:</label>
                    <select
                        value={fromAccount}
                        onChange={(e) => setFromAccount(e.target.value)}
                    >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="investments">Investments</option>
                    </select>
                </div>

                <div className="transfer-form-group">
                    <label>To Account Type:</label>
                    <select
                        value={toAccount}
                        onChange={(e) => setToAccount(e.target.value)}
                    >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="investments">Investments</option>
                    </select>
                </div>

                <div className="transfer-form-group">
                    <label>Amount to Transfer:</label>
                    <input
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                    />
                </div>

                <div className="transfer-button-group">
                    <button type="button" onClick={handleTransfer}>Transfer</button>
                    <button type="button" onClick={() => navigate("/employee")}>Back to Dashboard</button>
                </div>

                {message && <p className="transfer-message">{message}</p>}
            </form>
        </div>
    );
}
