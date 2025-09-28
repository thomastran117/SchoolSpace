import { useEffect, useState } from "react";
import { fetchWithAuth } from "../api/fetchClient";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth("/courses");
        if (res.ok) {
          setData(await res.json());
        } else {
          console.error("Request failed:", res.status);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    })();
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
