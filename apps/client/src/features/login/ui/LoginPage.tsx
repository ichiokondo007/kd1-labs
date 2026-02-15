import type { FC } from "react";
import { useLogin } from "../hooks";

/**
 * ui は Presentational を目指す
 * - I/O禁止（fetch/axios直呼び出し禁止）
 * - 複雑な業務判断は domain に寄せる
 */

export const LoginPage: FC = () => {
  const vm = useLogin();

  if (vm.isLoading) return <div>Loading...</div>;
  if (vm.errorMessage) return <div role="alert">{vm.errorMessage}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Login Feature</h1>

      {vm.items.length === 0 ? (
        <p>データがありません</p>
      ) : (
        <ul>
          {vm.items.map((it) => (
            <li key={it.id}>
              <span>{it.title}</span>
              <small style={{ marginLeft: 8 }}>{it.createdAt}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};