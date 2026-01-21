import { useEffect } from "react";

function App() {
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // Test backend connection
    fetch(`${API_URL}/api/test`)
      .then((res) => res.json())
      .then((data) => console.log("Backend response:", data))
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <div className="App">
      <h1>Realtime Quiz Hub</h1>
      <p>Open the console to see the backend response.</p>
    </div>
  );
}

export default App;
