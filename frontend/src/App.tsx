import { useEffect, useState } from "react";

type Question = {
  question: string;
  options: string[];
  answer: string; // optional if you want to check correctness
};

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState<number>(0);

  const API_URL = import.meta.env.VITE_API_URL; // your backend URL

  // Fetch questions from backend
  useEffect(() => {
    fetch(`${API_URL}/api/questions`)
      .then((res) => res.json())
      .then((data: Question[]) => setQuestions(data))
      .catch((err) => console.error(err));
  }, []);

  const handleAnswer = (option: string) => {
    // Optional: you can check if option === questions[current].answer
    setCurrent((prev) => prev + 1);
  };

  if (questions.length === 0) return <p>Loading questions...</p>;
  if (current >= questions.length) return <p>Quiz finished!</p>;

  const q = questions[current];

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Realtime Quiz Hub</h1>
      <h2>{q.question}</h2>
      <div>
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            style={{ display: "block", margin: "10px 0", padding: "10px 20px" }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
