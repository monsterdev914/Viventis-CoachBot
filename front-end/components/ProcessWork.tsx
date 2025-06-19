const ProcessWork = () => {
    return (
        <div className="bg-white w-full pb-20">
            {/* Left side: Title and subtitle */}
            <div className="flex flex-col md:flex-row justify-center items-start w-full mt-16 max-w-7xl mx-auto px-4 gap-16">
                <div className="flex-1">
                    <h1 className="text-[48px] font-bold text-[#032e26] leading-tight">
                        This is how the<br />registration process works
                    </h1>
                    <p className="mt-4 text-[18px] text-[#032e26]">How to sign up and get started</p>
                </div>
                {/* Right side: Stepper */}
                <div className="flex-1 flex flex-col items-start">
                    <ul className="relative ml-2 py-2">
                        {[
                            {
                                title: "Register",
                                desc: "Click on your desired subscription. You will be redirected to the secure registration page."
                            },
                            {
                                title: "Create user account",
                                desc: "Enter your name, email address, and a password. You can edit or delete your account at any time later."
                            },
                            {
                                title: "Choose payment",
                                desc: "Select your subscription and complete the payment process. Payment is encrypted and secure. You'll receive access immediately."
                            },
                            {
                                title: "Enjoy 7 × 24h coaching",
                                desc: "You can get started right away: Tell us what's on your mind – the bot will respond immediately. You'll receive questions, tools, and suggestions tailored to your situation."
                            }
                        ].map((step, idx, arr) => (
                            <li key={idx} className="relative pl-12 mb-12 last:mb-0 flex items-start z-10 min-h-[56px]">
                                {/* Dot, centered on the line */}
                                <span className="absolute left-2.5 w-6 h-6 rounded-full border-2 border-[#032e26] bg-white z-10"></span>
                                {/* Vertical line below the dot, except for the last item */}
                                {idx !== arr.length - 1 && (
                                    <span className="absolute left-5 w-px h-[calc(100%+1.5rem+28px)] bg-[#032e26] z-0"></span>
                                )}
                                {/* Step content */}
                                <div>
                                    <div className="font-bold text-[22px] text-[#032e26] leading-none">{step.title}</div>
                                    <div className="text-[16px] text-[#032e26] mt-1">{step.desc}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProcessWork; 