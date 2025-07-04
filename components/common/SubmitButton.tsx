import React from "react";
import { RiLoader2Fill } from "react-icons/ri";

type Props = {
    submitted: boolean;
    onClick: (e: { preventDefault: () => void; }) => void;
    type: "button" | "submit" | "reset" | undefined;
};

const SubmitButton = ({ submitted, onClick, type }: Props) => {
    return (
        <>
            {submitted ? (
                <>
                    <button
                        className="btn flex btn-success w-full lg:w-fit  text-white font-bold py-2 px-4 rounded mr-4 focus:outline-none focus:shadow-outline"
                        type="button"
                    >
                        <span>
                            <RiLoader2Fill className="animate-spin" color="white" size="27" />
                        </span>
                        Processing...
                    </button>
                </>
            ) : (
                <button
                    className="btn btn-success w-full lg:w-28  text-white font-bold py-2 px-4 rounded mr-4 focus:outline-none focus:shadow-outline"
                    type={type}
                    onClick={onClick}
                >
                    Submit
                </button>
            )}
        </>
    );
};

export default SubmitButton;
