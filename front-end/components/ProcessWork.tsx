import { useTranslation } from 'react-i18next';

const ProcessWork = () => {
    const { t } = useTranslation();
    
    return (
        <div className="bg-white w-full pb-20">
            {/* Left side: Title and subtitle */}
            <div className="flex flex-col md:flex-row justify-center items-start w-full mt-16 max-w-7xl mx-auto px-4 gap-16">
                <div className="flex-1">
                    <h1 className="md:text-[48px] text-[32px] font-bold text-[#032e26] leading-tight">
                        {t('processWork.title')}
                    </h1>
                    <p className="mt-4 text-[18px] text-[#032e26]">{t('processWork.subtitle')}</p>
                </div>
                {/* Right side: Stepper */}
                <div className="flex-1 flex flex-col items-start">
                    <ul className="relative ml-2 py-2">
                        {[
                            {
                                title: t('processWork.step1Title'),
                                desc: t('processWork.step1Desc')
                            },
                            {
                                title: t('processWork.step2Title'),
                                desc: t('processWork.step2Desc')
                            },
                            {
                                title: t('processWork.step3Title'),
                                desc: t('processWork.step3Desc')
                            },
                            {
                                title: t('processWork.step4Title'),
                                desc: t('processWork.step4Desc')
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