import { useState } from "react";
import { UsersPage } from "@/features/users/ui";
import { useUsers } from "@/features/users/hooks";
import { Drawer, DrawerHeader, DrawerBody } from "@/components/drawer";

/**
 * User Management ページ（薄いエントリ。state と I/O は hook に委譲）
 * 「Create Users」押下で Drawer を表示する。
 */
export default function UserManagementPageEntry() {
  const vm = useUsers();
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

  const handleCreateUser = () => setCreateDrawerOpen(true);
  const handleCloseDrawer = () => setCreateDrawerOpen(false);

  return (
    <>
      <UsersPage
        {...vm}
        onCreateUser={handleCreateUser}
      />
      <Drawer open={createDrawerOpen} onClose={handleCloseDrawer}>
        <DrawerHeader title="Create User" onClose={handleCloseDrawer} />
        <DrawerBody>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            ユーザー作成フォームはここに配置します。（TODO）
          </p>
        </DrawerBody>
      </Drawer>
    </>
  );
}
