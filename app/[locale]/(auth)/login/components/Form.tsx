"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useLogin } from "@/hooks/useAdmin";
import clsx from "clsx";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";

export const Form = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { mutate, isPending, error } = useLogin((msg) => {
    toast.success(msg);
    router.push("/dashboard");
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    mutate({
      email: form.get("email"),
      password: form.get("password"),
    });
  };

  return (
    <form
      className="w-[90%] max-w-xl bg-white border border-gray-200 px-8 py-5 rounded-lg shadow-md space-y-6"
      onSubmit={handleSubmit}
    >
      <h1 className="font-bold text-xl text-center">
        Login to the <span className="text-primary">Dashboard</span>
      </h1>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          placeholder="Enter your email"
          id="email"
          type="email"
          name="email"
          size={"sm"}
          icon={<Mail />}
          error={[
            (error as { fieldErrors?: { email?: string } })?.fieldErrors?.email,
          ]}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative w-full">
          <Input
            placeholder="Type your password"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            size={"sm"}
            icon={<Key />}
            max={50}
            error={[
              (error as { fieldErrors?: { password?: string } })?.fieldErrors
                ?.password,
            ]}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={clsx(
              "absolute h-10 overflow-hidden cursor-pointer top-0 end-0 w-10 border-s-input rounded-e-md border-s hover:bg-primary/10",
              {
                "border-s-invalid-color": (
                  error as { fieldErrors?: { password?: string } }
                )?.fieldErrors?.password,
              },
            )}
          >
            <AnimatePresence>
              {showPassword && (
                <motion.div
                  key="eye-off"
                  exit={{ y: "-100%", opacity: 0 }}
                  initial={{ y: "-100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                >
                  <EyeOff width={20} />
                </motion.div>
              )}
              {!showPassword && (
                <motion.div
                  key="eye-on"
                  exit={{ y: "100%", opacity: 0 }}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                >
                  <Eye width={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
      <Button className="w-full" disabled={isPending}>
        <AnimatePresence>
          <motion.div>
            Submit
            {isPending && (
              <motion.span
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                initial={{ y: "100%", opacity: 0 }}
              >
                ing
                <span style={{ display: "inline-flex", gap: 4 }}>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    .
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  >
                    .
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  >
                    .
                  </motion.span>
                </span>
              </motion.span>
            )}
          </motion.div>
        </AnimatePresence>
      </Button>
    </form>
  );
};
