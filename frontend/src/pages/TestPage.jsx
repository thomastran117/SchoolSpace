import { useEffect, useState } from "react";
import api from "../api.js"; 

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api("/courses");
        setData(await res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    })();
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
