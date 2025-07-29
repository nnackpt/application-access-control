"use client"

import dynamic from "next/dynamic";
import { Suspense } from "react";

const UserCreate = dynamic(() => import("./Create"), {
    ssr: false
})

export default function UserCreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserCreate />
    </Suspense>
  )
}
