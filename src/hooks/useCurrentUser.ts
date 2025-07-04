import { useEffect, useState } from "react";

export default function useCurrentUser() {
    const [userName, setUserName] = useState<string>("system")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("http://10.83.51.52:5070/api/UserInfo/current", { credentials: "include" })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            setUserName(data?.UserName || "system")
            setLoading(false)
        })
        .catch(() => {
            setUserName("system")
            setLoading(false)
        })
    }, [])

    return { userName, loading }
}