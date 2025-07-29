import { Suspense } from "react";
import RbacEditPage from "./Edit";

export default function RbacEdit() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RbacEditPage />
        </Suspense>
    )
}