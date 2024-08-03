import React from "react";
import { useNavigate } from "react-router-dom";


export default function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <div className="transfer-container">
                <h3>Home page</h3>
                <input className="login-button" type="submit" value="Log In" onClick={() => navigate("/login")} />
            </div>
        </div>
    );
}