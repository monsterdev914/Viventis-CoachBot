import { Avatar, Button, Card, CardBody, CardHeader, Checkbox, Input, Link, Textarea } from "@heroui/react";
import { ClockIcon, EmailIcon, InstagramIcon, LinkedInIcon, MapPinIcon, PhoneIcon, XIcon } from "./icons";
import { useState } from "react";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isAgreed, setIsAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            setStatus({ type: 'error', message: 'Bitte füllen Sie alle Pflichtfelder aus.' });
            return;
        }

        if (!isAgreed) {
            setStatus({ type: 'error', message: 'Bitte stimmen Sie den Datenschutzbestimmungen zu.' });
            return;
        }

        setIsLoading(true);
        setStatus({ type: null, message: '' });

        try {
            // Using Web3Forms as a free email service
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || 'demo-key',
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || 'Nicht angegeben',
                    message: formData.message,
                    subject: 'Neue Kontaktanfrage von info@viventis.net',
                    from_name: 'Der Innere Kompass Website',
                    to: process.env.NEXT_PUBLIC_WEB3FORMS_TO_EMAIL || 'info@viventis.net',
                    // Additional Web3Forms features
                    botcheck: false, // Honeypot spam protection
                    redirect: false, // Don't redirect after submission
                    // Custom fields for better email formatting
                    'h:Reply-To': formData.email,
                    'h:X-Mailer': 'Der Innere Kompass Contact Form'
                }),
            });

            if (response.ok) {
                setStatus({ type: 'success', message: 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.' });
                setFormData({ name: '', email: '', phone: '', message: '' });
                setIsAgreed(false);
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Entschuldigung, beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' });
        } finally {
            setIsLoading(false);
        }
    };
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
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                                {status.type && (
                                    <div className={`p-3 rounded-lg text-sm ${
                                        status.type === 'success' 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                        {status.message}
                                    </div>
                                )}
                                
                                <Input 
                                    label="Name *" 
                                    placeholder="Ihr vollständiger Name" 
                                    className="w-full"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    isRequired
                                />
                                <Input 
                                    label="Email *" 
                                    placeholder="ihre.email@beispiel.com" 
                                    type="email"
                                    className="w-full"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    isRequired
                                />
                                <Input 
                                    label="Telefon" 
                                    placeholder="+41 79 XXX XX XX" 
                                    type="tel"
                                    className="w-full"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                />
                                
                                {/* Honeypot field for spam protection - hidden from users */}
                                <input 
                                    type="text" 
                                    name="botcheck" 
                                    style={{ display: 'none' }} 
                                    tabIndex={-1} 
                                    autoComplete="off"
                                />
                                <Textarea 
                                    label="Nachricht *" 
                                    placeholder="Beschreiben Sie Ihr Anliegen..." 
                                    className="w-full"
                                    minRows={4}
                                    value={formData.message}
                                    onChange={(e) => handleInputChange('message', e.target.value)}
                                    isRequired
                                />
                                <div className="flex items-start gap-2 w-full">
                                    <Checkbox 
                                        color="primary" 
                                        isSelected={isAgreed}
                                        onValueChange={setIsAgreed}
                                    />
                                    <span className="text-sm">
                                        Ich stimme den <Link href="/datenschutz" className="text-black underline">Datenschutzbestimmungen</Link> zu und bin damit einverstanden, dass meine Daten zur Bearbeitung meiner Anfrage verwendet werden. *
                                    </span>
                                </div>
                                <Button 
                                    type="submit"
                                    color="primary" 
                                    variant="solid" 
                                    radius="full" 
                                    className="w-full text-[18px] py-6 px-8 bg-[#032e26] text-white"
                                    isLoading={isLoading}
                                    isDisabled={isLoading}
                                >
                                    <span className="font-bold">
                                        {isLoading ? 'Wird gesendet...' : 'Kostenloses Erstgespräch vereinbaren'}
                                    </span>
                                </Button>
                            </form>
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