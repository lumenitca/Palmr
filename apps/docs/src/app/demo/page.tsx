"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Palmtree } from "lucide-react";
import { motion } from "motion/react";

import { BackgroundLights } from "@/components/ui/background-lights";
import { Button } from "@/components/ui/button";

interface DemoStatus {
  status: "waiting" | "ready";
  url: string | null;
}

interface CreateDemoResponse {
  message: string;
  url: string | null;
}

export default function DemoPage() {
  const searchParams = useSearchParams();
  const demoId = searchParams.get("id");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateAccess = () => {
      const storedToken = sessionStorage.getItem("demo_token");
      const storedId = sessionStorage.getItem("demo_id");
      const expiresAt = sessionStorage.getItem("demo_expires");

      if (!demoId || !token || !storedToken || !storedId || !expiresAt) {
        return false;
      }

      if (token !== storedToken || demoId !== storedId || Date.now() > parseInt(expiresAt)) {
        return false;
      }

      return true;
    };

    if (!validateAccess()) {
      setError("Unauthorized access. Please use the Live Demo button to access this page.");
      setIsLoading(false);
      return;
    }

    const createDemo = async () => {
      try {
        const response = await fetch("https://palmr-demo-manager.kyantech.com.br/create-demo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            palmr_demo_instance_id: demoId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create demo");
        }

        const data: CreateDemoResponse = await response.json();
        console.log("Demo creation response:", data);
      } catch (err) {
        console.error("Error creating demo:", err);
        setError("Failed to create demo. Please try again.");
        setIsLoading(false);
      }
    };

    const checkStatus = async () => {
      try {
        const response = await fetch(`https://palmr-demo-manager.kyantech.com.br/status/${demoId}`);

        if (!response.ok) {
          throw new Error("Failed to check demo status");
        }

        const data: DemoStatus = await response.json();
        setStatus(data);

        if (data.status === "ready" && data.url) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error checking status:", err);
        setError("Failed to check demo status. Please try again.");
        setIsLoading(false);
      }
    };

    createDemo();

    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds

    checkStatus();

    return () => {
      clearInterval(interval);
      sessionStorage.removeItem("demo_token");
      sessionStorage.removeItem("demo_id");
      sessionStorage.removeItem("demo_expires");
    };
  }, [demoId, token]);

  const handleGoToDemo = () => {
    if (status?.url) {
      window.open(status.url, "_blank");
    }
    window.location.href = "/";
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-background">
        <BackgroundLights />
        <div className="relative flex flex-col items-center justify-center h-full">
          <div className="text-center space-y-6 max-w-md">
            <h1 className="text-2xl font-bold text-destructive">Error</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button
              onClick={() => {
                sessionStorage.removeItem("demo_token");
                sessionStorage.removeItem("demo_id");
                sessionStorage.removeItem("demo_expires");
                window.location.href = "/";
              }}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background">
        <BackgroundLights />
        <div className="relative flex flex-col items-center justify-center h-full">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Your demo is being generated, please wait...</h1>
              <p className="text-muted-foreground max-w-lg">
                This demo will be available for 30 minutes for testing. After that, all data will be permanently deleted
                and become inaccessible. You can test Palmr. with a 300MB storage limit.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background">
      <BackgroundLights />
      <div className="relative flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-7xl px-6 flex-grow"
        >
          <section className="relative flex flex-col items-center justify-center gap-6 m-auto h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block max-w-xl text-center justify-center"
            >
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-4xl lg:text-3xl font-semibold tracking-tight text-primary"
                  >
                    Your demo is ready!
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-3xl leading-9 font-semibold tracking-tight"
                  >
                    Click the button below to test
                  </motion.span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <Button onClick={handleGoToDemo} className="flex items-center gap-2 px-8 py-4 text-lg">
                  <Palmtree className="h-5 w-5" />
                  Go to Palmr. Demo
                </Button>
              </motion.div>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
