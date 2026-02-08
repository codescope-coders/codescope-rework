"use client";
import Image from "next/image";
import Container from "./Container";
import { useVariablesStore } from "@/stores/variables";

const socialLinks = [
  {
    name: "facebook",
    icon: "/footer/facebook.svg",
    onHoverIcon: "/footer/hoverFacebook.svg",
    link: "",
    hover: false,
  },
  {
    name: "ticktok",
    icon: "/footer/ticktok.svg",
    onHoverIcon: "/footer/hoverTickto.svg",
    link: "",
    hover: false,
  },
  {
    name: "youtube",
    icon: "/footer/youtube.svg",
    onHoverIcon: "/footer/hoverYoutube.svg",
    link: "",
    hover: false,
  },
  {
    name: "instagram",
    icon: "/footer/instagram.svg",
    onHoverIcon: "/footer/hoverInstagram.svg",
    link: "",
    hover: false,
  },
  {
    name: "whatsapp",
    icon: "/footer/whatsapp.svg",
    onHoverIcon: "/footer/hoverWhatsapp.svg",
    link: "",
    hover: false,
  },
];

export const Footer = () => {
  const { showContactUs } = useVariablesStore();

  return (
    <footer className="bg-secondary py-20">
      <Container>
        <div className="logo" dir="ltr">
          <Image
            src={"/footer/logo.png"}
            alt="Logo"
            width={460}
            height={100}
            style={{ width: "460px", height: "auto" }}
          />
        </div>

        <div
          className="group relative mt-10 cursor-pointer"
          onClick={showContactUs}
        >
          <Image
            src={"/footer/callToAction.svg"}
            width={500}
            height={500}
            style={{ width: "auto", height: "auto", zIndex: 1 }}
            alt="mainImage"
            className="relative rtl:hidden transition-[clip-path] duration-300 ease-out [clip-path:polygon(100%_0,0_0,0_100%,100%_100%)] group-hover:[clip-path:polygon(100%_0,100%_0,100%_100%,100%_100%)]"
          />
          <Image
            src={"/footer/altCallToAction.svg"}
            width={500}
            height={500}
            style={{ width: "auto", height: "auto", zIndex: 0 }}
            alt="altImage"
            className="absolute top-0 left-0 rtl:hidden transition-[clip-path] duration-300 ease-out group-hover:clip-[polygon(100%_0,100%_0,100%_100%,100%_100%)] clip-[polygon(100%_0,0_0,0_100%,100%_100%)]"
          />

          <Image
            src={"/footer/callToActionAr.svg"}
            width={500}
            height={500}
            style={{ width: "100%", height: "auto", zIndex: 1 }}
            alt="mainImageAr"
            className="relative ltr:hidden transition-[clip-path] duration-300 ease-out group-hover:[clip-path:polygon(0_0,0_0,0_100%,0_100%)] [clip-path:polygon(100%_0,0_0,0_100%,100%_100%)]"
          />
          <Image
            src={"/footer/altCallToActionAr.svg"}
            width={500}
            height={500}
            style={{ width: "100%", height: "auto", zIndex: 0 }}
            alt="altImageAr"
            className="absolute top-0 left-0 ltr:hidden transition-[clip-path] duration-300 ease-out group-hover:clip-[polygon(0_0,0_0,0_100%,0_100%)] clip-[polygon(100%_0,0_0,0_100%,100%_100%)]"
          />
        </div>

        <div
          className="contactLinks flex flex-col items-center gap-4 mt-10 justify-center md:flex-row md:justify-between"
          dir="ltr"
        >
          <div className="terms-conditions flex gap-10">
            {/* Terms & Conditions */}
          </div>
          <ul className="flex items-center gap-2" dir="ltr">
            {socialLinks.map((link, i) => (
              <li key={i} className="w-10 h-10 group">
                <a
                  href={link.link}
                  className="w-full h-full flex items-center justify-center cursor-pointer"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={link.icon}
                      alt={link.name}
                      className="absolute inset-0 w-full h-full transition-opacity duration-300 ease-out group-hover:opacity-0"
                      width={35}
                      height={35}
                    />
                    <Image
                      src={link.onHoverIcon}
                      alt={`${link.name}-hover`}
                      className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                      width={35}
                      height={35}
                    />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
};
