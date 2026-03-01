import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarCropper } from "@/components/avatarcropper";
import { DialogMessage } from "@/components/dialog-message";
import { SettingsPage } from "@/features/settings/ui";
import { useSettingsForm } from "@/features/settings/hooks";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * プロフィール設定ページ（薄いエントリ。state は hook に委譲）
 * アバター変更: ファイル選択 → AvatarCropper 表示 → クロップ結果をローカル表示
 */
export default function SettingsPageEntry() {
  const navigate = useNavigate();
  const formProps = useSettingsForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCancel = useCallback(() => navigate(-1), [navigate]);
  const handlePasswordReset = useCallback(() => navigate("/password-change"), [navigate]);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleAvatarChangeClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file?.type.startsWith("image/")) return;
      readFileAsDataUrl(file).then((dataUrl) => {
        setImageToCrop(dataUrl);
        setShowCropper(true);
      });
      e.target.value = "";
    },
    [],
  );

  const handleCropComplete = useCallback((dataUrl: string) => {
    setShowCropper(false);
    setImageToCrop(null);
    setAvatarImageUrl(dataUrl);
  }, []);

  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
    setImageToCrop(null);
  }, []);

  if (formProps.isLoading) {
    return (
      <div className="p-6 max-w-xl">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  const { isLoading: _, avatarUrl, ...restFormProps } = formProps;
  /** 表示: クロップ済み未保存の画像があればそれ、なければサーバー保存の avatarUrl */
  const displayAvatarUrl = avatarImageUrl ?? avatarUrl;
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Select image file for avatar"
        onChange={handleFileChange}
      />
      <SettingsPage
        {...restFormProps}
        avatarImageUrl={displayAvatarUrl}
        pendingAvatarDataUrl={avatarImageUrl}
        onSave={async (pending) => {
          await formProps.onSave(pending);
          setAvatarImageUrl(null);
          setShowSuccessDialog(true);
        }}
        onAvatarChangeClick={handleAvatarChangeClick}
        onCancel={handleCancel}
        onPasswordReset={handlePasswordReset}
      />
      {showCropper && imageToCrop && (
        <AvatarCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      <DialogMessage
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          navigate("/home");
        }}
        title="Saved"
        message={`User information has been updated.\nUpdated user: ${formProps.userName}`}
        iconVariant="success"
        primaryButton={{
          label: "OK",
          onClick: () => {},
        }}
      />
    </>
  );
}
