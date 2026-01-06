import React from 'react';

const PreLoading = () => {
    return (
        <div className="preloading-backdrop" style={{zIndex:9999999}}>
            <div className="preloading-dots">
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

export default PreLoading;
