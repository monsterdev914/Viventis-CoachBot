'use client'
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import api from "@/utiles/axiosConfig";
import { Button } from "@heroui/react";

const DashboardPage = () => {
    return (
        <ProtectedRoute>
            <div>
                <h1>Dashboard</h1>
                <Button onClick={() => {
                    api.get(`/test`).then((res) => {
                        console.log(res.data)
                    })
                }}>Test</Button>
            </div>
        </ProtectedRoute>
    )
}

export default DashboardPage;