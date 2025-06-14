"use client";
import React, { Suspense } from "react";
const PageContent = React.lazy(() => import("./PageContent"));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
