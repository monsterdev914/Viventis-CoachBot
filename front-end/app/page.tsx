'use client'
import { Link } from "@heroui/link";
import { useTranslation } from 'react-i18next';
import { button as buttonStyles } from "@heroui/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import Image from "next/image";
import "@/i18n"

export default function Home() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="flex flex-row justify-center items-center w-full">
        <div className="flex flex-col">
          <div className="inline-block max-w-xl justify-center">
            <span className={title()}>Make&nbsp;</span>
            <span className={title({ color: "violet" })}>beautiful&nbsp;</span>
            <br />
            <span className={title()}>
              websites regardless of your design experience.
            </span>
            <div className={subtitle({ class: "mt-4" })}>
              Beautiful, fast and modern React UI library.
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              isExternal
              className={buttonStyles({
                color: "primary",
                radius: "full"
              }) + " bg-gradient-primary hover:opacity-90 transition-opacity text-[black]"}
              href={siteConfig.links.docs}
            >
              {t('welcome')}
            </Link>
            <Link
              className={buttonStyles({
                variant: "bordered",
                radius: "full"
              }) + " hover:opacity-90 transition-opacity text-[white]"}
              href={"/auth/register"}
            >
              {t("get started")}
            </Link>
          </div>
        </div>
        <div className="flex flex-col">
          <div>
            <Image src="/images/bg-img.png" alt="bg-img" width={1000} height={1000} />
          </div>
          {/* <Image src="/images/bg-img.png" alt="bg-img" width={1000} height={1000} /> */}
        </div>
      </div>
    </section>
  );
}
