"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManageOrderRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/manage-order/dealer");
  }, [router]);

  return null;
}
