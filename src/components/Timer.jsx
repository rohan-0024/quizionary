import React, { useEffect } from "react";

function Timer({ seconds, onTimeUp, reset }) {
    const [time, setTime] = React.useState(seconds);

    useEffect(() => {
        setTime(seconds);
    }, [reset, seconds]);

    useEffect(() => {
        if (time === 0) {
            onTimeUp();
            return;
        }
        const interval = setInterval(() => setTime((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [time, onTimeUp]);

    return (
        <span className={`timer ${time <= 5 ? "danger" : ""}`}>{time}s</span>
    );
}

export default Timer;
