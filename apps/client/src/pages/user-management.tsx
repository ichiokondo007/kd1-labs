import { UsersPage } from "@/features/users/ui";
import { useUsers } from "@/features/users/hooks";

/**
 * User Management ページ（薄いエントリ。state と I/O は hook に委譲）
 */
export default function UserManagementPageEntry() {
  const vm = useUsers();
  return <UsersPage {...vm} />;
}
