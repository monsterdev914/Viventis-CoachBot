import { Avatar, Button, Card, CardBody, CardHeader, Checkbox, Input, Link, Textarea } from "@heroui/react";
import { ClockIcon, EmailIcon, InstagramIcon, LinkedInIcon, MapPinIcon, PhoneIcon, XIcon } from "./icons";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

const ContactUs = () => {
    const { t } = useTranslation();
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
            setStatus({ type: 'error', message: t('contact.fillRequiredFields') });
            return;
        }

        if (!isAgreed) {
            setStatus({ type: 'error', message: t('contact.agreeToPrivacy') });
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
                setStatus({ type: 'success', message: t('contact.successMessage') });
                setFormData({ name: '', email: '', phone: '', message: '' });
                setIsAgreed(false);
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            setStatus({ type: 'error', message: t('contact.errorMessage') });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <section className="relative flex flex-col w-full bg-white" id="contact">
            <div className="bg-color pt-[120px] pb-[200px] w-full flex flex-col items-center relative">
                {/* Banner */}
                <div className="w-full h-full bg-center bg-[length:65%_auto] opacity-[0.15] absolute top-0 left-0 filter brightness-50" style={{ backgroundImage: "url('/images/grid-banner.svg')" }}></div>
                <div className="container mx-auto max-w-7xl flex flex-col gap-[60px] items-center px-4">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-[32px] font-bold">{t('contact.title')}</h1>
                        <p className="text-[18px] text-white text-center max-w-[800px]">
                            {t('contact.subtitle')}
                        </p>
                    </div>
                </div>
            </div>
            <div className="container mx-auto max-w-7xl pt-16 flex flex-col lg:flex-row gap-[60px] px-4 pb-16">
                <div className="flex flex-col gap-4 flex-1">
                    <Card className="w-full py-10 px-6 py-10 transform -translate-y-40">
                        <CardHeader className="w-full">
                            <h1 className="text-2xl font-bold">{t('contact.formTitle')}</h1>
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
                                    label={`${t('contact.name')} *`}
                                    placeholder={t('contact.namePlaceholder')}
                                    className="w-full"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    isRequired
                                />
                                <Input 
                                    label={`${t('contact.email')} *`}
                                    placeholder={t('contact.emailPlaceholder')}
                                    type="email"
                                    className="w-full"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    isRequired
                                />
                                <Input 
                                    label={t('contact.phone')}
                                    placeholder={t('contact.phonePlaceholder')}
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
                                    label={`${t('contact.message')} *`}
                                    placeholder={t('contact.messagePlaceholder')}
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
                                        {t('contact.privacyAgreement', {
                                            privacyLink: <Link href="/datenschutz" className="text-black underline">{t('contact.privacyPolicy')}</Link>
                                        })} *
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
                                    <span className="font-bold md:text-[18px] text-[14px]">
                                        {isLoading ? t('contact.sending') : t('contact.sendButton')}
                                    </span>
                                </Button>
                            </form>
                        </CardBody>
                    </Card>
                </div>
                <div className="flex flex-col gap-10 w-full flex-1 flex-1 px-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[32px] font-bold text-[#032e26]">{t('contact.howToReachMe')}</h1>
                        <p className="text-sm text-gray-500">
                            {t('contact.howToReachMeDesc')}
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
                                        <h4 className="text-[18px] font-semibold leading-none text-default-600">{t('contact.office')}</h4>
                                        <p className="text-[14px] tracking-tight text-default-400">{t('contact.officeAddress')}</p>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="w-full p-[15px]">
                                <CardBody className="flex flex-row gap-4 w-full">
                                    <div className="flex items-center justify-center bg-[#d8f4e5] h-12 w-12 rounded-full p-2">
                                        <PhoneIcon size={24} color="#000" />
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-[18px] font-semibold leading-none text-default-600">{t('contact.phone2')}</h4>
                                        <p className="text-[14px] tracking-tight text-default-400">+41 79 XXX XX XX</p>
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
                                        <h4 className="text-[18px] font-semibold leading-none text-default-600">{t('contact.email2')}</h4>
                                        <p className="text-[14px] tracking-tight text-default-400">info@viventis.net</p>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="w-full p-[15px]">
                                <CardBody className="flex flex-row gap-4 w-full">
                                    <div className="flex items-center justify-center bg-[#d8f4e5] h-12 w-12 rounded-full p-2">
                                        <ClockIcon size={24} color="#000" />
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-[18px] font-semibold leading-none text-default-600">{t('contact.workingHours')}</h4>
                                        <p className="text-[14px] tracking-tight text-default-400">
                                            {t('contact.mondayFriday')}<br />
                                            {t('contact.timeRange')}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <h1 className="text-[32px] font-bold text-[#032e26]">{t('contact.followUs')}</h1>
                        <div className="flex flex-row gap-4 w-full">
                            <Card className="w-full p-[15px]">
                                <CardBody className="flex flex-row gap-4 w-full">
                                    <div className="flex items-center justify-center bg-[#d8f4e5] h-12 w-12 rounded-full p-2">
                                        <InstagramIcon size={24} color="#000" />
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-[18px] font-semibold leading-none text-default-600">Instagram</h4>
                                        <p className="text-[14px] tracking-tight text-default-400">@viventis</p>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="w-full p-[15px]">
                                <CardBody className="flex flex-row gap-4 w-full">
                                    <div className="flex items-center justify-center bg-[#d8f4e5] h-12 w-12 rounded-full p-2">
                                        <LinkedInIcon size={24} color="#000" />
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-[18px] font-semibold leading-none text-default-600">LinkedIn</h4>
                                        <p className="text-[14px] tracking-tight text-default-400">@viventis</p>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactUs;