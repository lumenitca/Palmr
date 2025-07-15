"use client";

import { Suspense } from "react";

import DemoClient from "./components/demo-client";

export default function DemoPage() {
  return (
    <Suspense>
      <DemoClient />
    </Suspense>
  );
}
