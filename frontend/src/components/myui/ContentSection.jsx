import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import ContentItem from "./ContentItem";


const ContentSection = ({ title, items }) => {
    const [open, setOpen] = useState(true);

    return (
        <div className="border rounded-lg bg-white shadow-sm">

            {/* Header */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-5"
            >
                <div className="flex items-center gap-3">

                    {/* Icon xoay mượt */}
                    <Motion.div
                        animate={{ rotate: open ? 0 : -90 }}
                        transition={{ duration: 0.25 }}
                    >
                        <ChevronDown />
                    </Motion.div>

                    <span className="text-2xl text-gray-700 font-bold">
                        {title}
                    </span>
                </div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence initial={false}>
                {open && (
                    <Motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pb-2">
                            {items.length === 0 ? (
                                <p className="px-4 py-2 text-gray-400 text-sm">
                                    Không có nội dung
                                </p>
                            ) : (
                                items.map((item) => (
                                    <ContentItem key={item.id} item={item} />
                                ))
                            )}
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ContentSection;
