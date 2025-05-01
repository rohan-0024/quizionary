import React, { useState, useEffect } from "react";
import quizData from "./quizData";
import "./App.css";

const avatars = ["🦁", "🐼", "🦉", "🐧", "🐸", "🦊", "🐨", "🐱"];

// Define achievements
const achievements = [
  {
    id: "first_quiz",
    title: "First Steps",
    description: "Complete your first quiz",
    icon: "🎓",
    condition: (stats) => stats.quizzesCompleted >= 1,
  },
  {
    id: "perfect_score",
    title: "Perfect!",
    description: "Get a perfect score on any quiz",
    icon: "🏆",
    condition: (stats) => stats.perfectScores >= 1,
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Answer 5 questions with more than 10 seconds remaining",
    icon: "⚡",
    condition: (stats) => stats.fastAnswers >= 5,
  },
  {
    id: "no_hint",
    title: "Self Reliant",
    description: "Complete a quiz without using any hints",
    icon: "💪",
    condition: (stats) => stats.noHintQuizzes >= 1,
  },
  {
    id: "streak_3",
    title: "On Fire!",
    description: "Get a streak of 3 correct answers",
    icon: "🔥",
    condition: (stats) => stats.highestStreak >= 3,
  },
  {
    id: "master",
    title: "Quiz Master",
    description: "Complete 5 quizzes",
    icon: "👑",
    condition: (stats) => stats.quizzesCompleted >= 5,
  },
  {
    id: "comeback",
    title: "Comeback Kid",
    description: "Answer correctly after 2 wrong answers",
    icon: "🔄",
    condition: (stats) => stats.comebacks >= 1,
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Complete a quiz in dark mode",
    icon: "🌙",
    condition: (stats) => stats.darkModeQuizzes >= 1,
  }
];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function App() {
  // User Profile
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || avatars[0]);
  const [profileSet, setProfileSet] = useState(!!username);

  // Theme
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  // Quiz State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [timer, setTimer] = useState(15);
  const [userAnswers, setUserAnswers] = useState([]);

  // Achievements System
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem("quizStats");
    return savedStats ? JSON.parse(savedStats) : {
      quizzesCompleted: 0,
      perfectScores: 0,
      fastAnswers: 0,
      noHintQuizzes: 0,
      highestStreak: 0,
      currentStreak: 0,
      comebacks: 0,
      darkModeQuizzes: 0,
      wrongStreak: 0,
    };
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    const saved = localStorage.getItem("achievements");
    return saved ? JSON.parse(saved) : [];
  });

  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [showAchievements, setShowAchievements] = useState(false);

  // Check for newly unlocked achievements
  useEffect(() => {
    const checkAchievements = () => {
      let newUnlocked = false;

      achievements.forEach(achievement => {
        if (
          !unlockedAchievements.includes(achievement.id) &&
          achievement.condition(stats)
        ) {
          setUnlockedAchievements(prev => [...prev, achievement.id]);
          setNewAchievement(achievement);
          setShowAchievementModal(true);
          newUnlocked = true;
        }
      });

      if (newUnlocked) {
        localStorage.setItem("achievements", JSON.stringify(unlockedAchievements));
      }
    };

    checkAchievements();
  }, [stats, unlockedAchievements]);

  // Save stats when they change
  useEffect(() => {
    localStorage.setItem("quizStats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    setQuestions(shuffle([...quizData]));
  }, []);

  useEffect(() => {
    if (showScore || !profileSet) return;
    if (timer === 0) {
      handleAnswer(null);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, showScore, profileSet]);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleProfile = () => {
    if (username.trim()) {
      setProfileSet(true);
      localStorage.setItem("username", username);
      localStorage.setItem("avatar", avatar);
    }
  };

  const handleAnswer = (option) => {
    setSelected(option);
    setShowFeedback(true);

    const correct = questions[currentIndex].answer;
    const isCorrect = option === correct;

    // Update stats for achievements
    const statsUpdates = { ...stats };

    // Track current streak
    if (isCorrect) {
      statsUpdates.currentStreak++;
      statsUpdates.wrongStreak = 0;

      // Update highest streak if needed
      if (statsUpdates.currentStreak > statsUpdates.highestStreak) {
        statsUpdates.highestStreak = statsUpdates.currentStreak;
      }

      // Check for fast answer
      if (timer > 10) {
        statsUpdates.fastAnswers++;
      }

      // Check for comeback
      if (statsUpdates.wrongStreak >= 2) {
        statsUpdates.comebacks++;
      }
    } else {
      statsUpdates.currentStreak = 0;
      statsUpdates.wrongStreak++;
    }

    setStats(statsUpdates);

    if (isCorrect) setScore((s) => s + 1);

    setUserAnswers([
      ...userAnswers,
      {
        ...questions[currentIndex],
        user: option,
        isCorrect: isCorrect,
        usedHint,
      },
    ]);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelected(null);
    setUsedHint(false);
    setTimer(15);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    // Update stats when quiz completes
    const newStats = { ...stats };
    newStats.quizzesCompleted++;

    // Perfect score achievement
    if (score === questions.length) {
      newStats.perfectScores++;
    }

    // No hint achievement
    const usedAnyHint = userAnswers.some(ans => ans.usedHint);
    if (!usedAnyHint) {
      newStats.noHintQuizzes++;
    }

    // Dark mode achievement
    if (darkMode) {
      newStats.darkModeQuizzes++;
    }

    setStats(newStats);
    setShowScore(true);
  };

  const handleHint = () => {
    setUsedHint(true);
  };

  const toggleTheme = () => setDarkMode((d) => !d);

  const getOptions = () => {
    const q = questions[currentIndex];
    if (!q) return [];

    // Return the correct options based on question type
    if (q.type === "mcq") {
      if (usedHint) {
        const correct = q.answer;
        const others = q.options.filter((o) => o !== correct);
        return shuffle([correct, others[0]]);
      }
      return q.options;
    } else if (q.type === "boolean") {
      // For true/false questions
      return ["True", "False"];
    }

    // Default case - return options if they exist or ["True", "False"]
    return q.options || ["True", "False"];
  };

  const restartQuiz = () => {
    setQuestions(shuffle([...quizData]));
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setShowScore(false);
    setShowFeedback(false);
    setUsedHint(false);
    setTimer(15);
    setUserAnswers([]);
  };

  const toggleAchievements = () => {
    setShowAchievements(!showAchievements);
  };

  if (!profileSet) {
    return (
      <div className="profile-setup">
        <h2>Welcome to Quiz Master!</h2>
        <div className="avatar-select">
          {avatars.map((a) => (
            <span
              key={a}
              className={`avatar ${avatar === a ? "selected" : ""}`}
              onClick={() => setAvatar(a)}
            >
              {a}
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={12}
        />
        <button onClick={handleProfile}>Start Quiz</button>
      </div>
    );
  }

  if (showAchievements) {
    return (
      <div className="quiz-container">
        <div className="user-bar">
          <span className="avatar">{avatar}</span>
          <span className="username">{username}</span>
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>

        <h1>Your Achievements</h1>

        <div className="achievements-grid">
          {achievements.map((achievement) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            return (
              <div key={achievement.id} className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">{isUnlocked ? achievement.icon : '🔒'}</div>
                <div className="achievement-info">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button className="back-button" onClick={toggleAchievements}>
          Back to Quiz
        </button>
      </div>
    );
  }

  if (showScore) {
    return (
      <div className="quiz-container">
        <div className="user-bar">
          <span className="avatar">{avatar}</span>
          <span className="username">{username}</span>
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>
        <h1>🎉 Quiz Complete!</h1>
        <div className="score-circle">
          {score} / {questions.length}
        </div>
        <h2>Summary</h2>
        <ul className="summary-list">
          {userAnswers.map((ans, i) => (
            <li key={i} className={ans.isCorrect ? "correct" : "incorrect"}>
              <strong>Q{i + 1}:</strong> {ans.question} <br />
              <span>
                Your answer: {ans.user ?? <em>No answer</em>}
              </span>
              <br />
              <span>Correct answer: {ans.answer}</span>
              <br />
              <span className="explanation">{ans.explanation}</span>
              {ans.usedHint && <span className="hint-used">Used 50/50</span>}
            </li>
          ))}
        </ul>
        <div className="action-buttons">
          <button className="restart-button" onClick={restartQuiz}>
            Play Again
          </button>
          <button className="achievement-button" onClick={toggleAchievements}>
            Achievements
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="quiz-container">
      {showAchievementModal && newAchievement && (
        <div className="achievement-modal">
          <div className="achievement-popup">
            <h3>Achievement Unlocked! 🎉</h3>
            <div className="achievement-icon large">{newAchievement.icon}</div>
            <h4>{newAchievement.title}</h4>
            <p>{newAchievement.description}</p>
            <button onClick={() => setShowAchievementModal(false)}>Continue</button>
          </div>
        </div>
      )}

      <div className="user-bar">
        <span className="avatar">{avatar}</span>
        <span className="username">{username}</span>
        <button className="achievements-icon" onClick={toggleAchievements} title="View Achievements">
          🏆
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? "🌞" : "🌙"}
        </button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="top-bar">
        <span>
          Question {currentIndex + 1} / {questions.length}
        </span>
        <span className={`timer ${timer <= 5 ? "danger" : ""}`}>{timer}s</span>
      </div>

      {q && (
        <>
          <div className="level-badge">Level {q.level || "1"}</div>
          <h2 className="question-text">{q.question || "Loading..."}</h2>

          <div className="options">
            {getOptions().map((option, idx) => (
              <button
                key={idx}
                className={`option-button ${selected === option
                    ? option === q.answer
                      ? "correct"
                      : "incorrect"
                    : ""
                  } ${showFeedback && option === q.answer ? "correct" : ""}`}
                onClick={() => !showFeedback && handleAnswer(option)}
                disabled={showFeedback}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="quiz-actions">
        <button
          className="hint-button"
          onClick={handleHint}
          disabled={usedHint || showFeedback || !q || q.type !== "mcq"}
        >
          50/50
        </button>
        {showFeedback && (
          <button className="next-button" onClick={handleNext}>
            {currentIndex === questions.length - 1 ? "Finish" : "Next →"}
          </button>
        )}
      </div>

      {showFeedback && q && (
        <div
          className={`feedback ${selected === q.answer ? "correct" : "incorrect"}`}
        >
          {selected === q.answer ? "✅ Correct!" : "❌ Wrong!"}
          <br />
          <span className="explanation">{q.explanation}</span>
        </div>
      )}
    </div>
  );
}

export default App;