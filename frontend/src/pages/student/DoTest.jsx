import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MyHeader from '@/components/myui/MyHeader';
import MyFooter from '@/components/myui/MyFooter';
import ScrollToTop from '@/components/myui/ScrollToTop';

const DoTest = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const testName = location.state?.testName;
    const cauHoi = location.state?.cauHoi || [];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
    const [showModal, setShowModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [totalScore, setTotalScore] = useState(0);

    const question = cauHoi[currentQuestion];

    const unansweredCount = cauHoi.filter((q) => !answers[q.id]).length;

    const handleSelectAnswer = (questionId, answerId) => {
        setAnswers({
            ...answers,
            [questionId]: answerId,
        });
    };

    const handleNext = () => {
        if (currentQuestion < cauHoi.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleGoToQuestion = (index) => {
        setCurrentQuestion(index);
    };

    const handleClearChoice = () => {
        const newAnswers = { ...answers };
        delete newAnswers[question.id];
        setAnswers(newAnswers);
    };

    const handleToggleFlag = () => {
        const newFlags = new Set(flaggedQuestions);
        if (newFlags.has(question.id)) {
            newFlags.delete(question.id);
        } else {
            newFlags.add(question.id);
        }
        setFlaggedQuestions(newFlags);
    };

    const handleSubmit = () => {
        setShowModal(true);
    };

    // ✔ Modal xác nhận → tính điểm → mở modal kết quả
    const confirmSubmit = () => {
        let total = 0;

        cauHoi.forEach((question) => {
            const selectedAnswer = answers[question.id];
            const correctAnswer = question.luaChon.find((o) => o.laDapAnDung);
            if (selectedAnswer === correctAnswer?.id) {
                total += question.diemDatDuoc;
            }
        });

        setTotalScore(total);
        setShowModal(false);
        setShowResultModal(true);
    };

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Không có câu hỏi nào!</p>
            </div>
        );
    }

    return (
        <>
            <MyHeader />

            <div className="pt-20 pb-10 px-4 lg:px-10 min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="bg-blue-500 text-white p-6 rounded-t-lg flex items-center space-x-4">
                        <div className="bg-white p-3 rounded">
                            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path
                                    fillRule="evenodd"
                                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm opacity-90">TRẮC NGHIỆM</p>
                            <h1 className="text-2xl font-bold">{testName}</h1>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* LEFT SIDEBAR */}
                        <div className="lg:w-1/4">
                            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-20">

                                <div className="border rounded-lg p-3 mb-4 text-sm">
                                    <div className="font-semibold mb-2">Câu hỏi {currentQuestion + 1}</div>
                                    <div className="text-gray-600 mb-1">
                                        {answers[question.id] ? 'Đã trả lời' : 'Chưa trả lời'}
                                    </div>
                                    <div className="text-gray-600">Đạt điểm {question.diemDatDuoc}</div>
                                    <button
                                        onClick={handleToggleFlag}
                                        className={`mt-2 text-sm flex items-center gap-1 ${flaggedQuestions.has(question.id)
                                            ? 'text-red-700'
                                            : 'text-blue-600 hover:underline'
                                            }`}
                                    >
                                        <span className="mr-1">
                                            {flaggedQuestions.has(question.id) ? '🚩' : '🏴'}
                                        </span>
                                        {flaggedQuestions.has(question.id) ? 'Bỏ cờ' : 'Đặt cờ'}
                                    </button>
                                </div>

                                <hr className="my-4" />

                                <div className="grid grid-cols-5 gap-2">
                                    {cauHoi.map((q, idx) => (
                                        <button
                                            key={q.id}
                                            onClick={() => handleGoToQuestion(idx)}
                                            className={`relative w-10 h-10 rounded font-semibold transition text-sm
    ${idx === currentQuestion ? 'border-2 border-gray-800' : 'border-2 border-gray-200'}
    ${answers[q.id] ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300 hover:bg-gray-100'}
    ${flaggedQuestions.has(q.id) ? 'button-flagged' : ''}
  `}
                                        >
                                            {idx + 1}
                                        </button>


                                    ))}
                                </div>

                                <div className="mt-4 text-center">
                                    <button onClick={handleSubmit} className="text-blue-600 hover:underline text-sm">
                                        Làm xong ...
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* QUESTION CONTENT */}
                        <div className="lg:w-3/4 bg-white rounded-lg shadow-lg mt-15">

                            <div className="p-6">
                                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                                    <p className="text-gray-800 leading-relaxed">{question.noiDung}</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {question.luaChon
                                        .sort((a, b) => a.thuTu - b.thuTu)
                                        .map((option, idx) => (
                                            <label key={option.id} className="flex items-start cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    checked={answers[question.id] === option.id}
                                                    onChange={() => handleSelectAnswer(question.id, option.id)}
                                                    className="mr-2 mt-1.5"
                                                />
                                                <span className="mr-2 font-semibold">{String.fromCharCode(97 + idx)}.</span>
                                                <span className="group-hover:text-blue-600">{option.noiDung}</span>
                                            </label>
                                        ))}
                                </div>

                                {answers[question.id] && (
                                    <div className="mb-6">
                                        <button
                                            onClick={handleClearChoice}
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            Bỏ lựa chọn
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentQuestion === 0}
                                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Trang trước
                                    </button>

                                    {currentQuestion < cauHoi.length - 1 ? (
                                        <button
                                            onClick={handleNext}
                                            className="px-6 py-2 bg-blue-500 hover:bg-orange-500 text-white rounded"
                                        >
                                            Trang tiếp
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            className="px-6 py-2 bg-blue-500 hover:bg-orange-500 text-white rounded font-semibold"
                                        >
                                            Nộp bài
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* 🔵 MODAL XÁC NHẬN NỘP BÀI */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">

                        <h3 className="text-lg font-semibold mb-3">Nộp bài và kết thúc?</h3>

                        <p className="text-gray-700 mb-4">
                            Sau khi nộp bài, bạn sẽ không thể thay đổi đáp án nữa.
                        </p>

                        {unansweredCount > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
                                <p className="text-orange-800 text-sm">
                                    Số câu chưa trả lời: {unansweredCount}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmSubmit}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                            >
                                Nộp bài
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/*  MODAL KẾT QUẢ */}
            {showResultModal && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeIn">

                        <h3 className="text-xl font-bold text-center text-blue-500 mb-3">
                            Nộp bài thành công!
                        </h3>

                        <p className="text-center text-gray-700 mb-2">
                            Điểm số của bạn:
                        </p>

                        <div className="text-center text-3xl  text-gray-700 mb-6">
                            {totalScore}/10
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() =>
                                    navigate(-1, {
                                        state: {
                                            tongDiem: totalScore,
                                            trangThai: 'da-nop',
                                        },
                                    })
                                }
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                            >
                                Trở về trang kiểm tra
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ScrollToTop />
            <MyFooter />
        </>
    );
};

export default DoTest;
