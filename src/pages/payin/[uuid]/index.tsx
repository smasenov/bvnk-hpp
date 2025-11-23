import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Redirects from /payin/[uuid] to /payin/[uuid]/accept-quote
 * Maintains backward compatibility with the original route
 */
export default function PayinIndex() {
  const router = useRouter();
  const { uuid } = router.query;

  useEffect(() => {
    if (uuid && typeof uuid === "string") {
      router.replace(`/payin/${uuid}/accept-quote`);
    }
  }, [uuid, router]);

  return null;
}

