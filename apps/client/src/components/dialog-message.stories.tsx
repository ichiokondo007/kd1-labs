import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DialogMessage } from "./dialog-message";
import { Button } from "./button";

const meta = {
  title: "Components/DialogMessage",
  component: DialogMessage,
  tags: ["autodocs"],
  argTypes: {
    iconVariant: {
      control: "select",
      options: ["none", "success", "warning", "error", "info"],
    },
  },
} satisfies Meta<typeof DialogMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

/** ボタン1つ */
export const OneButton: Story = {
  render: function OneButtonStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <DialogMessage
          open={open}
          onClose={() => setOpen(false)}
          title="完了"
          message="処理が正常に完了しました。"
          primaryButton={{
            label: "OK",
            onClick: () => {},
          }}
        />
      </>
    );
  },
};

/** ボタン1つ ＋ 成功アイコン */
export const OneButtonWithSuccessIcon: Story = {
  render: function OneButtonWithSuccessIconStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open success</Button>
        <DialogMessage
          open={open}
          onClose={() => setOpen(false)}
          title="Payment successful"
          message="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius aliquam laudantium explicabo pariatur iste dolorem animi vitae error totam."
          iconVariant="success"
          primaryButton={{
            label: "OK",
            onClick: () => {},
          }}
        />
      </>
    );
  },
};

/** ボタン2つ */
export const TwoButtons: Story = {
  render: function TwoButtonsStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <DialogMessage
          open={open}
          onClose={() => setOpen(false)}
          title="確認"
          message="この操作を実行しますか？取り消せません。"
          primaryButton={{
            label: "実行する",
            onClick: () => {},
          }}
          secondaryButton={{
            label: "キャンセル",
            onClick: () => {},
          }}
        />
      </>
    );
  },
};

/** ボタン2つ ＋ 警告アイコン */
export const TwoButtonsWithWarningIcon: Story = {
  render: function TwoButtonsWithWarningIconStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open warning</Button>
        <DialogMessage
          open={open}
          onClose={() => setOpen(false)}
          title="削除の確認"
          message="このユーザーを削除します。この操作は取り消せません。"
          iconVariant="warning"
          primaryButton={{
            label: "削除する",
            onClick: () => {},
          }}
          secondaryButton={{
            label: "キャンセル",
            onClick: () => {},
          }}
        />
      </>
    );
  },
};

/** エラー表示 */
export const ErrorMessage: Story = {
  render: function ErrorMessageStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open error</Button>
        <DialogMessage
          open={open}
          onClose={() => setOpen(false)}
          title="エラー"
          message="保存に失敗しました。しばらくしてから再度お試しください。"
          iconVariant="error"
          primaryButton={{
            label: "閉じる",
            onClick: () => {},
          }}
        />
      </>
    );
  },
};
