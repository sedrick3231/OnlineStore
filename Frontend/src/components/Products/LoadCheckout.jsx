import { lazy, Suspense, useEffect, useState } from "react";
const Checkout = lazy(() => import("./Checkout"));

export default function CheckoutWrapper() {

  return (
      <Suspense fallback={null}>
        <Checkout />
      </Suspense>
  );
}
