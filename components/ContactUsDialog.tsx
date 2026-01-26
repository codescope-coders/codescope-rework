"use client";
import React, { useRef, useEffect, useState, use } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useVariablesStore } from "@/stores/variables";
import { MapPin, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type LocationData = {
  phone: string;
  name: string;
  active: boolean;
  location: { lng: number; lat: number };
};

export const ContactUsDialog = () => {
  const t = useTranslations("contactUsDialog");
  const contentWrapper = useRef<HTMLDivElement>(null);
  const { hideContactUs, contactUs } = useVariablesStore((state) => state);
  const [location, setLocation] = useState({ lng: 44.029888, lat: 32.571888 });

  const [locations, setLocations] = useState<LocationData[]>([
    {
      phone: "+964 7823500000",
      name: "baghdad",
      location: { lng: 44.341197, lat: 33.298091 },
      active: false,
    },
    {
      phone: "+964 7800001898",
      name: "karbala",
      location: { lng: 44.029888, lat: 32.571888 },
      active: true,
    },
    {
      phone: "+968 77340577",
      name: "aman",
      location: { lng: 58.38151, lat: 23.586414 },
      active: false,
    },
  ]);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const marker = useRef<maptilersdk.Marker | null>(null);
  const zoom = 18;
  maptilersdk.config.apiKey = "f72N6kPXNkoxZe1bfWVp";

  useEffect(() => {
    if (map.current || !mapContainer.current || !contactUs) return;
    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [location.lng, location.lat],
      zoom: zoom,
    });

    marker.current = new maptilersdk.Marker({ color: "#08baa8" })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
  }, [contactUs]);

  useEffect(() => {
    if (!map.current || !marker.current) return;

    map.current.flyTo({
      center: [location.lng, location.lat],
      essential: true,
      duration: 4000,
    });

    marker.current.setLngLat([location.lng, location.lat]);
  }, [location]);

  const handleActiveLocation = (index: number) => {
    const updated = locations.map((l: LocationData) => ({
      ...l,
      active: false,
    }));

    if (updated[index]) {
      updated[index].active = true;
      setLocation(updated[index].location);
    }

    setLocations(updated);
    setLocation(updated[index].location);
  };

  const handleClose = (event: React.MouseEvent) => {
    if (
      contentWrapper.current &&
      !contentWrapper.current.contains(event.target as Node)
    ) {
      hideContactUs();
    }
  };
  return (
    <AnimatePresence>
      {contactUs && (
        <motion.div
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-0 left-0 w-full h-full bg-black/30 z-10 flex items-center justify-center"
          onClick={handleClose}
        >
          <motion.div
            className={clsx(
              "rounded-2xl text-white overflow-hidden md:flex-row flex flex-col gap-2 bg-primary w-[95%] max-w-6xl",
            )}
            initial={{ opacity: 0, y: "40%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "40%" }}
            transition={{
              stiffness: 100,
              type: "spring",
            }}
            ref={contentWrapper}
          >
            <div className="px-4 py-6 md:px-8 md:flex-1 text-5xl">
              <div className="flex items-center gap-8">
                <X
                  size={32}
                  onClick={hideContactUs}
                  className="cursor-pointer hover:text-gray-200 duration-300"
                />
                <h2 className="font-extrabold">{t("title")}</h2>
              </div>
              <div className="locations flex flex-col gap-2 mt-4 md:mt-8 md:gap-4">
                {locations.map((location, i: number) => {
                  return (
                    <li
                      className={clsx(
                        "list-none cursor-pointer bg-primary border w-[95%] transition-all duration-200 border-gray-50 rounded-xl py-2 px-4",
                        {
                          "bg-dark-primary! w-full": location.active,
                        },
                      )}
                      key={i}
                      onClick={() =>
                        map.current &&
                        !location.active &&
                        handleActiveLocation(i)
                      }
                    >
                      <div className="location flex items-center gap-4 text-2xl">
                        <MapPin size={20} />
                        <span>{t(`locations.${location.name}`)}</span>
                      </div>
                      <div className="location flex items-center gap-4 text-2xl">
                        <Phone size={20} />
                        <span style={{ direction: "ltr" }}>
                          {location.phone}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </div>
            </div>
            <div
              className={twMerge("map py-4 relative px-4 flex-1 bg-gray-300")}
            >
              <div
                ref={mapContainer}
                className={clsx("h-75 md:h-120 relative")}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
