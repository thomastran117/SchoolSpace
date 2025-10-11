import { useEffect, useState } from "react";
import ProtectedApi from "../api/ProtectedApi.js";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await ProtectedApi("/courses");
        setData(await res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    })();
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
