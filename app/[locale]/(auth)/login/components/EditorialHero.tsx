import { getTranslations } from "next-intl/server";

/** The existing scope mark is the illustration; no new renderer or image load. */
export async function EditorialHero() {
  const t = await getTranslations("auth");
  return (
    <aside className="auth-editorial">
      <div className="auth-editorial-copy">
        <p className="auth-eyebrow">{t("panel_eyebrow")}</p>
        <h2>{t("panel_heading")}<br /><span>{t("panel_accent")}</span></h2>
        <p className="auth-editorial-description">{t("panel_summary")}</p>
      </div>
      <div className="auth-scope-art" aria-hidden="true">
        <div className="auth-scope-grid" />
        <span className="auth-scope-echo auth-scope-echo-back" />
        <span className="auth-scope-echo auth-scope-echo-front" />
        <span className="auth-scope-mark" />
        <span className="auth-scope-axis" />
      </div>
      <p className="auth-editorial-caption">{t("panel_caption")}</p>
    </aside>
  );
}
