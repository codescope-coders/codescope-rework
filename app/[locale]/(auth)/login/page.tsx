import { getTranslations } from "next-intl/server";
import { LockKeyhole } from "lucide-react";
import { EditorialHero } from "./components/EditorialHero";
import { LoginForm } from "./components/LoginForm";
import { LoginFooter } from "./components/LoginFooter";
import { LoginShell } from "./components/LoginShell";

export default async function LoginPage() {
  const t = await getTranslations("auth");
  return (
    <LoginShell>
      <main className="auth-main">
        <EditorialHero />
        <section className="auth-form-panel" aria-label={t("login_title")}>
          <div className="auth-form-content">
            <p className="auth-eyebrow mb-5">{t("workspace_label")}</p>
            <LoginForm />
            <p className="auth-access-note"><LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />{t("access_note")}</p>
          </div>
        </section>
      </main>
      <footer className="auth-footer"><LoginFooter /></footer>
    </LoginShell>
  );
}
