import { Button, Divider, Modal } from 'antd';

export type PasswordModalProps = {
  password?: string | null;
  onClose?: () => void;
};
export function PasswordModal({ password, onClose }: PasswordModalProps) {
  return (
    <Modal
      open={password != null}
      title='새 비밀번호'
      cancelText={null}
      onCancel={onClose}
      footer={[
        <Button
          key='close'
          danger
          onClick={onClose}
        >
          닫기
        </Button>,
      ]}
    >
      <p>{password}</p>
      <Divider />
      <p className='text-red-400'>
        이 창을 닫은 뒤에는 위 비밀번호를 다시 볼 수 없습니다.
      </p>
    </Modal>
  );
}
