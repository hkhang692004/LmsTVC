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

    const question = cauHoi[currentQuestion];

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
        const unanswered = cauHoi.filter((q) => !answers[q.id]);

        if (unanswered.length > 0) {
            const confirm = window.confirm(
                `Bạn còn ${unanswered.length} câu chưa trả lời. Bạn có chắc muốn nộp bài?`
            );
            if (!confirm) return;
        }

        let totalScore = 0;
        cauHoi.forEach((question) => {
            const selectedAnswer = answers[question.id];
            const correctAnswer = question.luaChon.find((option) => option.laDapAnDung);
            if (selectedAnswer === correctAnswer?.id) {
                totalScore += question.diemDatDuoc;
            }
        });

        alert(`Bạn đã đạt ${totalScore} điểm!`);
        navigate("-1", {
            state: {
                tongDiem: totalScore,
                trangThai: 'da-nop',
                
            },
        });
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
                        {/* BẢNG CÂU HỎI - BÊN TRÁI */}
                        <div className="lg:w-1/4">
                            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-20">
                                {/* INFO BOX */}
                                <div className="border rounded-lg p-3 mb-4 text-sm">
                                    <div className="font-semibold mb-2">Câu hỏi {currentQuestion + 1}</div>
                                    <div className="text-gray-600 mb-1">
                                        {answers[question.id] ? 'Đã trả lời' : 'Chưa trả lời'}
                                    </div>
                                    <div className="text-gray-600">Đạt điểm {question.diemDatDuoc}</div>
                                    <button
                                        type="button"
                                        onClick={handleToggleFlag}
                                        className={`mt-2 text-sm flex items-center gap-1 ${flaggedQuestions.has(question.id)
                                            ? 'text-red-700'
                                            : 'text-blue-600 hover:underline'
                                            }`}
                                    >
                                        <span className="mr-1">{flaggedQuestions.has(question.id) ? '🚩' : '🏴'}</span>
                                        {flaggedQuestions.has(question.id) ? 'Bỏ cờ' : 'Đặt cờ'}
                                    </button>
                                </div>

                                <hr className="my-4" />

                                {/* GRID CÂU HỎI */}
                                <div className="grid grid-cols-5 gap-2">
                                    {cauHoi.map((q, idx) => (
                                        <button
                                            key={q.id}
                                            onClick={() => handleGoToQuestion(idx)}
                                            className={`w-10 h-10 rounded border-2 font-semibold transition text-sm ${idx === currentQuestion
                                                ? 'bg-gray-800 text-white border-gray-800'
                                                : flaggedQuestions.has(q.id)
                                                    ? 'bg-red-700 text-white border-red-700'
                                                    : answers[q.id]
                                                        ? 'bg-blue-500 text-white border-blue-500'
                                                        : 'bg-white border-gray-300 hover:bg-gray-100'
                                                }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>

                                {/* LINK LÀM XONG */}
                                <div className="mt-4 text-center">
                                    <button onClick={handleSubmit} className="text-blue-600 hover:underline text-sm">
                                        Làm xong ...
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* NỘI DUNG CÂU HỎI - BÊN PHẢI */}
                        <div className="lg:w-3/4 bg-white rounded-lg shadow-lg mt-15">
                            {/* NÚT QUAY LẠI */}


                            {/* NỘI DUNG CÂU HỎI */}
                            <div className="p-6">
                                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                                    <p className="text-gray-800 leading-relaxed">{question.noiDung}</p>
                                </div>

                                {/* CÁC LỰA CHỌN */}
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
                                                    className="mt-1 mr-3 w-4 h-4"
                                                />
                                                <span className="mr-2 font-semibold">{String.fromCharCode(97 + idx)}.</span>
                                                <span className="group-hover:text-blue-600">{option.noiDung}</span>
                                            </label>
                                        ))}
                                </div>

                                {/* LINK XÓA LỰA CHỌN */}
                                {answers[question.id] && (
                                    <div className="mb-6">
                                        <button onClick={handleClearChoice} className="text-blue-600 hover:underline text-sm">
                                            Bỏ lựa chọn
                                        </button>
                                    </div>
                                )}

                                {/* NÚT ĐIỀU HƯỚNG */}
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
            <ScrollToTop />
            <MyFooter />
        </>
    );
};

export default DoTest;
