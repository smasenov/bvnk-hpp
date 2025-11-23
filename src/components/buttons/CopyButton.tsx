import { useEffect, useRef, useState } from 'react';
import { IconButton } from '@radix-ui/themes';
import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import styles from './CopyButton.module.scss';
import { copyToClipboard as copyToClipboardUtil } from '@/utils/clipboard';

type CopyButtonProps = {
  value: string;
  ariaLabel?: string;
  size?: '1' | '2' | '3' | '4';
  trigger?: number; // when this number changes/increments, perform copy + animate
};

const CopyButton = ({ value, ariaLabel = 'Copy', size = '1', trigger }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const handleCopy = async () => {
    await copyToClipboardUtil(value);
    setCopied(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof trigger === 'number' && trigger > 0) {
      void handleCopy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <IconButton
      type='button'
      size={size}
      variant='ghost'
      className={styles.copyButton}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        void handleCopy();
      }}>
      <span className={styles.iconWrap}>
        <CopyIcon className={clsx(styles.icon, copied ? styles.hide : styles.show)} />
        <CheckIcon className={clsx(styles.icon, copied ? styles.show : styles.hide)} />
      </span>
    </IconButton>
  );
};

export default CopyButton;
