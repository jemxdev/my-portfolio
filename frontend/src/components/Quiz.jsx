import { useState } from "react";
import "./Styles/Quiz.css";

export default function Quiz() {
    const [quizState, setQuizState] = useState({
        currentQuestion: 0,
        score: 0,
        highScore: localStorage.getItem("quizHighScore") || 0,
        selectedAnswer: null,
        answered: false,
    });

    const quizQuestions = [
        {
            question: "What does HTML stand for?",
            options: [
                "Hyper Text Markup Language",
                "High Tech Modern Language",
                "Home Tool Markup Language",
                "Hyperlinks and Text Markup Language",
            ],
            correct: 0,
        },
        {
            question: "Which CSS property controls text size?",
            options: ["font-style", "text-size", "font-size", "text-style"],
            correct: 2,
        },
        {
            question: "Which tag links a CSS file?",
            options: ["<style>", "<css>", "<script>", "<link>"],
            correct: 3,
        },
        {
            question: "Which language makes websites interactive?",
            options: ["HTML", "CSS", "JavaScript", "PHP"],
            correct: 2,
        },
        {
            question: "Which symbol selects class in CSS?",
            options: ["#", ".", "*", "$"],
            correct: 1,
        },
        {
            question: "Which HTML tag creates a hyperlink?",
            options: ["<link>", "<a>", "<href>", "<nav>"],
            correct: 1,
        },
        {
            question: "Which method selects element by ID in JS?",
            options: [
                "querySelectorAll",
                "getElementById",
                "getElementsByClass",
                "selectById",
            ],
            correct: 1,
        },
        {
            question: "Which HTML tag is used for inserting images?",
            options: ["<image>", "<img>", "<picture>", "<src>"],
            correct: 1,
        },
        {
            question: "Which CSS property changes background color?",
            options: ["bg-color", "background-color", "color-bg", "background-style"],
            correct: 1,
        },
        {
            question: "Which HTML tag creates a paragraph?",
            options: ["<text>", "<p>", "<para>", "<paragraph>"],
            correct: 1,
        },
        {
            question: "Which JavaScript keyword declares a variable?",
            options: ["var", "int", "string", "dim"],
            correct: 0,
        },
        {
            question: "Which CSS property makes text bold?",
            options: ["font-weight", "text-bold", "font-style", "weight"],
            correct: 0,
        },
        {
            question: "Which tag is used for unordered lists?",
            options: ["<ol>", "<ul>", "<li>", "<list>"],
            correct: 1,
        },
        {
            question: "Which HTML attribute specifies alternative image text?",
            options: ["title", "alt", "description", "src"],
            correct: 1,
        },
        {
            question: "Which JavaScript function prints to console?",
            options: ["console.log()", "print()", "echo()", "write()"],
            correct: 0,
        },
        {
            question: "Which CSS property controls element spacing inside borders?",
            options: ["margin", "padding", "spacing", "border-space"],
            correct: 1,
        },
        {
            question: "Which HTML tag defines table rows?",
            options: ["<td>", "<tr>", "<th>", "<table-row>"],
            correct: 1,
        },
        {
            question: "Which operator compares value AND type in JavaScript?",
            options: ["==", "=", "===", "!="],
            correct: 2,
        },
        {
            question: "Which CSS property rounds corners?",
            options: ["corner-radius", "border-round", "border-radius", "radius"],
            correct: 2,
        },
        {
            question: "Which HTTP status code means 'Not Found'?",
            options: ["200", "301", "404", "500"],
            correct: 2,
        },
        {
            question: "Which CSS pseudo-class targets hovered element?",
            options: [":hover", "::hover", ":active", "::active"],
            correct: 0,
        },
        {
            question: "Which CSS value removes element from normal flow but keeps position reference?",
            options: ["absolute", "relative", "fixed", "static"],
            correct: 0,
        },
        {
            question: "Which CSS property creates grid columns?",
            options: [
                "grid-template-columns",
                "grid-columns",
                "column-layout",
                "grid-col",
            ],
            correct: 0,
        },
        {
            question: "Which CSS unit is relative to root font size?",
            options: ["em", "rem", "%", "vh"],
            correct: 1,
        },
        {
            question: "Which CSS layout allows flexible row OR column alignment?",
            options: ["Grid", "Flexbox", "Float", "Position"],
            correct: 1,
        },
    ];

    const currentQuestion = quizQuestions[quizState.currentQuestion];

    const handleAnswerSelect = (index) => {
        if (!quizState.answered) {
            setQuizState((prev) => ({
                ...prev,
                selectedAnswer: index,
            }));
        }
    };

    const handleSubmitAnswer = () => {
        if (quizState.selectedAnswer === null) return;

        const isCorrect =
            quizState.selectedAnswer === currentQuestion.correct;
        const newScore = isCorrect ? quizState.score + 1 : quizState.score;

        setQuizState((prev) => ({
            ...prev,
            answered: true,
            score: newScore,
        }));
    };

    const handleNextQuestion = () => {
        if (quizState.currentQuestion < quizQuestions.length - 1) {
            setQuizState((prev) => ({
                ...prev,
                currentQuestion: prev.currentQuestion + 1,
                selectedAnswer: null,
                answered: false,
            }));
        } else {
            const finalScore = quizState.answered
                ? quizState.score +
                (quizState.selectedAnswer === currentQuestion.correct ? 1 : 0)
                : quizState.score;

            const newHighScore =
                finalScore > quizState.highScore ? finalScore : quizState.highScore;

            localStorage.setItem("quizHighScore", newHighScore);

            setQuizState((prev) => ({
                ...prev,
                highScore: newHighScore,
                currentQuestion: 0,
                selectedAnswer: null,
                answered: false,
                score: 0,
            }));
        }
    };

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <h2 className="quiz-question">{currentQuestion.question}</h2>
                <div className="quiz-score">
                    <span>Item</span>
                    <span className="quiz-progress">
            {quizState.currentQuestion + 1} / {quizQuestions.length}
          </span>
                    | Score: <span className="score-value">{quizState.score}</span>
                    | High Score: <span className="highscore-value">{quizState.highScore}</span>
                </div>
            </div>

            <div className="options">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        className={`option ${
                            quizState.selectedAnswer === index ? "selected" : ""
                        }`}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={quizState.answered}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {!quizState.answered ? (
                <button
                    className="submit-btn"
                    onClick={handleSubmitAnswer}
                    disabled={quizState.selectedAnswer === null}
                >
                    Submit Answer
                </button>
            ) : (
                <>
                    <div className="result">
                        {quizState.selectedAnswer === currentQuestion.correct ? (
                            <p style={{ color: "#4caf50", fontWeight: "bold" }}>
                                ✓ Correct!
                            </p>
                        ) : (
                            <p style={{ color: "#ff5059", fontWeight: "bold" }}>
                                ✗ Incorrect. The correct answer is:{" "}
                                {currentQuestion.options[currentQuestion.correct]}
                            </p>
                        )}
                    </div>
                    <button
                        className="submit-btn"
                        onClick={handleNextQuestion}
                        style={{ marginTop: "20px" }}
                    >
                        {quizState.currentQuestion === quizQuestions.length - 1
                            ? "Restart Quiz"
                            : "Next Question"}
                    </button>
                </>
            )}
        </div>
    );
}