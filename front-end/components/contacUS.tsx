import { Avatar, Button, Card, CardBody, CardHeader, Checkbox, Input, Link, Textarea } from "@heroui/react";
import { ClockIcon, EmailIcon, InstagramIcon, LinkedInIcon, MapPinIcon, PhoneIcon, XIcon } from "./icons";

const ContactUs = () => {
    return (
        <section className="relative flex flex-col w-full bg-white" id="contact">
            <div className="bg-color pt-[120px] pb-[200px] w-full flex flex-col items-center relative">
                {/* Banner */}
                <div className="w-full h-full bg-center bg-[length:65%_auto] opacity-[0.15] absolute top-0 left-0 filter brightness-50" style={{ backgroundImage: "url('/images/grid-banner.svg')" }}></div>
                <div className="container mx-auto max-w-7xl flex flex-col gap-[60px] items-center">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-[32px] font-bold">Bereit für mehr Klarheit?</h1>
                        <p className="text-[18px] text-white text-center max-w-[800px]">
                            Starte jetzt kostenlos.
                            <br />
                            Spüre, wie sich echte Orientierung anfühlt.
                        </p>
                    </div>
                </div>
            </div>
            <div className="container mx-auto max-w-7xl pt-16 flex flex-col md:flex-row gap-[60px] px-4">
                <div className="flex flex-col gap-4 flex-1">
                    <Card className="w-full py-10 px-6 py-10 transform -translate-y-40">
                        <CardHeader className="w-full">
                            <h1 className="text-2xl font-bold">Kontaktformular</h1>
                        </CardHeader>
                        <CardBody className="flex flex-col gap-4 w-full">
                            <Input label="Name" placeholder="Name" className="w-full" />
                            <Input label="Email" placeholder="Email" className="w-full" />
                            <Input label="Telefon" placeholder="Telefon" className="w-full" />
                            <Textarea label="Nachricht" placeholder="Nachricht" className="w-full" />
                            <div className="flex items-center gap-2 w-full">
                                <Checkbox color="primary" />
                                <span className="text-sm">Ich stimme den Datenschutzbestimmungen zu</span>
                            </div>
                            <Button color="primary" variant="solid" radius="full" className="w-full text-[18px] py-6 px-8 bg-[#032e26] text-white"><span className="font-bold">Kostenloses Erstgespräch vereinbaren</span></Button>
                        </CardBody>
                    </Card>
                </div>
                <div className="flex flex-col gap-10 w-full flex-1 flex-1 px-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[32px] font-bold text-[#032e26]">So erreichst Du mich</h1>
                        <p className="text-sm text-gray-500">
                            Du hast Fragen rund um den Kompass, Leadership und Business-Modelle? Gerne stehe ich Dir in jeder Phase zur Seite!
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-row gap-4 w-full">
                            <Card className="w-full p-[15px]">
                                <CardBody className="flex flex-row gap-4 w-full">
                                    <div className="flex items-center justify-center bg-[#d8f4e5] h-12 w-12 rounded-full p-2">
                                        <MapPinIcon size={24} color="#000" />
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-[18px] font-semibold leading-none text-default-600">Büro</h4>
                                        <p className="text-[14px] tracking-tight text-default-400">Tigelbergstrasse <br></br>9442 Berneck CH</p>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="w-full p-[15px]">
                                <CardBody className="flex flex-row gap-4 w-full">
                                    <div className="flex items-center justify-center bg-[#d8f4e5] h-12 w-12 rounded-full p-2">
                                        <PhoneIcon size={24} color="#000" />
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-[18px] font-semibold leading-none text-default-600">Telefon</h4>
                                        <p className="text-[14px] tracking-tight text-default-400">+41 79 250 10 40</p>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                        <div className="flex flex-row gap-4 w-full">
                            <Card className="w-full p-[15px]">
                                <CardBody className="flex flex-row gap-4 w-full">
                                    <div className="flex items-center justify-center bg-[#d8f4e5] h-12 w-12 rounded-full p-2">
                                        <EmailIcon size={24} color="#000" />
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-[18px] font-semibold leading-none text-default-600">Email</h4>
                                        <p className="text-[14px] tracking-tight text-default-400">info@der-innere-kompass.com</p>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="w-full p-[15px]">
                                <CardBody className="flex flex-row gap-4 w-full">
                                    <div className="flex items-center justify-center bg-[#d8f4e5] h-12 w-12 rounded-full p-2">
                                        <ClockIcon size={24} color="#000" />
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-[18px] font-semibold leading-none text-default-600">Öffnungszeiten</h4>
                                        <p className="text-[14px] tracking-tight text-default-400">Täglich von 9 - 17 Uhr</p>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between w-full px-4">
                        <h3 className="text-lg font-bold">
                            Soziale Medien:
                        </h3>
                        <div className="flex flex-row gap-4 items-center">
                            <div>
                                <span className="text-[12px] text-white">
                                    <Link href="https://www.linkedin.com/in/johannes-kreis-3b1000190/">
                                        <Button color="default" variant="flat" isIconOnly radius="full" className="text-[12px] text-white">
                                            <LinkedInIcon size={16} color="#000" />
                                        </Button>
                                    </Link>
                                </span>
                            </div>
                            <div>
                                <span className="text-[12px] text-white">
                                    <Link href="https://www.instagram.com/johannes_kreis_/">
                                        <Button color="default" variant="flat" isIconOnly radius="full" className="text-[12px] text-white">
                                            <InstagramIcon size={16} color="#000" />
                                        </Button>
                                    </Link>
                                </span>
                            </div>
                            <div>
                                <span className="text-[12px] text-white">
                                    <Link href="https://x.com/johannes_kreis_">
                                        <Button color="default" variant="flat" isIconOnly radius="full" className="text-[12px] text-white">
                                            <XIcon size={16} color="#000" />
                                        </Button>
                                    </Link>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactUs;