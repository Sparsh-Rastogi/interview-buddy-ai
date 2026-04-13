const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

// middleware
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

// 🔥 In-memory session store
let sessions = {};

// ==============================
// TEST ROUTE
// ==============================
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ==============================
// START INTERVIEW
// ==============================
app.post("/api/interview/start", (req, res) => {
  const sessionId = Date.now().toString();

  sessions[sessionId] = {
    history: [],
    currentQuestion: "Tell me about yourself",
    status: "ongoing"
  };

  res.json({
    sessionId,
    question: sessions[sessionId].currentQuestion
  });
});

// ==============================
// ANSWER QUESTION (CORE API)
// ==============================
app.post("/api/interview/answer", async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    // validation
    if (!sessionId || !answer || answer.trim().length < 3) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const session = sessions[sessionId];

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status !== "ongoing") {
      return res.status(400).json({ error: "Interview already ended" });
    }

    // store answer
    session.history.push({
      question: session.currentQuestion,
      answer,
      feedback: null,
      score: null
    });

    // 🔥 CALL AI SERVICE (replace URL later)
    const aiResponse = await axios.post("http://localhost:5000/mock-ai/question", {
      history: session.history,
      lastAnswer: answer
    });

    const { nextQuestion, feedback, score } = aiResponse.data;

    // store hidden feedback
    const lastEntry = session.history[session.history.length - 1];
    lastEntry.feedback = feedback;
    lastEntry.score = score;

    // update current question
    session.currentQuestion = nextQuestion;

    // send ONLY question
    res.json({
      nextQuestion
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==============================
// END INTERVIEW
// ==============================
app.post("/api/interview/end", async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = sessions[sessionId];

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status === "completed") {
      return res.json(session.result);
    }

    // 🔥 CALL AI FOR FINAL EVALUATION
    const aiResponse = await axios.post("http://localhost:5000/mock-ai/evaluate", {
      history: session.history
    });

    const result = {
      questionFeedback: session.history,
      overallFeedback: aiResponse.data.overallFeedback,
      finalScore: aiResponse.data.finalScore
    };

    session.status = "completed";
    session.result = result;

    res.json(result);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==============================
// MOCK AI (REMOVE LATER)
// ==============================

// Generate next question + feedback
app.post("/mock-ai/question", (req, res) => {
  res.json({
    nextQuestion: "Explain time complexity of binary search",
    feedback: "Good attempt but explanation lacked clarity",
    score: 6
  });
});

// Final evaluation
app.post("/mock-ai/evaluate", (req, res) => {
  res.json({
    overallFeedback: "You have decent fundamentals but need more clarity in concepts.",
    finalScore: 7
  });
});

// ==============================
// START SERVER
// ==============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});