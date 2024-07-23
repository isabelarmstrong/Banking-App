import React from "react";
import { useNavigate } from "react-router-dom";


export default function Home() {
    return (
        <div>
            <h3>Home page</h3>
            <div>
                <a href="/login">Log In</a>
            </div>

            <div>
                <a href="/register">Register</a>
            </div>
        </div>
    );
}