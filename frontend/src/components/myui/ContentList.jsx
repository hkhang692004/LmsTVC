import React from "react";
import ContentSection from "./ContentSection";
import ExamSection from "./ExamSection";

const ContentList = ({ myClass }) => {
    const chuDes = myClass?.chuDes || [];
    const classId = myClass?.id;

    if (!chuDes.length) {
        return <p className="text-gray-500 text-center py-8">Chưa có nội dung</p>;
    }

    return (
        <div className="space-y-6">
            {/* Các chủ đề thông thường */}
            {chuDes.map(chuDe => (
                <ContentSection
                    key={chuDe.id}
                    title={chuDe.tenChuDe}
                    items={chuDe.noiDungs || []}
                />
            ))}

            {/* Section Bài kiểm tra riêng */}
            {classId && <ExamSection classId={classId} />}
        </div>
    );
};

export default ContentList;
