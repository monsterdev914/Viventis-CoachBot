import Image from "next/image";
import { useTranslation } from 'react-i18next';

const HowToWork = () => {
    const { t } = useTranslation();
    
    return (
        <section className="min-h-screen bg-[#FFFFFF] py-[75px] w-full" id="how-to-work">
            <div className="flex flex-col gap-10 max-w-7xl mx-auto px-4">
                <div className="flex flex-col gap-4 w-full px-4 md:px-[100px] items-center justify-center">
                    <div className="text-[16px] text-white bg-[#3bcc91] px-4 py-2 text-center items-center justify-center rounded-full w-fit">{t('howToWork.badge')}</div>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[32px] md:text-[48px] font-bold text-[#032e26]">{t('howToWork.title')}</h1>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full px-4 md:px-[100px]">
                    <div className="flex flex-col gap-12 w-full items-center justify-center border-b-1 border-[#878b9940] pb-8 hover:border-[#878b99] transition-all duration-300">
                        <Image src="https://s.w.org/images/core/emoji/15.1.0/svg/1f9ed.svg" alt="How to work" width={30} height={30} />
                        <h2 className="text-[18px] md:text-[22px] font-bold text-[#032e26]">{t('howToWork.feature1')}</h2>
                    </div>
                    <div className="flex flex-col gap-12 w-full items-center justify-center border-b-1 border-[#878b9940] pb-8 hover:border-[#878b99] transition-all duration-300">
                        <Image src="https://s.w.org/images/core/emoji/15.1.0/svg/1f4cd.svg" alt="How to work" width={30} height={30} />
                        <h2 className="text-[18px] md:text-[22px] font-bold text-[#032e26]">{t('howToWork.feature2')}</h2>
                    </div>
                    <div className="flex flex-col gap-12 w-full items-center justify-center border-b-1 border-[#878b9940] pb-8 hover:border-[#878b99] transition-all duration-300">
                        <Image src="https://s.w.org/images/core/emoji/15.1.0/svg/1f4ac.svg" alt="How to work" width={30} height={30} />
                        <h2 className="text-[18px] md:text-[22px] font-bold text-[#032e26]">{t('howToWork.feature3')}</h2>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full px-4 md:px-[100px]">
                    <div className="flex flex-col gap-4 w-full">
                        <ul className="relative ml-2 py-2">
                            {/* Vertical line as background */}
                            <span className="absolute left-3 top-4 bottom-4 w-px bg-[#032e26] z-0"></span>
                            {[
                                t('howToWork.step1'),
                                t('howToWork.step2'),
                                t('howToWork.step3'),
                                t('howToWork.step4')
                            ].map((text, idx) => (
                                <li key={idx} className="relative pl-10 mb-10 last:mb-0 flex items-center z-10">
                                    {/* Dot */}
                                    <span className="absolute left-0 top-0 translate-y-1 w-6 h-6 rounded-full border-2 border-[#032e26] bg-white"></span>
                                    {/* Text */}
                                    <span className="font-bold text-[22px] text-[#032e26]">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <p className="text-[16px] text-black text-justify">
                            {t('howToWork.description1')}
                        </p>
                        <p className="text-[16px] text-black text-justify">
                            {t('howToWork.description2')}
                        </p>
                        <ul className="list-disc list-inside text-[16px] pl-4 text-black text-justify">
                            <li className="list-disc list-inside">
                                {t('howToWork.accompany1')}
                            </li>
                            <li className="list-disc list-inside">
                                {t('howToWork.accompany2')}
                            </li>
                            <li className="list-disc list-inside">
                                {t('howToWork.accompany3')}
                            </li>
                            <li className="list-disc list-inside">
                                {t('howToWork.accompany4')}
                            </li>
                        </ul>
                        <p className="text-[16px] text-black text-justify">
                            {t('howToWork.description3')}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-8 py-20 w-full px-4 md:px-[100px]">
                    <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="bg-color rounded-lg p-6 flex flex-col gap-2 justify-between items-center w-full">
                                <p className="text-center">
                                    {t('howToWork.compassDescription')}
                                </p>
                                <div className="w-[200px] h-[200px] flex items-center justify-center">
                                    <Image src="/images/avatar.jpg" alt="How to work" width={200} height={200} className="rounded-full w-[120px] h-[120px]" />
                                </div>
                                <div className="flex flex-col gap-2 items-center">
                                    <p className="text-center text-[16px]">
                                        <span className="">
                                            {t('howToWork.withExpert')}
                                        </span>
                                    </p>
                                    <p className="text-center text-[16px]">
                                        <span className="font-bold text-[16px]">
                                            {t('howToWork.expertName')}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex-1 md:min-h-[300px] min-h-[200px] md:min-w-[300px] w-full rounded-lg" style={{
                                backgroundImage: "url('/images/download.jpg')",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat"
                            }}>

                            </div>
                        </div>
                        <div className="flex-1 rounded-lg" style={{
                            backgroundImage: "url('/images/13.jpg')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat"
                        }}>

                            {/* <Image src="https://der-innere-kompass.com/wp-content/uploads/2025/01/13.jpg" alt="How to work" width={500} height={500} className="rounded-lg" /> */}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="text-[16px] text-white bg-[#3bcc91] px-4 py-2 text-center items-center justify-center rounded-full w-fit">{t('howToWork.badge')}</div>
                        <p className="text-[16px] text-black text-justify my-4">
                            {t('howToWork.coachBotDescription', { innerCompass: <b>{t('howToWork.innerCompass')}</b> })}
                        </p>
                        <table className="w-full mt-4 border border-gray-300 text-left text-[16px] text-black table-auto mb-4">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 font-bold text-center">{t('howToWork.compassCoordinate')}</th>
                                    <th className="border border-gray-300 px-4 py-2 font-bold text-center">{t('howToWork.effect')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-gray-100">
                                    <td className="border border-gray-300 px-4 py-2 font-bold">{t('howToWork.silence')}</td>
                                    <td className="border border-gray-300 px-4 py-2">{t('howToWork.silenceEffect')}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2 font-bold">{t('howToWork.grounding')}</td>
                                    <td className="border border-gray-300 px-4 py-2">{t('howToWork.groundingEffect')}</td>
                                </tr>
                                <tr className="bg-gray-100">
                                    <td className="border border-gray-300 px-4 py-2 font-bold">{t('howToWork.heart')}</td>
                                    <td className="border border-gray-300 px-4 py-2">{t('howToWork.heartEffect')}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2 font-bold">{t('howToWork.horizon')}</td>
                                    <td className="border border-gray-300 px-4 py-2">{t('howToWork.horizonEffect')}</td>
                                </tr>
                                <tr className="bg-gray-100">
                                    <td className="border border-gray-300 px-4 py-2 font-bold">{t('howToWork.flow')}</td>
                                    <td className="border border-gray-300 px-4 py-2">{t('howToWork.flowEffect')}</td>
                                </tr>
                            </tbody>
                        </table>
                        &nbsp;
                        <p className="mt-4 text-[16px] text-black">
                            {t('howToWork.conclusion', { boldText: <b>{t('howToWork.boldText')}</b> })}
                        </p>
                        &nbsp;
                        &nbsp;
                        <hr className="border-gray-300" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HowToWork;