"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { getCurrentUser } from "@/lib/auth";
import QREditForm from "@/components/QREditForm";
import styles from "./edit.module.css";

export default function EditQRPage() {
  const params = useParams();
  const router = useRouter();
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQRCode() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const supabase = createClient();
        const { data, error } = await supabase
          .from("qrcodes")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data.type !== "dynamic") {
          setError("Only dynamic QR codes can be edited");
          return;
        }

        setQrCode(data);
      } catch (error) {
        console.error("Error loading QR code:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadQRCode();
    }
  }, [params.id, router]);

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading QR code...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleCancel} className={styles.button}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>QR Code Not Found</h2>
          <p>
            The QR code you&apos;re trying to edit doesn&apos;t exist or you
            don&apos;t have permission to edit it.
          </p>
          <button onClick={handleCancel} className={styles.button}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit QR Code</h1>
        <p>Update the target URL for your dynamic QR code</p>
      </div>

      <QREditForm
        qrCode={qrCode}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
