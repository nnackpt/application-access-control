import { Suspense } from "react";
import RbacViewPage from "./view";

export default function RbacView() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RbacViewPage />
    </Suspense>
  )
}