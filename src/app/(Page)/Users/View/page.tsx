import { Suspense } from "react";
import UserViewPage from "./view";

export default function UserView() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserViewPage />
    </Suspense>
  )
}