import React from "react";
import ContentSection from "./ContentSection";

const ContentList = ({ myClass }) => {
    const chuDes = myClass?.chuDes || [];

    if (!chuDes.length) {
        return <p className="text-gray-500 text-center py-8">Chưa có nội dung</p>;
    }

    return (
        <div className="space-y-6">
            {chuDes.map(chuDe => (
                <ContentSection
                    key={chuDe.id}
                    title={chuDe.ten}
                    items={chuDe.noiDungs || []}
                />
            ))}
        </div>
    );
};

export default ContentList;
