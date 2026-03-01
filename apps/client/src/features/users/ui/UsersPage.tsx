import type { FC } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/button";
import { UserAvatar } from "@/components/user-avatar";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/table";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
} from "@/components/dropdown";
import type { UsersPageProps } from "../types";

/**
 * Presentational: User Management 一覧
 * - I/O 禁止。表示・アクションはすべて props で受け取る
 */
export const UsersPage: FC<UsersPageProps> = ({
  items,
  isLoading,
  errorMessage,
  onCreateUser,
  onPasswordReset,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-6" role="alert">
        <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-white">
            Users Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            User registration, deletion, and password reset functions
          </p>
        </div>
        {onCreateUser && (
          <Button onClick={onCreateUser}>Create Users</Button>
        )}
      </div>

      <div className="mt-6">
        <Table
          className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]"
        >
          <TableHead>
            <TableRow>
              <TableHeader>Avatar</TableHeader>
              <TableHeader>UserName</TableHeader>
              <TableHeader>ScreenName</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader className="relative w-0">
                <span className="sr-only">Actions</span>
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-500">
                  No users yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <UserAvatar user={user} className="size-9 shrink-0" />
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.userName}
                  </TableCell>
                  <TableCell>{user.screenName}</TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400">
                    {user.role}
                  </TableCell>
                  <TableCell>
                    <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                      <Dropdown>
                        <DropdownButton
                          plain
                          aria-label="More options"
                        >
                          <EllipsisHorizontalIcon />
                        </DropdownButton>
                        <DropdownMenu anchor="bottom end">
                          <DropdownItem
                            onClick={() => onPasswordReset?.(user.id)}
                          >
                            Password Reset
                          </DropdownItem>
                          <DropdownItem onClick={() => onDelete?.(user.id)}>
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
