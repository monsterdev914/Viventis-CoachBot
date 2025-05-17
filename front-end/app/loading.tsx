'use client'
import { Spinner } from "@heroui/react";

const Loading = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <Spinner size="lg" color="primary" />
        </div>
    )
}

export default Loading;