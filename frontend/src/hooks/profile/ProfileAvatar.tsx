import { useEffect, useRef, useState } from "react";
import ProtectedApi from "../../api/ProtectedApi";

export function useProtectedAvatar(avatarPath?: string | null) {
  const [src, setSrc] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!avatarPath) return;

    const controller = new AbortController();

    ProtectedApi.get(avatarPath, {
      responseType: "blob",
      signal: controller.signal,
    })
      .then((res) => {
        const url = URL.createObjectURL(res.data);

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }

        objectUrlRef.current = url;
        setSrc(url);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load avatar", err);
      });

    return () => {
      controller.abort();

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [avatarPath]);

  return avatarPath ? src : null;
}
