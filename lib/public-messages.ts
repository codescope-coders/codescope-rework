import type { AbstractIntlMessages } from "next-intl";

/** Only client-rendered copy crosses the marketing hydration boundary.
 * Server components still read the complete catalogue with getTranslations.
 */
export function publicMessages(messages: AbstractIntlMessages): AbstractIntlMessages {
  const tourscope = messages.TourScope as AbstractIntlMessages;
  const home = messages.Home as AbstractIntlMessages;
  const hero = home.hero as AbstractIntlMessages;
  const contact = messages.Contact as AbstractIntlMessages;
  return {
    common: messages.common, Nav: messages.Nav, Jobs: messages.Jobs,
    GetStarted: messages.GetStarted,
    Home: { hero: { preview: hero.preview } },
    Contact: { form: contact.form },
    TourScope: {
      preview: tourscope.preview, slices: tourscope.slices,
      deepDive: Object.fromEntries(Object.entries(tourscope.deepDive as AbstractIntlMessages).map(([key, value]) => {
        if (typeof value === "object" && value !== null && "slice" in value) return [key, { slice: value.slice }];
        return [key, value]; // Rail section labels are client-rendered too.
      })),
    },
  };
}
