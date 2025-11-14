import React, { useEffect, useState } from 'react'

const Header = () => {
    const [isScroll, setIsScroll] = useState(false);
    const handleScroll = () => {
        const scrolled = window.scrollY;
        setIsScroll(scrolled > 100);
    }
    useEffect(() => {
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => removeEventListener("scroll", handleScroll);
    })
    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all ease-linear ${isScroll ? " py-2" : "py-2"}`}>
            <div className="flex items-center  max-w-5xl mx-auto ">
                <a href="/" className="block w-fit">
                    <img
                        src="TVCLogo.webp"
                        alt="Logo"
                        className={`${isScroll ? "h-15" : "h-25"} w-auto`}
                    />
                </a>
                <div className="flex flex-col items-center  leading-tight">
                    <h2 className={`${isScroll ? "text-xl " : "text-3xl "}  text-white font-bold`}>Trường Cao Đẳng Nghề Trà Vinh</h2>
                    <p className={`${isScroll ? "text-x " : " text-xl "} text-white `} >
                        TraVinh Vocational College
                    </p>
                    <p className={`${isScroll ? "text-xs  text-white" : "text-white  "} `}>
                        Thạo nghề - Vững nghiệp - Chắc tương lai
                    </p>
                </div>
            </div>
        </header>

    )
}

export default Header
