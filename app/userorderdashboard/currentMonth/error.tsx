"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    console.log(error);
    return (
        <div className="flex flex-col items-center justify-center gap-2 h-screen">
            <h2 className="text-xl sm:text-2xl font-bold mb-5">
                Something went wrong!
                <p className="text-sm">{error.message}</p>
            </h2>
            <span>
                <button onClick={() => reset()}>Try again</button>
            </span>
        </div>
    );
}
