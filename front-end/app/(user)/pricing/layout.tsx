import Image from 'next/image';

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen flex-col w-full items-center justify-center gap-4 py-8 md:py-10 relative">
      {/* Background image */}
      <div className="absolute inset-0 z-10">
        <Image src="/images/bg-img.png" alt="Background" fill className="object-cover bg-cover bg-center opacity-10 -translate-y-[200px]" />
      </div>
      <div className="inline-block text-center justify-center">
        {children}
      </div>
      {/* Add some extra space at the bottom */}
      <div className="h-24"></div>
    </section>
  );
}
