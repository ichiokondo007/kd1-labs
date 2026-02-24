import { SettingsPage } from "@/features/settings/ui";
import { useSettingsForm } from "@/features/settings/hooks";

/**
 * プロフィール設定ページ（薄いエントリ。state は hook に委譲）
 */
export default function SettingsPageEntry() {
  const props = useSettingsForm();

  if (props.isLoading) {
    return (
      <div className="p-6 max-w-xl">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  const { isLoading: _, ...formProps } = props;
  return <SettingsPage {...formProps} />;
}
