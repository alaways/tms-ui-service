import React from "react";

function ConfigInfo() {
    const apiUrl = process.env.BACKEND_URL;

    return (
        <div className="text-center">
            <h1>Config Info</h1>
            <hr />
            <p>
                <strong>API URL:</strong> {apiUrl}
            </p>
        </div>
    );
}

export default ConfigInfo;
