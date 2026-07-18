import { EditorialHero } from "./components/EditorialHero";
import { LoginForm } from "./components/LoginForm";
import { LoginFooter } from "./components/LoginFooter";

/**
 * Editorial login — a type-forward brand column on the left, the email → OTP
 * form on the right. One centered container so margins stay symmetric at every
 * width; stacks to a tidy column when narrow, opens into hero-left / form-right
 * at `lg`.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background px-6 sm:px-10">
      <main className="mx-auto flex w-full max-w-md flex-1 items-center py-14 lg:max-w-5xl">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <EditorialHero />
          <div className="w-full lg:max-w-sm lg:justify-self-end">
            <LoginForm />
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-md border-t border-border py-5 lg:max-w-5xl">
        <LoginFooter />
      </footer>
    </div>
  );
}
