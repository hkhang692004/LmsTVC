import React from "react";
import ContentSection from "./ContentSection";
import mockSections from "@/mocks/mockSections";



const ContentList = ({courseName}) => {
    return (
        <div className="space-y-6">
            {mockSections.map(section => (
                <ContentSection
                    key={section.id}
                    title={section.title}
                    items={section.items}
                    courseName={courseName}
                />
            ))}
        </div>
    );
};

export default ContentList;
