import { useContext } from "react";
import { Trans } from "react-i18next";
import { StepContext } from "../step";
import styles from "./radiogroup.module.css";

interface RadiogroupProps {
  id: string;
  defaultValue?: boolean;
  onChange: (value: boolean) => void;
}

export const Radiogroup: React.FC<RadiogroupProps> = ({
  id,
  defaultValue,
  onChange,
}) => {
  const { stepActive } = useContext(StepContext);
  return (
    <div className={styles.container}>
      <input
        name={id}
        id={`${id}False`}
        type="radio"
        className={styles.radio}
        checked={!defaultValue}
        disabled={!stepActive}
        onChange={() => onChange(false)}
      />
      <label htmlFor={`${id}False`}>
        <Trans i18nKey={`label.${id}.false`} />
      </label>
      <input
        name={id}
        id={`${id}True`}
        type="radio"
        className={styles.radio}
        checked={defaultValue ?? false}
        disabled={!stepActive}
        onChange={() => onChange(true)}
      />
      <label htmlFor={`${id}True`}>
        <Trans i18nKey={`label.${id}.true`} />
      </label>
    </div>
  );
};