"use client";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Button } from "./ui/button";
import { Languages, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useVariablesStore } from "@/stores/variables";

const links = [
  {
    name: "about",
    path: "/#about",
  },
  {
    name: "services",
    path: "/#services",
  },
  {
    name: "jobs",
    path: "/jobs",
  },
  {
    name: "tourscope",
    path: "/#tourscope",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { showContactUs } = useVariablesStore();
  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();

  const selectLang = (locale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };

  const handleLinkClick = () => {
    onClose();
  };

  const handleContactClick = () => {
    showContactUs();
    onClose();
  };

  const sidebarVariants: Variants = {
    closed: {
      x: locale === "ar" ? "-100%" : "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const overlayVariants: Variants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const listVariants: Variants = {
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    closed: {
      x: locale === "ar" ? -20 : 20,
      opacity: 0,
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={`fixed top-0 ${
              locale === "ar" ? "left-0" : "right-0"
            } h-full w-[85vw] max-w-sm bg-secondary z-50 shadow-2xl lg:hidden`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              <motion.nav
                variants={listVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="flex-1 overflow-y-auto py-6 px-4"
              >
                <ul className="space-y-2">
                  {links.map((link, i) => (
                    <motion.li key={i} variants={itemVariants}>
                      <Link
                        href={link.path}
                        onClick={handleLinkClick}
                        className="block"
                      >
                        <motion.div
                          whileHover={{
                            scale: 1.02,
                            x: locale === "ar" ? -5 : 5,
                          }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-3 rounded-lg text-white font-semibold text-lg hover:bg-white/10 transition-colors text-start"
                        >
                          {t(`links.${link.name}`)}
                        </motion.div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>

              {/* Footer Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                className="p-6 space-y-3 border-t border-white/10"
              >
                {/* Contact Button */}
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="secondary"
                    onClick={handleContactClick}
                    className="w-full font-semibold"
                  >
                    {t("links.contact")}
                  </Button>
                </motion.div>

                {/* Language Toggle */}
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    onClick={() => selectLang(locale === "en" ? "ar" : "en")}
                    disabled={isPending}
                    className="w-full text-white hover:bg-white/10 font-semibold"
                  >
                    <Languages className="w-5 h-5 mr-2" />
                    {locale === "en" ? "العربية" : "English"}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
