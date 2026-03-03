import { useState, useCallback } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { UsersPage, CreateUserForm } from "@/features/users/ui";
import { useUsers } from "@/features/users/hooks";
import { createUser } from "@/features/users/services/usersApi";
import {
  getRequiredUserNameError,
  getRequiredScreenNameError,
} from "@/features/users/domain";
import { Drawer, DrawerHeader, DrawerBody } from "@/components/drawer";
import { DialogMessage } from "@/components/dialog-message";
import { Button } from "@/components/button";

const FIXED_PASSWORD = "password";

/**
 * User Management ページ（薄いエントリ。state と I/O は hook に委譲）
 * 「Create Users」押下で Drawer を表示。必須チェック・API 呼び出し・成功時は DialogMessage（コピー付き）。
 */
export default function UserManagementPageEntry() {
  const vm = useUsers();
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [screenName, setScreenName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>(undefined);
  const [successUserName, setSuccessUserName] = useState<string | null>(null);

  const userNameError = getRequiredUserNameError(userName);
  const screenNameError = getRequiredScreenNameError(screenName);

  const handleCreateUser = () => setCreateDrawerOpen(true);
  const handleCloseDrawer = useCallback(() => {
    setCreateDrawerOpen(false);
    setUserName("");
    setScreenName("");
    setServerError(undefined);
  }, []);

  const handleSave = useCallback(async () => {
    if (userNameError ?? screenNameError) return;
    setServerError(undefined);
    setIsSaving(true);
    try {
      const result = await createUser(userName, screenName);
      if (result.ok) {
        handleCloseDrawer();
        setSuccessUserName(result.userName);
        vm.refetch?.();
      } else {
        setServerError(result.message);
      }
    } catch (_e) {
      setServerError("Failed to create user.");
    } finally {
      setIsSaving(false);
    }
  }, [userName, screenName, userNameError, screenNameError, handleCloseDrawer, vm.refetch]);

  const successMessage =
    successUserName != null
      ? `UserName: ${successUserName}\nPassword: ${FIXED_PASSWORD}`
      : "";
  const copyText = successMessage;

  const handleCopy = useCallback(() => {
    if (!copyText) return;
    void navigator.clipboard.writeText(copyText);
  }, [copyText]);

  return (
    <>
      <UsersPage
        {...vm}
        onCreateUser={handleCreateUser}
      />
      <Drawer open={createDrawerOpen} onClose={handleCloseDrawer}>
        <DrawerHeader title="Create User" onClose={handleCloseDrawer} />
        <DrawerBody>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            This is the new user registration page. Please enter a UserName that
            is not already in use.
          </p>
          <CreateUserForm
            userName={userName}
            screenName={screenName}
            onUserNameChange={setUserName}
            onScreenNameChange={setScreenName}
            onSave={handleSave}
            onCancel={handleCloseDrawer}
            isSaving={isSaving}
            userNameError={userNameError}
            screenNameError={screenNameError}
            errorMessage={serverError}
          />
        </DrawerBody>
      </Drawer>

      <DialogMessage
        open={successUserName !== null}
        onClose={() => setSuccessUserName(null)}
        title="Registration completed successfully."
        message={successMessage}
        iconVariant="success"
        extraContent={
          copyText ? (
            <div className="flex justify-center">
              <Button
                type="button"
                outline
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5"
              >
                <ClipboardDocumentIcon className="size-5" aria-hidden />
                Copy
              </Button>
            </div>
          ) : undefined
        }
        primaryButton={{
          label: "OK",
          onClick: () => {},
        }}
      />
    </>
  );
}
