import { useEffect, useState } from "react";
import ProtectedApi from "../../api/ProtectedApi";

export function useProtectedAvatar(avatarPath?: string | null) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarPath) {
      setSrc(null);
      return;
    }

    let revoked = false;
    let objectUrl: string | null = null;

    ProtectedApi.get(avatarPath, { responseType: "blob" })
      .then((res) => {
        if (revoked) return;

        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => {
        setSrc(null);
      });

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [avatarPath]);

  return src;
}
